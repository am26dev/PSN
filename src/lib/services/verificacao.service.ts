import "server-only";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  iniciarVerificacaoSchema,
  revisaoVerificacaoSchema,
} from "@/lib/validacao";
import { normalizarDocumento } from "@/lib/documento";
import { guardarFicheiro } from "@/lib/armazenamento";
import { analisarVerificacao } from "@/lib/verificacao/analise";
import { ServiceError } from "./http";
import type { Utente } from "@prisma/client";

export type IniciarVerificacaoInput = z.infer<typeof iniciarVerificacaoSchema>;
export type RevisaoVerificacaoInput = z.infer<typeof revisaoVerificacaoSchema>;

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAX = 8 * 1024 * 1024; // 8 MB
const CAMPO_POR_TIPO = {
  FRENTE: "imagemFrenteKey",
  VERSO: "imagemVersoKey",
  SELFIE: "selfieKey",
} as const;

/** Inicia (ou retoma) o processo de verificação de identidade do utente. */
export async function iniciar(
  utente: Utente,
  d: IniciarVerificacaoInput,
): Promise<{ id: string }> {
  const aprovada = await prisma.verificacao.findFirst({
    where: { utenteId: utente.id, estado: "APROVADO" },
  });
  if (aprovada) {
    throw new ServiceError(409, "A sua identidade já está verificada.");
  }

  const pendente = await prisma.verificacao.findFirst({
    where: { utenteId: utente.id, estado: "PENDENTE" },
  });

  const dados = {
    tipoDocumento: d.tipoDocumento,
    numeroDocumento: normalizarDocumento(d.numeroDocumento),
    nomeCompleto: d.nomeCompleto,
    dataNascimento: d.dataNascimento || null,
    nacionalidade: d.nacionalidade || (d.tipoDocumento === "BI" ? "Angolana" : null),
  };

  const verificacao = pendente
    ? await prisma.verificacao.update({ where: { id: pendente.id }, data: dados })
    : await prisma.verificacao.create({
        data: {
          utenteId: utente.id,
          ...dados,
          eventos: { create: { evento: "VERIFICACAO_INICIADA" } },
        },
      });

  return { id: verificacao.id };
}

/** Carrega uma imagem (frente/verso/selfie) para a verificação do utente. */
export async function carregarImagem(
  utente: Utente,
  verificacaoId: string,
  tipo: string,
  ficheiro: File,
): Promise<{ key: string }> {
  const campo = (CAMPO_POR_TIPO as Record<string, string>)[tipo.toUpperCase()];
  if (!campo) throw new ServiceError(422, "Tipo de imagem inválido.");
  if (!(ficheiro instanceof File)) throw new ServiceError(422, "Ficheiro em falta.");
  if (!TIPOS_PERMITIDOS.includes(ficheiro.type)) {
    throw new ServiceError(422, "Formato não suportado. Use JPEG, PNG ou WebP.");
  }
  if (ficheiro.size > TAMANHO_MAX) {
    throw new ServiceError(422, "Imagem demasiado grande (máx. 8 MB).");
  }

  const verificacao = await prisma.verificacao.findFirst({
    where: { id: verificacaoId, utenteId: utente.id },
  });
  if (!verificacao) throw new ServiceError(404, "Verificação não encontrada.");
  if (verificacao.estado !== "PENDENTE") {
    throw new ServiceError(409, "Esta verificação já foi submetida.");
  }

  const buffer = Buffer.from(await ficheiro.arrayBuffer());
  const key = await guardarFicheiro(buffer, ficheiro.type);
  await prisma.verificacao.update({ where: { id: verificacao.id }, data: { [campo]: key } });
  return { key };
}

/** Submete a verificação para análise (automática ou manual). */
export async function submeter(
  utente: Utente,
  verificacaoId: string,
): Promise<{ estado: string }> {
  const verificacao = await prisma.verificacao.findFirst({
    where: { id: verificacaoId, utenteId: utente.id },
  });
  if (!verificacao) throw new ServiceError(404, "Verificação não encontrada.");
  if (verificacao.estado !== "PENDENTE") throw new ServiceError(409, "Já submetida.");

  const exigeVerso = verificacao.tipoDocumento !== "PASSAPORTE";
  if (!verificacao.imagemFrenteKey || !verificacao.selfieKey) {
    throw new ServiceError(422, "Falta a imagem do documento ou a selfie.");
  }
  if (exigeVerso && !verificacao.imagemVersoKey) {
    throw new ServiceError(422, "Falta a imagem do verso do documento.");
  }

  const analise = await analisarVerificacao({
    tipoDocumento: verificacao.tipoDocumento,
    numeroDocumento: verificacao.numeroDocumento,
    temFrente: !!verificacao.imagemFrenteKey,
    temVerso: !!verificacao.imagemVersoKey,
    temSelfie: !!verificacao.selfieKey,
  });

  const atualizada = await prisma.verificacao.update({
    where: { id: verificacao.id },
    data: {
      estado: analise.estadoSugerido,
      ocrDados: analise.ocrDados,
      resultadoBiometria: analise.resultadoBiometria,
      pontuacaoRisco: analise.pontuacaoRisco,
      eventos: {
        create: {
          evento: "VERIFICACAO_SUBMETIDA",
          metadata: { automatica: analise.automatica, pontuacaoRisco: analise.pontuacaoRisco },
        },
      },
    },
  });

  return { estado: atualizada.estado };
}

/** Aprova ou rejeita uma verificação (apenas administradores). */
export async function rever(
  admin: Utente,
  id: string,
  d: RevisaoVerificacaoInput,
): Promise<{ estado: string }> {
  const verificacao = await prisma.verificacao.findUnique({ where: { id } });
  if (!verificacao) throw new ServiceError(404, "Verificação não encontrada.");
  if (verificacao.estado === "APROVADO" || verificacao.estado === "REJEITADO") {
    throw new ServiceError(409, "Verificação já revista.");
  }
  if (d.acao === "REJEITAR" && !d.motivo) {
    throw new ServiceError(422, "Indique o motivo da rejeição.");
  }

  const aprovar = d.acao === "APROVAR";
  const novoEstado = aprovar ? "APROVADO" : "REJEITADO";

  await prisma.$transaction(async (tx) => {
    await tx.verificacao.update({
      where: { id },
      data: {
        estado: novoEstado,
        motivoRejeicao: aprovar ? null : d.motivo,
        revistoPorId: admin.id,
        revistoEm: new Date(),
        eventos: {
          create: {
            evento: aprovar ? "VERIFICACAO_APROVADA" : "VERIFICACAO_REJEITADA",
            metadata: { revistoPor: admin.id, motivo: d.motivo ?? null },
          },
        },
      },
    });
    if (aprovar) {
      await tx.utente.update({ where: { id: verificacao.utenteId }, data: { verificado: true } });
    }
  });

  return { estado: novoEstado };
}

/**
 * Garante que o utente pode aceder a uma imagem de verificação (dono ou admin).
 * Lança ServiceError(404/403) se não. Não devolve dados — a leitura do ficheiro
 * fica a cargo do handler.
 */
export async function exigirAcessoImagem(utente: Utente, key: string): Promise<void> {
  const verificacao = await prisma.verificacao.findFirst({
    where: {
      OR: [
        { imagemFrenteKey: key },
        { imagemVersoKey: key },
        { selfieKey: key },
      ],
    },
    select: { utenteId: true },
  });
  if (!verificacao) throw new ServiceError(404, "Imagem não encontrada.");
  const ehDono = verificacao.utenteId === utente.id;
  const ehAdmin = utente.papel === "ADMIN";
  if (!ehDono && !ehAdmin) throw new ServiceError(403, "Acesso negado.");
}

// ── Leituras ────────────────────────────────────────────────────────────────

export type EstadoVerificacaoFiltro =
  | "EM_ANALISE"
  | "APROVADO"
  | "REJEITADO"
  | "PENDENTE";

/** Última verificação de um utente (página "A minha conta"). */
export async function obterVerificacaoDoUtente(utenteId: string) {
  return prisma.verificacao.findFirst({
    where: { utenteId },
    orderBy: { criadoEm: "desc" },
  });
}

/** Detalhe completo de uma verificação para revisão (admin). */
export async function obterVerificacaoDetalhe(id: string) {
  return prisma.verificacao.findUnique({
    where: { id },
    include: {
      utente: { select: { nomeCompleto: true, numeroDocumento: true, email: true } },
      eventos: { orderBy: { criadoEm: "asc" } },
    },
  });
}

/** Contagem de verificações por filtro (painel admin). */
export async function contarVerificacoes(where: Prisma.VerificacaoWhereInput = {}) {
  return prisma.verificacao.count({ where });
}

/** Listagem de verificações para a fila de revisão (admin). */
export async function listarVerificacoes(estado?: string) {
  const where: Prisma.VerificacaoWhereInput =
    estado === "EM_ANALISE" || estado === "APROVADO" || estado === "REJEITADO" || estado === "PENDENTE"
      ? { estado }
      : {};
  return prisma.verificacao.findMany({
    where,
    include: { utente: { select: { nomeCompleto: true } } },
    orderBy: [{ estado: "asc" }, { criadoEm: "desc" }],
    take: 100,
  });
}
