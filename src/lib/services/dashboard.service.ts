import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Agregados do painel de administração.
 * Centraliza todas as queries de leitura do dashboard admin num único service,
 * evitando que a page.tsx chame prisma diretamente.
 */
export const listarDashboardAdmin = unstable_cache(
  async () => {
    const [
      totalUtentes,
      verificados,
      hospitais,
      prestadores,
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
      prisma.unidade.count({
        where: { tipo: { notIn: ["HOSPITAL_PUBLICO", "FARMACIA"] }, ativo: true },
      }),
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

    return {
      totalUtentes,
      verificados,
      hospitais,
      prestadores,
      farmacias,
      totalMarcacoes,
      marcacoesPendentes,
      verificacoesEmAnalise,
      receita: pagamentosPagos._sum.valorCentimos ?? 0,
      utentesRecentes,
      marcacoesRecentes,
    };
  },
  ["dashboard-admin"],
  { revalidate: 300, tags: ["admin", "dashboard"] },
);
