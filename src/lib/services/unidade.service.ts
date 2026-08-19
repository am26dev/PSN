import "server-only";
import { z } from "zod";
import { unstable_cache } from "next/cache";
import type { Prisma, TipoUnidade } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { unidadeSchema } from "@/lib/validacao";
import { ServiceError } from "./http";

export type UnidadeInput = z.infer<typeof unidadeSchema>;

/** Cria uma unidade (administração). */
export async function criar(d: UnidadeInput): Promise<{ id: string }> {
  const unidade = await prisma.unidade.create({
    data: {
      nome: d.nome,
      tipo: d.tipo,
      provincia: d.provincia,
      municipio: d.municipio,
      morada: d.morada || null,
      telefone: d.telefone || null,
      horario: d.horario || null,
      urgencia24h: d.urgencia24h ?? false,
      logoUrl: d.logoUrl || null,
      bannerUrl: d.bannerUrl || null,
      descricao: d.descricao || null,
      ativo: d.ativo ?? true,
    },
  });
  return { id: unidade.id };
}

/** Atualiza os campos fornecidos de uma unidade (administração). */
export async function atualizar(id: string, d: Partial<UnidadeInput>): Promise<void> {
  const existe = await prisma.unidade.findUnique({ where: { id } });
  if (!existe) throw new ServiceError(404, "Unidade não encontrada.");
  await prisma.unidade.update({
    where: { id },
    data: {
      ...(d.nome !== undefined && { nome: d.nome }),
      ...(d.tipo !== undefined && { tipo: d.tipo }),
      ...(d.provincia !== undefined && { provincia: d.provincia }),
      ...(d.municipio !== undefined && { municipio: d.municipio }),
      ...(d.morada !== undefined && { morada: d.morada || null }),
      ...(d.telefone !== undefined && { telefone: d.telefone || null }),
      ...(d.horario !== undefined && { horario: d.horario || null }),
      ...(d.urgencia24h !== undefined && { urgencia24h: d.urgencia24h }),
      ...(d.logoUrl !== undefined && { logoUrl: d.logoUrl || null }),
      ...(d.bannerUrl !== undefined && { bannerUrl: d.bannerUrl || null }),
      ...(d.descricao !== undefined && { descricao: d.descricao || null }),
      ...(d.ativo !== undefined && { ativo: d.ativo }),
    },
  });
}

/** Desativa (oculta) uma unidade (administração). */
export async function desativar(id: string): Promise<void> {
  await prisma.unidade.update({ where: { id }, data: { ativo: false } }).catch(() => null);
}

// ── Leituras ────────────────────────────────────────────────────────────────

export interface FiltroDirectorio {
  tipo?: TipoUnidade;
  provincia?: string;
  seguradoraId?: string;
  termo?: string;
  pagina?: number;
  porPagina?: number;
}

/** Listagem pública do diretório, com filtros e paginação. */
export async function listarUnidadesPublicas(filtros: FiltroDirectorio = {}) {
  const { tipo, provincia, seguradoraId, termo, pagina = 1, porPagina = 24 } = filtros;
  const where: Prisma.UnidadeWhereInput = { ativo: true };
  if (tipo) where.tipo = tipo;
  if (provincia) where.provincia = provincia;
  if (seguradoraId) where.seguradoras = { some: { seguradoraId } };
  if (termo) {
    where.OR = [
      { nome: { contains: termo, mode: "insensitive" } },
      { municipio: { contains: termo, mode: "insensitive" } },
      { morada: { contains: termo, mode: "insensitive" } },
      { servicos: { contains: termo, mode: "insensitive" } },
    ];
  }
  const [total, unidades] = await Promise.all([
    prisma.unidade.count({ where }),
    prisma.unidade.findMany({
      where,
      include: {
        especialidades: { include: { especialidade: true } },
        seguradoras: {
          where: { seguradora: { ativo: true } },
          include: { seguradora: true },
        },
      },
      orderBy: [{ tipo: "asc" }, { nome: "asc" }],
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  return { total, unidades, totalPaginas, paginaAtual: Math.min(pagina, totalPaginas) };
}

/** Detalhe completo de uma unidade (página pública e de marcação). */
export async function obterUnidadeDetalhe(id: string) {
  return prisma.unidade.findUnique({
    where: { id },
    include: {
      especialidades: { include: { especialidade: true } },
      medicos: { include: { especialidade: true }, orderBy: { nome: "asc" } },
      seguradoras: {
        where: { seguradora: { ativo: true } },
        include: { seguradora: true },
      },
    },
  });
}

/** Outras unidades da mesma rede (para sugestão de rede). */
export async function listarUnidadesRede(rede: string, idAtual: string) {
  return prisma.unidade.findMany({
    where: { rede, ativo: true, id: { not: idAtual } },
    orderBy: [{ provincia: "asc" }, { municipio: "asc" }],
    select: {
      id: true,
      nome: true,
      provincia: true,
      municipio: true,
      urgencia24h: true,
    },
  });
}

/** Unidade para o formulário de marcação (especialidades + médicos). */
export async function obterUnidadeParaMarcacao(id: string) {
  return prisma.unidade.findUnique({
    where: { id },
    include: {
      especialidades: { include: { especialidade: true } },
      medicos: true,
    },
  });
}

export interface FiltroAdminUnidades {
  termo?: string;
  tipo?: TipoUnidade;
  estado?: string;
  pagina?: number;
  porPagina?: number;
}

/** Listagem de unidades para a administração (filtros + paginação). */
export async function listarUnidadesAdmin(filtros: FiltroAdminUnidades = {}) {
  const { termo, tipo, estado, pagina = 1, porPagina = 40 } = filtros;
  const where: Prisma.UnidadeWhereInput = {
    ...(tipo && { tipo }),
    ...(estado === "ativas" && { ativo: true }),
    ...(estado === "inativas" && { ativo: false }),
    ...(termo && {
      OR: [
        { nome: { contains: termo, mode: "insensitive" } },
        { municipio: { contains: termo, mode: "insensitive" } },
        { provincia: { contains: termo, mode: "insensitive" } },
      ],
    }),
  };
  const [total, unidades] = await Promise.all([
    prisma.unidade.count({ where }),
    prisma.unidade.findMany({
      where,
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      select: {
        id: true,
        nome: true,
        tipo: true,
        municipio: true,
        provincia: true,
        ativo: true,
        logoUrl: true,
        bannerUrl: true,
      },
    }),
  ]);
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  return { total, unidades, paginas, pagina: Math.min(pagina, paginas) };
}

/** Contagem de unidades por filtro (usado no painel e na home). */
export async function contarUnidades(where: Prisma.UnidadeWhereInput = {}) {
  return prisma.unidade.count({ where });
}

// ── ISR Cache ────────────────────────────────────────────────────────────────

/** Listagem pública do diretório, com cache de 1 hora (revalida via tags). */
export const listarUnidadesPublicasCached = unstable_cache(
  listarUnidadesPublicas,
  ["unidades-publicas"],
  { revalidate: 3600, tags: ["unidades"] },
);

/** Contagem de unidades com cache de 1 hora. */
export const contarUnidadesCached = unstable_cache(
  contarUnidades,
  ["unidades-contagem"],
  { revalidate: 3600, tags: ["unidades"] },
);
