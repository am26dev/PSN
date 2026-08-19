import Link from "next/link";
import { redirect } from "next/navigation";
import { utenteAtual } from "@/lib/auth";
import { HistoricoClinico } from "@/components/HistoricoClinico";
import {
  listarConsultasDoUtente,
  listarExamesDoUtente,
  listarPatologiasDoUtente,
} from "@/lib/services/medico.service";

export const metadata = { title: "Histórico clínico — PSN" };

export default async function HistoricoPage() {
  const utente = await utenteAtual();
  if (!utente) redirect("/entrar");

  const [consultas, exames, patologias] = await Promise.all([
    listarConsultasDoUtente(utente.id),
    listarExamesDoUtente(utente.id),
    listarPatologiasDoUtente(utente.id),
  ]);

  return (
    <div className="space-y-8">
      <Link href="/conta" className="text-sm text-gray-500 hover:text-angola-red">
        ← A minha conta
      </Link>

      <div className="card overflow-hidden">
        <div className="bg-angola-red px-6 py-6 text-white">
          <h1 className="text-2xl font-bold">O meu histórico clínico</h1>
          <p className="mt-1 text-sm text-white/80">
            Consultas, exames e patologias registados pelos profissionais que o
            atenderam. Esta informação é privada e apenas acessível a si e aos
            profissionais de saúde.
          </p>
        </div>
      </div>

      <section className="card p-6">
        <HistoricoClinico
          consultas={consultas}
          exames={exames}
          patologias={patologias}
        />
      </section>
    </div>
  );
}
