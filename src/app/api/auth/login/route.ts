import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validacao";
import { verificarPassword, criarSessao } from "@/lib/auth";
import { normalizarDocumento } from "@/lib/documento";

export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = loginSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
  }

  const numeroDocumento = normalizarDocumento(r.data.numeroDocumento);
  const utente = await prisma.utente.findUnique({ where: { numeroDocumento } });

  // Mensagem genérica para não revelar se o documento existe.
  const credenciaisInvalidas = NextResponse.json(
    { erro: "Documento ou palavra-passe incorretos." },
    { status: 401 },
  );

  if (!utente || !utente.ativo) return credenciaisInvalidas;

  const ok = await verificarPassword(utente.passwordHash, r.data.password);
  if (!ok) return credenciaisInvalidas;

  await criarSessao(utente.id, utente.papel, {
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true, redirect: "/conta" });
}
