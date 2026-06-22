import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { normalizarDocumento } from "@/lib/documento";

export const metadata = { title: "Portal do Médico — PSN" };

function calcularIdade(dataNascimento: Date) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) idade--;
  return idade;
}

export default async function MedicoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const medico = await utenteAtual();
  if (!medico) redirect("/entrar");
  if (medico.papel !== "PROFISSIONAL" && medico.papel !== "ADMIN") {
    redirect("/conta");
  }

  const { q } = await searchParams;
  const termo = (q ?? "").trim();

  let paciente = null;
  if (termo) {
    const doc = normalizarDocumento(termo);
    paciente = await prisma.utente.findFirst({
      where: {
        OR: [{ numeroDocumento: doc }, { numeroDocumento: termo }, { nif: termo }],
      },
      select: {
        id: true,
        nomeCompleto: true,
        numeroDocumento: true,
        tipoDocumento: true,
        nif: true,
        dataNascimento: true,
        sexo: true,
        telefone: true,
        provincia: true,
        municipio: true,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div className="card overflow-hidden">
        <div className="bg-angola-black px-6 py-6 text-white">
          <p className="text-sm text-white/70">Portal do Médico</p>
          <h1 className="text-2xl font-bold">{medico.nomeCompleto}</h1>
          <p className="mt-1 text-sm text-white/70">
            {medico.especialidadeMedica ?? "Profissional de saúde"}
            {medico.numeroOrdem ? ` · Ordem ${medico.numeroOrdem}` : ""}
          </p>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="text-xl font-bold">Consultar paciente</h2>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          Introduza o número de BI ou NIF do paciente para aceder ao seu
          histórico clínico (consultas, exames e patologias).
        </p>
        <form method="get" className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={termo}
            placeholder="Ex.: 003456789LA042"
            className="input flex-1"
            autoComplete="off"
            required
          />
          <button type="submit" className="btn-primary">
            Procurar
          </button>
        </form>

        {termo && !paciente && (
          <p className="mt-4 rounded-lg bg-angola-red/5 p-4 text-sm text-angola-red-dark">
            Nenhum paciente encontrado com o documento <strong>{termo}</strong>.
          </p>
        )}

        {paciente && (
          <Link
            href={`/medico/paciente/${paciente.id}`}
            className="mt-4 flex items-center justify-between rounded-lg border border-base-line p-4 transition hover:border-angola-red hover:shadow"
          >
            <div>
              <p className="font-semibold">{paciente.nomeCompleto}</p>
              <p className="text-sm text-gray-500">
                {paciente.tipoDocumento === "BI" ? "BI" : "Documento"}:{" "}
                {paciente.numeroDocumento}
                {paciente.nif ? ` · NIF: ${paciente.nif}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {calcularIdade(paciente.dataNascimento)} anos ·{" "}
                {paciente.sexo === "MASCULINO"
                  ? "Masculino"
                  : paciente.sexo === "FEMININO"
                    ? "Feminino"
                    : "Outro"}
                {paciente.provincia ? ` · ${paciente.provincia}` : ""}
              </p>
            </div>
            <span className="badge bg-angola-red/10 text-angola-red-dark">
              Abrir ficha →
            </span>
          </Link>
        )}
      </section>
    </div>
  );
}
