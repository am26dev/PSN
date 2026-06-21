import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";

export default async function AdminUnidadesPage() {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const unidades = await prisma.unidade.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-angola-red">← Painel</Link>
          <h1 className="text-2xl font-bold">Gestão de unidades</h1>
          <p className="text-gray-600">Hospitais, clínicas e farmácias do portal.</p>
        </div>
        <Link href="/admin/unidades/nova" className="btn-primary">+ Nova unidade</Link>
      </div>

      <div className="card divide-y divide-base-line">
        {unidades.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {u.nome}{" "}
                {!u.ativo && <span className="badge bg-base-muted text-gray-500">Inativa</span>}
              </p>
              <p className="text-sm text-gray-500">
                {ETIQUETA_TIPO_UNIDADE[u.tipo]} · {u.municipio}, {u.provincia}
              </p>
            </div>
            <Link href={`/admin/unidades/${u.id}/editar`} className="btn-ghost py-2">Editar</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
