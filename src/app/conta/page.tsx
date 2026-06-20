import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { FichaSaudeForm } from "@/components/FichaSaudeForm";
import { AgregadoFamiliar } from "@/components/AgregadoFamiliar";
import { formatarKz } from "@/lib/moeda";
import {
  ETIQUETA_ESTADO_MARCACAO,
  COR_ESTADO_MARCACAO,
  ETIQUETA_METODO_PAGAMENTO,
} from "@/lib/etiquetas";

export default async function ContaPage() {
  const utente = await utenteAtual();
  if (!utente) redirect("/entrar");

  const [dependentes, marcacoes] = await Promise.all([
    prisma.dependente.findMany({
      where: { responsavelId: utente.id },
      orderBy: { criadoEm: "desc" },
    }),
    prisma.marcacao.findMany({
      where: { utenteId: utente.id },
      include: {
        unidade: true,
        especialidade: true,
        medico: true,
        dependente: true,
        pagamento: true,
      },
      orderBy: { dataHora: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="card overflow-hidden">
        <div className="bg-angola-red px-6 py-6 text-white">
          <p className="text-sm text-white/80">Bem-vindo(a),</p>
          <h1 className="text-2xl font-bold">{utente.nomeCompleto}</h1>
          <p className="mt-1 text-sm text-white/80">
            {utente.tipoDocumento === "BI" ? "BI" : "Passaporte"}:{" "}
            {utente.numeroDocumento}
            {utente.seguradora ? ` · Seguro: ${utente.seguradora.nome}` : " · Sem seguro"}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Ficha de saúde */}
        <section className="card p-6">
          <h2 className="text-xl font-bold">A minha ficha de saúde</h2>
          <p className="mb-4 mt-1 text-sm text-gray-500">
            Informação clínica de base, disponível para as unidades onde for atendido.
          </p>
          <FichaSaudeForm ficha={utente.fichaSaude} />
        </section>

        {/* Agregado familiar */}
        <section className="card p-6">
          <h2 className="text-xl font-bold">O meu agregado familiar</h2>
          <p className="mb-4 mt-1 text-sm text-gray-500">
            Adicione filhos, cônjuge ou pais à sua responsabilidade.
          </p>
          <AgregadoFamiliar
            dependentes={dependentes.map((d) => ({
              id: d.id,
              nomeCompleto: d.nomeCompleto,
              parentesco: d.parentesco,
              dataNascimento: d.dataNascimento.toISOString(),
            }))}
          />
        </section>
      </div>

      {/* Marcações */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">As minhas marcações</h2>
          <Link href="/directorio" className="btn-ghost py-2">
            Nova marcação
          </Link>
        </div>

        {marcacoes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            Ainda não tem marcações. Encontre uma unidade no diretório para marcar
            a sua consulta.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-base-line">
            {marcacoes.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold">{m.unidade.nome}</p>
                  <p className="text-sm text-gray-500">
                    {m.especialidade?.nome ?? "Consulta"}
                    {m.medico ? ` · ${m.medico.nome}` : ""}
                    {m.dependente ? ` · para ${m.dependente.nomeCompleto}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Intl.DateTimeFormat("pt-PT", {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(m.dataHora)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`badge ${COR_ESTADO_MARCACAO[m.estado]}`}>
                    {ETIQUETA_ESTADO_MARCACAO[m.estado]}
                  </span>
                  {m.pagamento && (
                    <p className="mt-1 text-sm text-gray-500">
                      {formatarKz(m.pagamento.valorCentimos)} ·{" "}
                      {ETIQUETA_METODO_PAGAMENTO[m.pagamento.metodo]}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
