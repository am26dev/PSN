import "server-only";
import { prisma } from "@/lib/prisma";
import { CAMPOS_CONTEUDO } from "@/lib/conteudo";
import { ServiceError } from "./http";

const CHAVES_VALIDAS = new Set(CAMPOS_CONTEUDO.map((c) => c.chave));

/** Atualiza os textos editáveis do site (administração). */
export async function atualizarCampos(
  corpo: Record<string, unknown>,
): Promise<void> {
  if (typeof corpo !== "object" || corpo === null) {
    throw new ServiceError(422, "Dados inválidos.");
  }

  const entradas = Object.entries(corpo).filter(
    ([chave, valor]) => CHAVES_VALIDAS.has(chave) && typeof valor === "string",
  ) as [string, string][];

  if (entradas.length === 0) {
    throw new ServiceError(422, "Nenhum campo válido.");
  }

  await prisma.$transaction(
    entradas.map(([chave, valor]) =>
      prisma.conteudoSite.upsert({
        where: { chave },
        update: { valor: valor.slice(0, 4000) },
        create: { chave, valor: valor.slice(0, 4000) },
      }),
    ),
  );
}
