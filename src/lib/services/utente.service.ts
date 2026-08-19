import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ── Leituras de utentes ─────────────────────────────────────────────────────
// As páginas (server components) consomem estas funções em vez de chamar
// `prisma` diretamente, mantendo o mesmo princípio dos route handlers:
// acesso a dados e regras de negócio vivem nos services.

/** Lista de utentes para a administração (mais recentes, limitado). */
export async function listarUtentes() {
  return prisma.utente.findMany({
    orderBy: { criadoEm: "desc" },
    take: 200,
    select: {
      id: true,
      nomeCompleto: true,
      numeroDocumento: true,
      papel: true,
      verificado: true,
      ativo: true,
    },
  });
}

/** Contagem de utentes por filtro (painel/admin). */
export async function contarUtentes(where: Prisma.UtenteWhereInput = {}) {
  return prisma.utente.count({ where });
}

/** Obter um utente por id. */
export async function obterUtente(id: string) {
  return prisma.utente.findUnique({ where: { id } });
}

/** Buscar paciente por número de documento ou NIF (portal do médico). */
export async function buscarPaciente(termo: string, doc?: string) {
  return prisma.utente.findFirst({
    where: {
      OR: [
        ...(doc ? [{ numeroDocumento: doc }] : []),
        { numeroDocumento: termo },
        { nif: termo },
      ],
    },
    select: {
      id: true,
      nomeCompleto: true,
      numeroDocumento: true,
      tipoDocumento: true,
      nif: true,
      dataNascimento: true,
      sexo: true,
      telefone: true,
      provincia: true,
      municipio: true,
    },
  });
}

/** Ficha completa de um paciente para o médico (com histórico). */
export async function obterPacienteCompleto(id: string) {
  return prisma.utente.findUnique({
    where: { id },
    include: {
      fichaSaude: true,
      consultas: { orderBy: { data: "desc" } },
      exames: { orderBy: { data: "desc" } },
      patologias: { orderBy: { criadoEm: "desc" } },
    },
  });
}
