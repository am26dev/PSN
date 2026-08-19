import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── Leituras de seguros ──────────────────────────────────────────────────────

/** Todas as seguradoras ativas (home page). */
export const listarTodasSeguradoras = unstable_cache(
  async () =>
    prisma.seguradora.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
  ["seguradoras-todas"],
  { revalidate: 3600, tags: ["seguradoras"] },
);

/** Seguradoras ativas com pelo menos uma unidade associada (filtro do diretório). */
export const listarSeguradorasAtivas = unstable_cache(
  async () =>
    prisma.seguradora.findMany({
      where: { ativo: true, unidades: { some: {} } },
      orderBy: { nome: "asc" },
    }),
  ["seguradoras-com-unidades"],
  { revalidate: 3600, tags: ["seguradoras"] },
);
