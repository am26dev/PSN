import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { MarcacaoForm } from "@/components/MarcacaoForm";
import { precoConsulta } from "@/lib/precos";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";

export default async function MarcarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ especialidade?: string; remarcar?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const utente = await utenteAtual();
  if (!utente) redirect(`/entrar?proximo=/unidades/${id}/marcar`);

  // Modo remarcação: confirma que a marcação é deste utente e desta unidade.
  const remarcar = sp.remarcar
    ? await prisma.marcacao.findFirst({
        where: { id: sp.remarcar, utenteId: utente.id, unidadeId: id },
      })
    : null;

  const unidade = await prisma.unidade.findUnique({
    where: { id },
    include: {
      especialidades: { include: { especialidade: true } },
      medicos: true,
    },
  });

  if (!unidade || !unidade.ativo || unidade.tipo === "FARMACIA") notFound();

  const dependentes = await prisma.dependente.findMany({
    where: { responsavelId: utente.id },
    select: { id: true, nomeCompleto: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={`/unidades/${id}`} className="text-sm font-semibold text-angola-red">
        ← Voltar à unidade
      </Link>
      <div>
        <h1 className="text-2xl font-bold">
          {remarcar ? "Remarcar consulta" : "Marcar consulta"}
        </h1>
        <p className="mt-1 text-gray-600">
          {ETIQUETA_TIPO_UNIDADE[unidade.tipo]} · {unidade.nome}
        </p>
      </div>

      <MarcacaoForm
        unidadeId={unidade.id}
        especialidades={unidade.especialidades.map((e) => ({
          id: e.especialidade.id,
          nome: e.especialidade.nome,
        }))}
        medicos={unidade.medicos.map((m) => ({
          id: m.id,
          nome: m.nome,
          especialidadeId: m.especialidadeId,
        }))}
        dependentes={dependentes}
        temSeguro={!!utente.seguradoraId}
        telefoneUtente={utente.telefone}
        valorCentimos={precoConsulta(unidade.tipo)}
        especialidadePre={sp.especialidade ?? null}
        remarcarId={remarcar?.id ?? null}
      />
    </div>
  );
}
