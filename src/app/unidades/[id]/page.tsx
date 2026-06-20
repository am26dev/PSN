import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";

export default async function UnidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const unidade = await prisma.unidade.findUnique({
    where: { id },
    include: {
      especialidades: { include: { especialidade: true } },
      medicos: { include: { especialidade: true }, orderBy: { nome: "asc" } },
      seguradoras: { include: { seguradora: true } },
    },
  });

  if (!unidade || !unidade.ativo) notFound();

  const eFarmacia = unidade.tipo === "FARMACIA";

  return (
    <div className="space-y-8">
      <Link href="/directorio" className="text-sm font-semibold text-angola-red">
        ← Voltar ao diretório
      </Link>

      {/* Cabeçalho */}
      <div className="card overflow-hidden">
        <div className="bg-angola-red px-6 py-6 text-white">
          <span className="badge bg-white/15 text-white">
            {ETIQUETA_TIPO_UNIDADE[unidade.tipo]}
          </span>
          <h1 className="mt-2 text-2xl font-bold">{unidade.nome}</h1>
          <p className="mt-1 text-white/85">
            {unidade.morada ? `${unidade.morada} · ` : ""}
            {unidade.municipio}, {unidade.provincia}
          </p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <Info rotulo="Telefone" valor={unidade.telefone ?? "—"} />
          <Info rotulo="Horário" valor={unidade.horario ?? "—"} />
          <Info
            rotulo="Urgências"
            valor={unidade.urgencia24h ? "24 horas" : "Sem urgência permanente"}
          />
        </div>
        {!eFarmacia && (
          <div className="border-t border-base-line p-6">
            <Link href={`/unidades/${unidade.id}/marcar`} className="btn-primary">
              Marcar consulta
            </Link>
          </div>
        )}
      </div>

      {/* Especialidades */}
      {!eFarmacia && unidade.especialidades.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Especialidades</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {unidade.especialidades.map((e) => (
              <span key={e.especialidadeId} className="badge bg-base-muted text-gray-700">
                {e.especialidade.nome}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Médicos */}
      {!eFarmacia && unidade.medicos.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Médicos</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {unidade.medicos.map((m) => (
              <div key={m.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{m.nome}</p>
                  <p className="text-sm text-gray-500">{m.especialidade.nome}</p>
                </div>
                <span
                  className={`badge ${
                    m.disponivel
                      ? "bg-green-100 text-green-700"
                      : "bg-base-muted text-gray-500"
                  }`}
                >
                  {m.disponivel ? "Disponível" : "Indisponível"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cobertura de seguros */}
      <section>
        <h2 className="text-xl font-bold">Seguros de saúde aceites</h2>
        {unidade.seguradoras.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {unidade.seguradoras.map((s) => (
              <span key={s.seguradoraId} className="badge bg-angola-gold/20 text-angola-gold-dark">
                {s.seguradora.nome}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Esta unidade atende sem seguro (pagamento direto).
          </p>
        )}
        <p className="mt-3 text-sm text-gray-500">
          Atende também utentes <strong>sem seguro</strong>, com pagamento em
          Kwanzas.
        </p>
      </section>
    </div>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{rotulo}</p>
      <p className="mt-1 font-medium">{valor}</p>
    </div>
  );
}
