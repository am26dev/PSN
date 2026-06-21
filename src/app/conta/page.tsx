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
  ETIQUETA_ESTADO_PAGAMENTO,
  COR_ESTADO_PAGAMENTO,
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
        <div className="flex items-center justify-between gap-4 bg-angola-red px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/40 bg-white/15">
              {utente.avatarKey ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src="/api/perfil/foto" alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                  {utente.nomeCompleto.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-white/80">Bem-vindo(a),</p>
              <h1 className="text-2xl font-bold">{utente.nomeCompleto}</h1>
              <p className="mt-1 text-sm text-white/80">
                {utente.tipoDocumento === "BI" ? "BI" : "Passaporte"}:{" "}
                {utente.numeroDocumento}
                {utente.seguradora ? ` · Seguro: ${utente.seguradora.nome}` : " · Sem seguro"}
              </p>
            </div>
          </div>
          <Link href="/conta/perfil" className="btn-gold shrink-0 py-2">
            Definições
          </Link>
        </div>
      </div>

      {/* Verificação de identidade */}
      <Link
        href="/conta/verificacao"
        className="card flex items-center justify-between p-5 transition hover:shadow-lg"
      >
        <div>
          <h2 className="font-bold">Verificação de identidade</h2>
          <p className="text-sm text-gray-500">
            {utente.verificado
              ? "A sua identidade está verificada."
              : "Confirme a sua identidade para acesso completo aos serviços."}
          </p>
        </div>
        {utente.verificado ? (
          <span className="badge bg-green-100 text-green-700">Verificada ✓</span>
        ) : (
          <span className="badge bg-angola-gold/20 text-angola-gold-dark">Verificar</span>
        )}
      </Link>

      {/* Histórico clínico */}
      <Link
        href="/conta/historico"
        className="card flex items-center justify-between p-5 transition hover:shadow-lg"
      >
        <div>
          <h2 className="font-bold">Histórico clínico</h2>
          <p className="text-sm text-gray-500">
            Consulte os resultados dos seus exames, as suas consultas e
            patologias. Informação privada, visível apenas a si e aos
            profissionais de saúde.
          </p>
        </div>
        <span className="badge bg-angola-red/10 text-angola-red-dark">Ver →</span>
      </Link>

      {(utente.papel === "PROFISSIONAL" || utente.papel === "ADMIN") && (
        <Link
          href="/medico"
          className="card flex items-center justify-between p-5 transition hover:shadow-lg"
        >
          <div>
            <h2 className="font-bold">Portal do Médico</h2>
            <p className="text-sm text-gray-500">
              Pesquise um paciente por BI ou NIF para consultar e registar o
              respetivo histórico clínico.
            </p>
          </div>
          <span className="badge bg-angola-black/10 text-angola-black">Aceder →</span>
        </Link>
      )}

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
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-500">
                        {formatarKz(m.pagamento.valorCentimos)} ·{" "}
                        {ETIQUETA_METODO_PAGAMENTO[m.pagamento.metodo]}
                      </p>
                      <span className={`badge ${COR_ESTADO_PAGAMENTO[m.pagamento.estado]}`}>
                        {ETIQUETA_ESTADO_PAGAMENTO[m.pagamento.estado]}
                      </span>
                      {m.pagamento.estado === "AGUARDA" &&
                        m.pagamento.referenciaEmis && (
                          <p className="text-xs text-gray-400">
                            Entidade {m.pagamento.entidade} · Ref.{" "}
                            {m.pagamento.referenciaEmis}
                          </p>
                        )}
                    </div>
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
