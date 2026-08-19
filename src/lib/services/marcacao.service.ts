import "server-only";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "./http";
import { marcacaoSchema } from "@/lib/validacao";
import { precoConsulta } from "@/lib/precos";
import {
  iniciarCobranca,
  dadosPagamentoDaCobranca,
} from "@/lib/pagamentos/cobranca";
import type { Utente } from "@prisma/client";

export type MarcacaoInput = z.infer<typeof marcacaoSchema>;

export async function criarMarcacao(
  utente: Utente,
  d: MarcacaoInput,
): Promise<{ id: string; pagamento: unknown }> {
  const unidade = await prisma.unidade.findUnique({ where: { id: d.unidadeId } });
  if (!unidade || !unidade.ativo) {
    throw new ServiceError(404, "Unidade não encontrada.");
  }

  if (d.dependenteId) {
    const dependente = await prisma.dependente.findFirst({
      where: { id: d.dependenteId, responsavelId: utente.id },
    });
    if (!dependente) throw new ServiceError(403, "Dependente inválido.");
  }

  const data = new Date(d.dataHora);
  if (data.getTime() < Date.now()) {
    throw new ServiceError(422, "A data da consulta tem de ser no futuro.");
  }
  if (d.metodoPagamento === "SEGURO_SAUDE" && !utente.seguradoraId) {
    throw new ServiceError(
      422,
      "Não tem um seguro de saúde associado à sua conta.",
    );
  }
  const telefone = d.telefone || utente.telefone || undefined;
  if (d.metodoPagamento === "MULTICAIXA_EXPRESS" && !telefone) {
    throw new ServiceError(422, "Indique o telemóvel para a cobrança Multicaixa Express.");
  }

  const valorCentimos = precoConsulta(unidade.tipo);
  const isento = d.metodoPagamento === "SEGURO_SAUDE";

  const marcacao = await prisma.marcacao.create({
    data: {
      utenteId: utente.id,
      unidadeId: d.unidadeId,
      dependenteId: d.dependenteId ?? null,
      dataHora: data,
      especialidadeId: d.especialidadeId ?? null,
      medicoId: d.medicoId ?? null,
      motivo: d.motivo ?? null,
      referenciaMedica: d.referenciaMedica ?? null,
      estado: isento ? "CONFIRMADA" : "PENDENTE",
      pagamento: {
        create: {
          metodo: d.metodoPagamento,
          valorCentimos,
          estado: isento ? "ISENTO" : "AGUARDA",
        },
      },
    },
    include: { pagamento: true },
  });

  let pagamento: unknown = null;
  if (!isento && marcacao.pagamento) {
    try {
      const cobranca = await iniciarCobranca(d.metodoPagamento, {
        valorCentimos,
        referenciaInterna: `MARCACAO:${marcacao.id}`,
        telefone,
        descricao: `Consulta ${unidade.nome}`,
      });
      if (cobranca) {
        await prisma.pagamento.update({
          where: { id: marcacao.pagamento.id },
          data: dadosPagamentoDaCobranca(cobranca),
        });
        pagamento = dadosPagamentoDaCobranca(cobranca);
      }
    } catch (e) {
      console.error("Falha ao iniciar cobrança (marcação criada):", e);
    }
  }

  return { id: marcacao.id, pagamento };
}

export async function remarcar(
  utente: Utente,
  id: string,
  d: MarcacaoInput,
): Promise<void> {
  const marcacao = await prisma.marcacao.findFirst({
    where: { id, utenteId: utente.id },
    include: { pagamento: true },
  });
  if (!marcacao) throw new ServiceError(404, "Marcação não encontrada.");
  if (marcacao.estado === "CONCLUIDA" || marcacao.estado === "CANCELADA") {
    throw new ServiceError(409, "Esta marcação já não pode ser alterada.");
  }

  const unidade = await prisma.unidade.findUnique({ where: { id: d.unidadeId } });
  if (!unidade || !unidade.ativo) {
    throw new ServiceError(404, "Unidade não encontrada.");
  }
  const data = new Date(d.dataHora);
  if (data.getTime() < Date.now()) {
    throw new ServiceError(422, "A data da consulta tem de ser no futuro.");
  }

  await prisma.marcacao.update({
    where: { id },
    data: {
      unidadeId: d.unidadeId,
      dependenteId: d.dependenteId ?? null,
      dataHora: data,
      especialidadeId: d.especialidadeId ?? null,
      medicoId: d.medicoId ?? null,
      motivo: d.motivo ?? null,
      referenciaMedica: d.referenciaMedica ?? null,
    },
  });
}

export async function cancelarMarcacao(utente: Utente, id: string): Promise<void> {
  const marcacao = await prisma.marcacao.findFirst({
    where: { id, utenteId: utente.id },
  });
  if (!marcacao) throw new ServiceError(404, "Marcação não encontrada.");
  if (marcacao.estado === "CONCLUIDA") {
    throw new ServiceError(409, "Não é possível cancelar uma consulta já realizada.");
  }
  await prisma.marcacao.update({ where: { id }, data: { estado: "CANCELADA" } });
}

/** Marcação ativa do utente numa unidade (para oferecer "Remarcar"). */
export async function marcacaoAtivaDoUtente(utenteId: string, unidadeId: string) {
  return prisma.marcacao.findFirst({
    where: {
      utenteId,
      unidadeId,
      estado: { in: ["PENDENTE", "CONFIRMADA"] },
    },
    orderBy: { dataHora: "desc" },
  });
}

/** Marcação a remarcar, garantindo que pertence ao utente e à unidade. */
export async function obterMarcacaoParaRemarcar(
  utenteId: string,
  unidadeId: string,
  marcacaoId: string,
) {
  return prisma.marcacao.findFirst({
    where: { id: marcacaoId, utenteId, unidadeId },
  });
}

/** Marcações de um utente (página "A minha conta"). */
export async function listarMarcacoesDoUtente(utenteId: string, limit = 20) {
  return prisma.marcacao.findMany({
    where: { utenteId },
    include: {
      unidade: true,
      especialidade: true,
      medico: true,
      dependente: true,
      pagamento: true,
    },
    orderBy: { dataHora: "desc" },
    take: limit,
  });
}

/** Marcações recentes para o painel admin (com unidade e nome do utente). */
export async function listarMarcacoesRecentes(limit = 6) {
  return prisma.marcacao.findMany({
    orderBy: { criadoEm: "desc" },
    take: limit,
    include: { unidade: true, utente: { select: { nomeCompleto: true } } },
  });
}

/** Contagem de marcações por filtro (painel admin). */
export async function contarMarcacoes(where: Prisma.MarcacaoWhereInput = {}) {
  return prisma.marcacao.count({ where });
}
