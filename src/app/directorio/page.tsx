import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UnidadeCard } from "@/components/UnidadeCard";
import { PROVINCIAS_ANGOLA } from "@/lib/validacao";
import type { Prisma, TipoUnidade } from "@prisma/client";

const POR_PAGINA = 24;

const TIPOS: { valor: TipoUnidade | ""; rotulo: string }[] = [
  { valor: "", rotulo: "Todos os tipos" },
  { valor: "HOSPITAL_PUBLICO", rotulo: "Hospitais públicos / SNS" },
  { valor: "UNIDADE_HOSPITALAR", rotulo: "Hospitais / unidades hospitalares" },
  { valor: "CLINICA_PRIVADA", rotulo: "Clínicas privadas" },
  { valor: "CENTRO_MEDICO", rotulo: "Centros médicos" },
  { valor: "CLINICA_DENTARIA", rotulo: "Clínicas dentárias" },
  { valor: "LABORATORIO", rotulo: "Diagnóstico e laboratórios" },
  { valor: "FISIOTERAPIA", rotulo: "Fisioterapia e reabilitação" },
  { valor: "OPTICA", rotulo: "Ópticas" },
  { valor: "PRESTADOR_SAUDE", rotulo: "Outros prestadores de saúde" },
  { valor: "FARMACIA", rotulo: "Farmácias" },
];

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    provincia?: string;
    seguradora?: string;
    q?: string;
    pagina?: string;
  }>;
}) {
  const sp = await searchParams;
  const tipo = TIPOS.some((item) => item.valor && item.valor === sp.tipo)
    ? (sp.tipo as TipoUnidade)
    : undefined;
  const provincia = sp.provincia?.trim();
  const seguradora = sp.seguradora?.trim();
  const q = sp.q?.trim();
  const paginaPedida = Number.parseInt(sp.pagina ?? "1", 10);
  const pagina = Number.isFinite(paginaPedida) && paginaPedida > 0 ? paginaPedida : 1;

  const where: Prisma.UnidadeWhereInput = { ativo: true };
  if (tipo) where.tipo = tipo;
  if (provincia) where.provincia = provincia;
  if (seguradora) where.seguradoras = { some: { seguradoraId: seguradora } };
  if (q) {
    where.OR = [
      { nome: { contains: q, mode: "insensitive" } },
      { municipio: { contains: q, mode: "insensitive" } },
      { morada: { contains: q, mode: "insensitive" } },
      { servicos: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, unidades, seguradoras] = await Promise.all([
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
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.seguradora.findMany({
      where: { ativo: true, unidades: { some: {} } },
      orderBy: { nome: "asc" },
    }),
  ]).catch(() => [0, [], []] as const);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);

  function hrefPagina(destino: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tipo) params.set("tipo", tipo);
    if (provincia) params.set("provincia", provincia);
    if (seguradora) params.set("seguradora", seguradora);
    if (destino > 1) params.set("pagina", String(destino));
    const query = params.toString();
    return `/directorio${query ? `?${query}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Encontrar unidade de saúde</h1>
        <p className="mt-2 text-gray-600">
          Pesquise hospitais públicos, clínicas, centros médicos, farmácias e
          outros prestadores em Angola.
        </p>
      </div>

      <form className="card grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="lg:col-span-2">
          <label className="label">Pesquisar</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome, município, morada ou serviço…"
            className="input"
          />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select name="tipo" defaultValue={tipo ?? ""} className="input">
            {TIPOS.map((item) => (
              <option key={item.valor} value={item.valor}>{item.rotulo}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Província</label>
          <select name="provincia" defaultValue={provincia ?? ""} className="input">
            <option value="">Todas</option>
            {PROVINCIAS_ANGOLA.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Seguro / rede</label>
          <select name="seguradora" defaultValue={seguradora ?? ""} className="input">
            <option value="">Todos</option>
            {seguradoras.map((item) => (
              <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 md:col-span-2 lg:col-span-5 lg:justify-end">
          <Link href="/directorio" className="btn-ghost">Limpar</Link>
          <button type="submit" className="btn-primary">Filtrar</button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <p>{total} resultado(s)</p>
        {totalPaginas > 1 && <p>Página {paginaAtual} de {totalPaginas}</p>}
      </div>

      {unidades.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          <p>Não há unidades para os filtros escolhidos.</p>
          <Link href="/directorio" className="mt-3 inline-block font-semibold text-angola-red">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unidades.map((unidade) => (
            <UnidadeCard key={unidade.id} unidade={unidade} />
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Paginação do diretório">
          {paginaAtual > 1 ? (
            <Link className="btn-ghost" href={hrefPagina(paginaAtual - 1)}>← Anterior</Link>
          ) : (
            <span className="btn-ghost cursor-not-allowed opacity-40">← Anterior</span>
          )}
          <span className="text-sm text-gray-500">{paginaAtual} / {totalPaginas}</span>
          {paginaAtual < totalPaginas ? (
            <Link className="btn-ghost" href={hrefPagina(paginaAtual + 1)}>Seguinte →</Link>
          ) : (
            <span className="btn-ghost cursor-not-allowed opacity-40">Seguinte →</span>
          )}
        </nav>
      )}
    </div>
  );
}
