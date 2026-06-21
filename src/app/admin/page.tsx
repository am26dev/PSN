import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { formatarKz } from "@/lib/moeda";
import {
  ETIQUETA_ESTADO_MARCACAO,
  COR_ESTADO_MARCACAO,
} from "@/lib/etiquetas";

export default async function AdminDashboard() {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const [
    totalUtentes,
    verificados,
    hospitais,
    clinicas,
    farmacias,
    totalMarcacoes,
    marcacoesPendentes,
    verificacoesEmAnalise,
    pagamentosPagos,
    utentesRecentes,
    marcacoesRecentes,
  ] = await Promise.all([
    prisma.utente.count(),
    prisma.utente.count({ where: { verificado: true } }),
    prisma.unidade.count({ where: { tipo: "HOSPITAL_PUBLICO", ativo: true } }),
    prisma.unidade.count({ where: { tipo: "CLINICA_PRIVADA", ativo: true } }),
    prisma.unidade.count({ where: { tipo: "FARMACIA", ativo: true } }),
    prisma.marcacao.count(),
    prisma.marcacao.count({ where: { estado: "PENDENTE" } }),
    prisma.verificacao.count({ where: { estado: "EM_ANALISE" } }),
    prisma.pagamento.aggregate({
      where: { estado: "PAGO" },
      _sum: { valorCentimos: true },
    }),
    prisma.utente.findMany({
      orderBy: { criadoEm: "desc" },
      take: 6,
      select: {
        id: true,
        nomeCompleto: true,
        numeroDocumento: true,
        papel: true,
        verificado: true,
      },
    }),
    prisma.marcacao.findMany({
      orderBy: { criadoEm: "desc" },
      take: 6,
      include: { unidade: true, utente: { select: { nomeCompleto: true } } },
    }),
  ]);

  const receita = pagamentosPagos._sum.valorCentimos ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
          <p className="text-gray-600">Visão geral do Portal de Saúde Nacional.</p>
        </div>
        <Link href="/admin/verificacoes" className="btn-primary">
          Verificações
          {verificacoesEmAnalise > 0 && (
            <span className="ml-1 rounded-full bg-white/25 px-2 text-xs">
              {verificacoesEmAnalise}
            </span>
          )}
        </Link>
      </div>

      {/* Indicadores */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador titulo="Utentes registados" valor={totalUtentes} nota={`${verificados} verificados`} />
        <Indicador titulo="Marcações" valor={totalMarcacoes} nota={`${marcacoesPendentes} pendentes`} />
        <Indicador
          titulo="Verificações a rever"
          valor={verificacoesEmAnalise}
          destaque={verificacoesEmAnalise > 0}
        />
        <Indicador titulo="Receita confirmada" valorTexto={formatarKz(receita)} />
      </section>

      {/* Rede */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Indicador titulo="Hospitais públicos" valor={hospitais} />
        <Indicador titulo="Clínicas privadas" valor={clinicas} />
        <Indicador titulo="Farmácias" valor={farmacias} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Utentes recentes */}
        <section className="card p-6">
          <h2 className="text-lg font-bold">Utentes recentes</h2>
          {utentesRecentes.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Ainda não há utentes.</p>
          ) : (
            <ul className="mt-3 divide-y divide-base-line">
              {utentesRecentes.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{u.nomeCompleto}</p>
                    <p className="text-sm text-gray-500">{u.numeroDocumento}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.papel === "ADMIN" && (
                      <span className="badge bg-angola-red/10 text-angola-red-dark">Admin</span>
                    )}
                    <span
                      className={`badge ${
                        u.verificado
                          ? "bg-green-100 text-green-700"
                          : "bg-base-muted text-gray-500"
                      }`}
                    >
                      {u.verificado ? "Verificado" : "Por verificar"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Marcações recentes */}
        <section className="card p-6">
          <h2 className="text-lg font-bold">Marcações recentes</h2>
          {marcacoesRecentes.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Ainda não há marcações.</p>
          ) : (
            <ul className="mt-3 divide-y divide-base-line">
              {marcacoesRecentes.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{m.unidade.nome}</p>
                    <p className="text-sm text-gray-500">
                      {m.utente.nomeCompleto} ·{" "}
                      {new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "short" }).format(m.dataHora)}
                    </p>
                  </div>
                  <span className={`badge ${COR_ESTADO_MARCACAO[m.estado]}`}>
                    {ETIQUETA_ESTADO_MARCACAO[m.estado]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Atalhos de gestão (CMS) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Atalho href="/admin/unidades" titulo="Gerir unidades" texto="Adicionar e editar hospitais, clínicas e farmácias." />
        <Atalho href="/admin/utentes" titulo="Gerir utilizadores" texto="Definir níveis de acesso (utente, profissional, admin)." />
        <Atalho href="/admin/verificacoes" titulo="Verificações" texto="Aprovar ou rejeitar documentos dos utentes." />
        <Atalho href="/directorio" titulo="Rede de saúde" texto="Ver o portal como os utentes o veem." />
      </section>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  valorTexto,
  nota,
  destaque,
}: {
  titulo: string;
  valor?: number;
  valorTexto?: string;
  nota?: string;
  destaque?: boolean;
}) {
  return (
    <div className={`card p-5 ${destaque ? "ring-2 ring-angola-gold" : ""}`}>
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="mt-1 text-3xl font-extrabold text-angola-red">
        {valorTexto ?? valor}
      </p>
      {nota && <p className="mt-1 text-xs text-gray-400">{nota}</p>}
    </div>
  );
}

function Atalho({ href, titulo, texto }: { href: string; titulo: string; texto: string }) {
  return (
    <Link href={href} className="card block p-5 transition hover:shadow-lg">
      <div className="mb-2 h-1.5 w-10 rounded-full bg-angola-gold" />
      <p className="font-bold">{titulo}</p>
      <p className="mt-1 text-sm text-gray-500">{texto}</p>
    </Link>
  );
}
