import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { HistoricoClinico } from "@/components/HistoricoClinico";
import { RegistoForms } from "@/components/medico/RegistoForms";

export const metadata = { title: "Ficha clínica — PSN" };

function calcularIdade(dataNascimento: Date) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) idade--;
  return idade;
}

export default async function PacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const medico = await utenteAtual();
  if (!medico) redirect("/entrar");
  if (medico.papel !== "PROFISSIONAL" && medico.papel !== "ADMIN") {
    redirect("/conta");
  }

  const { id } = await params;
  const paciente = await prisma.utente.findUnique({
    where: { id },
    include: {
      fichaSaude: true,
      consultas: { orderBy: { data: "desc" } },
      exames: { orderBy: { data: "desc" } },
      patologias: { orderBy: { criadoEm: "desc" } },
    },
  });
  if (!paciente) notFound();

  const ficha = paciente.fichaSaude;

  return (
    <div className="space-y-8">
      <Link href="/medico" className="text-sm text-gray-500 hover:text-angola-red">
        ← Voltar à pesquisa
      </Link>

      <div className="card overflow-hidden">
        <div className="bg-angola-red px-6 py-6 text-white">
          <h1 className="text-2xl font-bold">{paciente.nomeCompleto}</h1>
          <p className="mt-1 text-sm text-white/80">
            {paciente.tipoDocumento === "BI" ? "BI" : "Documento"}:{" "}
            {paciente.numeroDocumento}
            {paciente.nif ? ` · NIF: ${paciente.nif}` : ""}
          </p>
          <p className="text-sm text-white/80">
            {calcularIdade(paciente.dataNascimento)} anos ·{" "}
            {paciente.sexo === "MASCULINO"
              ? "Masculino"
              : paciente.sexo === "FEMININO"
                ? "Feminino"
                : "Outro"}
            {paciente.telefone ? ` · ${paciente.telefone}` : ""}
          </p>
        </div>
      </div>

      {/* Ficha de saúde de base */}
      {ficha &&
        (ficha.tipoSanguineo ||
          ficha.alergias ||
          ficha.doencasCronicas ||
          ficha.medicacaoAtual) && (
          <section className="card p-6">
            <h2 className="text-lg font-bold">Ficha de saúde</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {ficha.tipoSanguineo && (
                <div>
                  <dt className="text-gray-400">Tipo sanguíneo</dt>
                  <dd>{ficha.tipoSanguineo}</dd>
                </div>
              )}
              {ficha.alergias && (
                <div>
                  <dt className="text-gray-400">Alergias</dt>
                  <dd>{ficha.alergias}</dd>
                </div>
              )}
              {ficha.doencasCronicas && (
                <div>
                  <dt className="text-gray-400">Doenças crónicas</dt>
                  <dd>{ficha.doencasCronicas}</dd>
                </div>
              )}
              {ficha.medicacaoAtual && (
                <div>
                  <dt className="text-gray-400">Medicação atual</dt>
                  <dd>{ficha.medicacaoAtual}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

      <RegistoForms pacienteId={paciente.id} />

      <section className="card p-6">
        <HistoricoClinico
          consultas={paciente.consultas}
          exames={paciente.exames}
          patologias={paciente.patologias}
        />
      </section>
    </div>
  );
}
