import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { VerificacaoFlow } from "@/components/VerificacaoFlow";
import {
  ETIQUETA_ESTADO_VERIFICACAO,
  COR_ESTADO_VERIFICACAO,
  ETIQUETA_TIPO_DOCUMENTO,
} from "@/lib/etiquetas";

export default async function VerificacaoPage() {
  const utente = await utenteAtual();
  if (!utente) redirect("/entrar");

  const verificacao = await prisma.verificacao.findFirst({
    where: { utenteId: utente.id },
    orderBy: { criadoEm: "desc" },
  });

  const podeIniciar =
    !verificacao ||
    verificacao.estado === "REJEITADO" ||
    verificacao.estado === "PENDENTE";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/conta" className="text-sm font-semibold text-angola-red">
        ← A minha conta
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Verificação de identidade</h1>
        <p className="mt-1 text-gray-600">
          Confirme a sua identidade para desbloquear o acesso completo aos
          serviços do portal. Cidadãos angolanos usam o BI; estrangeiros usam o
          Passaporte ou a Autorização de Residência.
        </p>
      </div>

      {verificacao && (
        <div className="card flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-gray-500">Estado atual</p>
            <span className={`badge mt-1 ${COR_ESTADO_VERIFICACAO[verificacao.estado]}`}>
              {ETIQUETA_ESTADO_VERIFICACAO[verificacao.estado]}
            </span>
            <p className="mt-2 text-sm text-gray-500">
              {ETIQUETA_TIPO_DOCUMENTO[verificacao.tipoDocumento]} ·{" "}
              {verificacao.numeroDocumento}
            </p>
          </div>
          {utente.verificado && (
            <span className="text-3xl text-green-600" aria-hidden>✓</span>
          )}
        </div>
      )}

      {verificacao?.estado === "REJEITADO" && verificacao.motivoRejeicao && (
        <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
          Motivo da rejeição: {verificacao.motivoRejeicao}
        </p>
      )}

      {verificacao?.estado === "EM_ANALISE" && (
        <div className="card p-6 text-center text-gray-600">
          <p className="text-lg font-semibold">A sua verificação está em análise.</p>
          <p className="mt-1 text-sm">
            Vamos rever os seus documentos e atualizar o estado aqui. Não precisa
            de fazer mais nada.
          </p>
        </div>
      )}

      {verificacao?.estado === "APROVADO" && (
        <div className="card p-6 text-center">
          <p className="text-lg font-semibold text-green-700">
            Identidade verificada com sucesso.
          </p>
          <p className="mt-1 text-sm text-gray-600">
            A sua conta tem acesso completo aos serviços do PSN.
          </p>
        </div>
      )}

      {podeIniciar && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold">
            {verificacao?.estado === "REJEITADO"
              ? "Repetir verificação"
              : "Iniciar verificação"}
          </h2>
          <VerificacaoFlow
            nomePadrao={utente.nomeCompleto}
            tipoPadrao={utente.tipoDocumento === "BI" ? "BI" : "PASSAPORTE"}
            numeroPadrao={utente.numeroDocumento}
          />
        </div>
      )}
    </div>
  );
}
