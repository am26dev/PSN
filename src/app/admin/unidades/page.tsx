import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma, TipoUnidade } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";

const POR_PAGINA = 40;

export default async function AdminUnidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; estado?: string; pagina?: string }>;
}) {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tipo = Object.values(TipoUnidade).includes(sp.tipo as TipoUnidade)
    ? (sp.tipo as TipoUnidade)
    : undefined;
  const paginaPedida = Math.max(1, Number.parseInt(sp.pagina ?? "1", 10) || 1);

  const where: Prisma.UnidadeWhereInput = {
    ...(tipo && { tipo }),
    ...(sp.estado === "ativas" && { ativo: true }),
    ...(sp.estado === "inativas" && { ativo: false }),
    ...(q && {
      OR: [
        { nome: { contains: q, mode: "insensitive" } },
        { municipio: { contains: q, mode: "insensitive" } },
        { provincia: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const total = await prisma.unidade.count({ where });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(paginaPedida, paginas);
  const unidades = await prisma.unidade.findMany({
    where,
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    skip: (pagina - 1) * POR_PAGINA,
    take: POR_PAGINA,
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
  });

  const linkPagina = (destino: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (tipo) p.set("tipo", tipo);
    if (sp.estado) p.set("estado", sp.estado);
    p.set("pagina", String(destino));
    return `/admin/unidades?${p.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestão de unidades</h1>
          <p className="text-gray-600">Pesquise e edite toda a rede de hospitais, clínicas e farmácias.</p>
        </div>
        <Link href="/admin/unidades/nova" className="btn-primary">+ Nova unidade</Link>
      </div>

      <form className="card grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_160px_auto]" action="/admin/unidades">
        <input className="input" type="search" name="q" defaultValue={q} placeholder="Nome, município ou província…" />
        <select className="input" name="tipo" defaultValue={tipo ?? ""}>
          <option value="">Todos os tipos</option>
          {Object.values(TipoUnidade).map((valor) => (
            <option key={valor} value={valor}>{ETIQUETA_TIPO_UNIDADE[valor]}</option>
          ))}
        </select>
        <select className="input" name="estado" defaultValue={sp.estado ?? ""}>
          <option value="">Todos os estados</option>
          <option value="ativas">Ativas</option>
          <option value="inativas">Inativas</option>
        </select>
        <button className="btn-primary" type="submit">Pesquisar</button>
      </form>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p><strong className="text-angola-black">{total}</strong> unidade{total === 1 ? "" : "s"} encontrada{total === 1 ? "" : "s"}</p>
        {(q || tipo || sp.estado) && <Link href="/admin/unidades" className="font-semibold text-angola-red">Limpar filtros</Link>}
      </div>

      {unidades.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">Nenhuma unidade corresponde aos filtros.</div>
      ) : (
        <div className="card divide-y divide-base-line overflow-hidden">
          {unidades.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-base-soft">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {u.nome}{" "}
                  {!u.ativo && <span className="badge bg-base-muted text-gray-500">Inativa</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {ETIQUETA_TIPO_UNIDADE[u.tipo]} · {u.municipio}, {u.provincia}
                  <span className="ml-2 text-xs text-gray-400">· {u.logoUrl || u.bannerUrl ? "imagem própria" : "imagem PSN"}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {u.ativo && <Link href={`/unidades/${u.id}`} className="btn-ghost py-2" target="_blank">Ver</Link>}
                <Link href={`/admin/unidades/${u.id}/editar`} className="btn-primary py-2">Editar</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {paginas > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Paginação">
          {pagina > 1 ? <Link href={linkPagina(pagina - 1)} className="btn-ghost">← Anterior</Link> : <span />}
          <span className="text-sm text-gray-500">Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link href={linkPagina(pagina + 1)} className="btn-ghost">Seguinte →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
