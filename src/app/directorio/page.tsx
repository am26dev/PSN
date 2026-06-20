import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UnidadeCard } from "@/components/UnidadeCard";
import { PROVINCIAS_ANGOLA } from "@/lib/validacao";
import type { Prisma, TipoUnidade } from "@prisma/client";

const TIPOS: { valor: TipoUnidade | ""; rotulo: string }[] = [
  { valor: "", rotulo: "Todas" },
  { valor: "HOSPITAL_PUBLICO", rotulo: "Hospitais públicos" },
  { valor: "CLINICA_PRIVADA", rotulo: "Clínicas privadas" },
  { valor: "FARMACIA", rotulo: "Farmácias" },
];

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; provincia?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const tipo = sp.tipo as TipoUnidade | undefined;
  const provincia = sp.provincia;
  const q = sp.q?.trim();

  const where: Prisma.UnidadeWhereInput = { ativo: true };
  if (tipo) where.tipo = tipo;
  if (provincia) where.provincia = provincia;
  if (q) {
    where.OR = [
      { nome: { contains: q, mode: "insensitive" } },
      { municipio: { contains: q, mode: "insensitive" } },
    ];
  }

  const unidades = await prisma.unidade
    .findMany({
      where,
      include: { especialidades: { include: { especialidade: true } } },
      orderBy: [{ tipo: "asc" }, { nome: "asc" }],
      take: 60,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Encontrar unidade de saúde</h1>
        <p className="mt-2 text-gray-600">
          Pesquise hospitais públicos, clínicas privadas e farmácias em toda a
          Angola.
        </p>
      </div>

      {/* Filtros */}
      <form className="card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="label">Pesquisar</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome ou município…"
            className="input"
          />
        </div>
        <div className="md:w-56">
          <label className="label">Tipo</label>
          <select name="tipo" defaultValue={tipo ?? ""} className="input">
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>{t.rotulo}</option>
            ))}
          </select>
        </div>
        <div className="md:w-56">
          <label className="label">Província</label>
          <select name="provincia" defaultValue={provincia ?? ""} className="input">
            <option value="">Todas</option>
            {PROVINCIAS_ANGOLA.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Filtrar</button>
      </form>

      <p className="text-sm text-gray-500">{unidades.length} resultado(s)</p>

      {unidades.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          <p>Não há unidades para os filtros escolhidos.</p>
          <Link href="/directorio" className="mt-3 inline-block font-semibold text-angola-red">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unidades.map((u) => (
            <UnidadeCard key={u.id} unidade={u} />
          ))}
        </div>
      )}
    </div>
  );
}
