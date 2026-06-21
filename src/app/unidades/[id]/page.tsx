import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";
import { fotoUnidade, bannerUnidade } from "@/lib/imagens";
import { LogoSeguradora } from "@/components/LogoSeguradora";

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

  // Marcação ativa do utente nesta unidade (para oferecer "Remarcar").
  const utente = await utenteAtual();
  const marcacaoAtiva = utente
    ? await prisma.marcacao.findFirst({
        where: {
          utenteId: utente.id,
          unidadeId: unidade.id,
          estado: { in: ["PENDENTE", "CONFIRMADA"] },
        },
        orderBy: { dataHora: "desc" },
      })
    : null;

  const medicosPorEspecialidade = (espId: string) =>
    unidade.medicos.filter((m) => m.especialidadeId === espId);

  // Outras unidades da mesma rede (ex.: a clínica tem várias unidades).
  const unidadesRede = unidade.rede
    ? await prisma.unidade.findMany({
        where: { rede: unidade.rede, ativo: true, id: { not: unidade.id } },
        orderBy: [{ provincia: "asc" }, { municipio: "asc" }],
        select: { id: true, nome: true, provincia: true, municipio: true, urgencia24h: true },
      })
    : [];

  return (
    <div className="space-y-8">
      <Link href="/directorio" className="text-sm font-semibold text-angola-red">
        ← Voltar ao diretório
      </Link>

      {/* Banner + identidade */}
      <div className="card overflow-hidden">
        <div className="relative h-56 w-full md:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUnidade(unidade.tipo, unidade.id, unidade.bannerUrl)}
            alt={unidade.nome}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-angola-black/80 to-transparent" />
          {unidade.urgencia24h && (
            <span className="badge absolute right-4 top-4 bg-angola-red text-white">
              Urgência 24 horas
            </span>
          )}
          <div className="absolute bottom-4 left-4 flex items-end gap-4 md:left-6">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoUnidade(unidade.tipo, unidade.id, unidade.logoUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pb-1 text-white">
              <span className="badge bg-white/20 text-white">
                {ETIQUETA_TIPO_UNIDADE[unidade.tipo]}
              </span>
              <h1 className="mt-1 text-2xl font-bold drop-shadow">{unidade.nome}</h1>
              <p className="text-sm text-white/90">
                {unidade.municipio}, {unidade.provincia}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <Info rotulo="Telefone" valor={unidade.telefone ?? "—"} />
          <Info rotulo="Horário" valor={unidade.horario ?? "—"} />
          <Info rotulo="Morada" valor={unidade.morada ?? "—"} />
        </div>

        {unidade.descricao && (
          <p className="border-t border-base-line px-6 py-4 text-sm text-gray-600">
            {unidade.descricao}
          </p>
        )}

        {!eFarmacia && (
          <div className="flex flex-wrap gap-3 border-t border-base-line p-6">
            <Link href={`/unidades/${unidade.id}/marcar`} className="btn-primary">
              Marcar consulta
            </Link>
            {marcacaoAtiva && (
              <Link
                href={`/unidades/${unidade.id}/marcar?remarcar=${marcacaoAtiva.id}`}
                className="btn-ghost"
              >
                Remarcar consulta
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Rede — outras unidades da mesma marca */}
      {unidade.rede && unidadesRede.length > 0 && (
        <section className="card p-6">
          <h2 className="text-xl font-bold">
            Rede {unidade.rede} — outras unidades
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Esta unidade faz parte de uma rede com {unidadesRede.length + 1}{" "}
            unidades. Escolha a que lhe for mais conveniente:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {unidadesRede.map((u) => (
              <Link
                key={u.id}
                href={`/unidades/${u.id}`}
                className="flex items-center justify-between rounded-xl border border-base-line p-4 transition hover:bg-base-soft"
              >
                <div>
                  <p className="font-medium">{u.municipio}</p>
                  <p className="text-sm text-gray-500">{u.provincia}</p>
                </div>
                <span className="flex items-center gap-2 text-sm text-angola-red">
                  {u.urgencia24h && (
                    <span className="badge bg-angola-red/10 text-angola-red-dark">24h</span>
                  )}
                  Ver →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Especialidades — cartões modernos com CTA */}
      {!eFarmacia && unidade.especialidades.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Especialidades</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unidade.especialidades.map((e) => {
              const meds = medicosPorEspecialidade(e.especialidadeId);
              return (
                <div
                  key={e.especialidadeId}
                  className="card flex flex-col justify-between p-5"
                >
                  <div>
                    <div className="mb-2 h-1.5 w-10 rounded-full bg-angola-gold" />
                    <h3 className="font-bold">{e.especialidade.nome}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {meds.length > 0
                        ? `${meds.length} médico(s) · ${meds
                            .slice(0, 2)
                            .map((m) => m.nome)
                            .join(", ")}`
                        : "Disponível por marcação"}
                    </p>
                  </div>
                  <Link
                    href={`/unidades/${unidade.id}/marcar?especialidade=${e.especialidadeId}`}
                    className="btn-primary mt-4 w-full py-2"
                  >
                    Marcar consulta
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cobertura de seguros */}
      <section>
        <h2 className="text-xl font-bold">Seguros de saúde aceites</h2>
        {unidade.seguradoras.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {unidade.seguradoras.map((s) => (
              <LogoSeguradora
                key={s.seguradoraId}
                nome={s.seguradora.nome}
                logoUrl={s.seguradora.logoUrl}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Esta unidade atende sem seguro (pagamento direto).
          </p>
        )}
        <p className="mt-3 text-sm text-gray-500">
          Atende também utentes <strong>sem seguro</strong>, com pagamento em Kwanzas.
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
