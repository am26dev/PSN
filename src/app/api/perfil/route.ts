import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { perfilSchema } from "@/lib/validacao";

/** Atualizar o perfil do próprio utente. */
export async function PATCH(req: Request) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = perfilSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  await prisma.utente.update({
    where: { id: utente.id },
    data: {
      ...(d.nomeCompleto !== undefined && { nomeCompleto: d.nomeCompleto }),
      ...(d.telefone !== undefined && { telefone: d.telefone || null }),
      ...(d.email !== undefined && { email: d.email || null }),
      ...(d.nif !== undefined && { nif: d.nif || null }),
      ...(d.morada !== undefined && { morada: d.morada || null }),
      ...(d.provincia !== undefined && { provincia: d.provincia || null }),
      ...(d.municipio !== undefined && { municipio: d.municipio || null }),
    },
  });

  return NextResponse.json({ ok: true });
}
