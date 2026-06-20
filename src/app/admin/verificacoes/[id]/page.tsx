import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { AdminRevisao } from "@/components/AdminRevisao";
import {
  ETIQUETA_ESTADO_VERIFICACAO,
  COR_ESTADO_VERIFICACAO,
  ETIQUETA_TIPO_DOCUMENTO,
} from "@/lib/etiquetas";

export default async function AdminVerificacaoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const { id } = await params;
  const v = await prisma.verificacao.findUnique({
    where: { id },
    include: {
      utente: { select: { nomeCompleto: true, numeroDocumento: true, email: true } },
      eventos: { orderBy: { criadoEm: "asc" } },
    },
  });
  if (!v) notFound();

  const pendenteDecisao = v.estado === "EM_ANALISE" || v.estado === "PENDENTE";

  const imagens = [
    { rotulo: "Frente do documento", key: v.imagemFrenteKey },
    { rotulo: "Verso do documento", key: v.imagemVersoKey },
    { rotulo: "Selfie", key: v.selfieKey },
  ].filter((i) => i.key);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/verificacoes" className="text-sm font-semibold text-angola-red">
        ← Voltar à lista
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{v.utente.nomeCompleto}</h1>
            <p className="mt-1 text-gray-600">
              {ETIQUETA_TIPO_DOCUMENTO[v.tipoDocumento]} · {v.numeroDocumento}
            </p>
            {v.utente.email && <p className="text-sm text-gray-500">{v.utente.email}</p>}
          </div>
          <span className={`badge ${COR_ESTADO_VERIFICACAO[v.estado]}`}>
            {ETIQUETA_ESTADO_VERIFICACAO[v.estado]}
          </span>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-gray-400">Pontuação de risco</dt>
            <dd className="font-medium">
              {v.pontuacaoRisco != null ? `${Math.round(v.pontuacaoRisco)}/100` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Prova de vida</dt>
            <dd className="font-medium">{v.resultadoBiometria}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Nascimento</dt>
            <dd className="font-medium">{v.dataNascimento ?? "—"}</dd>
          </div>
        </dl>

        {/* Dados da consulta oficial (dev.it.ao), quando disponíveis */}
        {(() => {
          const oficial = (v.ocrDados as { consultaOficial?: Record<string, unknown> } | null)
            ?.consultaOficial;
          if (!oficial) return null;
          if (!oficial.encontrado) {
            return (
              <p className="mt-4 rounded-lg bg-angola-red/10 px-4 py-2 text-sm text-angola-red-dark">
                Consulta oficial: documento não encontrado na fonte oficial.
              </p>
            );
          }
          return (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm">
              <p className="font-semibold text-green-800">
                Confirmado na fonte oficial (dev.it.ao)
              </p>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {oficial.nome ? <Linha rotulo="Nome" valor={String(oficial.nome)} /> : null}
                {oficial.nif ? <Linha rotulo="NIF" valor={String(oficial.nif)} /> : null}
                {oficial.estado ? <Linha rotulo="Estado" valor={String(oficial.estado)} /> : null}
                {oficial.municipio ? <Linha rotulo="Município" valor={String(oficial.municipio)} /> : null}
              </dl>
            </div>
          );
        })()}
      </div>

      {/* Imagens (servidas pela rota protegida) */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Documentos</h2>
        {imagens.length === 0 ? (
          <p className="text-sm text-gray-500">Sem imagens carregadas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {imagens.map((img) => (
              <figure key={img.key} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/verificacao/imagem/${img.key}`}
                  alt={img.rotulo}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="p-2 text-center text-xs text-gray-500">
                  {img.rotulo}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* Decisão */}
      {pendenteDecisao ? (
        <section className="card p-6">
          <h2 className="mb-3 text-lg font-bold">Decisão</h2>
          <AdminRevisao verificacaoId={v.id} />
        </section>
      ) : (
        v.motivoRejeicao && (
          <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
            Motivo da rejeição: {v.motivoRejeicao}
          </p>
        )
      )}

      {/* Auditoria */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Histórico</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          {v.eventos.map((e) => (
            <li key={e.id} className="flex justify-between gap-3">
              <span>{e.evento}</span>
              <span className="text-gray-400">
                {new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(e.criadoEm)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-gray-500">{rotulo}</dt>
      <dd className="font-medium text-gray-800">{valor}</dd>
    </div>
  );
}
