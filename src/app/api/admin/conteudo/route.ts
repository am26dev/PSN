import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { CAMPOS_CONTEUDO } from "@/lib/conteudo";

const CHAVES_VALIDAS = new Set(CAMPOS_CONTEUDO.map((c) => c.chave));

/** Atualizar os textos editáveis do site (admin). */
export async function PATCH(req: Request) {
  const admin = await utenteAtual();
  if (!admin || admin.papel !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso reservado à administração." }, { status: 403 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  if (typeof corpo !== "object" || corpo === null) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
  }

  const entradas = Object.entries(corpo as Record<string, unknown>).filter(
    ([chave, valor]) => CHAVES_VALIDAS.has(chave) && typeof valor === "string",
  ) as [string, string][];

  if (entradas.length === 0) {
    return NextResponse.json({ erro: "Nenhum campo válido." }, { status: 422 });
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

  return NextResponse.json({ ok: true });
}
