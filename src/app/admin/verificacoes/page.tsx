import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import {
  ETIQUETA_ESTADO_VERIFICACAO,
  COR_ESTADO_VERIFICACAO,
  ETIQUETA_TIPO_DOCUMENTO,
} from "@/lib/etiquetas";

export default async function AdminVerificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const sp = await searchParams;
  const filtro = sp.estado;

  const verificacoes = await prisma.verificacao.findMany({
    where: filtro ? { estado: filtro as never } : {},
    include: { utente: { select: { nomeCompleto: true } } },
    orderBy: [{ estado: "asc" }, { criadoEm: "desc" }],
    take: 100,
  });

  const filtros = [
    { v: "", r: "Todas" },
    { v: "EM_ANALISE", r: "Em análise" },
    { v: "APROVADO", r: "Verificadas" },
    { v: "REJEITADO", r: "Rejeitadas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administração — Verificações</h1>
        <p className="mt-1 text-gray-600">Reveja e decida as verificações de identidade dos utentes.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <Link
            key={f.v}
            href={f.v ? `/admin/verificacoes?estado=${f.v}` : "/admin/verificacoes"}
            className={`badge ${
              (filtro ?? "") === f.v
                ? "bg-angola-red text-white"
                : "bg-base-muted text-gray-700"
            }`}
          >
            {f.r}
          </Link>
        ))}
      </div>

      {verificacoes.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">Sem verificações.</div>
      ) : (
        <div className="card divide-y divide-base-line">
          {verificacoes.map((v) => (
            <Link
              key={v.id}
              href={`/admin/verificacoes/${v.id}`}
              className="flex items-center justify-between gap-3 p-4 transition hover:bg-base-soft"
            >
              <div>
                <p className="font-semibold">{v.utente.nomeCompleto}</p>
                <p className="text-sm text-gray-500">
                  {ETIQUETA_TIPO_DOCUMENTO[v.tipoDocumento]} · {v.numeroDocumento}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {v.pontuacaoRisco != null && (
                  <span className="text-xs text-gray-400">
                    risco {Math.round(v.pontuacaoRisco)}
                  </span>
                )}
                <span className={`badge ${COR_ESTADO_VERIFICACAO[v.estado]}`}>
                  {ETIQUETA_ESTADO_VERIFICACAO[v.estado]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
