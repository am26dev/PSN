import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { dependenteSchema } from "@/lib/validacao";

export async function POST(req: Request) {
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

  const r = dependenteSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const dependente = await prisma.dependente.create({
    data: {
      responsavelId: utente.id,
      parentesco: d.parentesco,
      tipoDocumento: d.tipoDocumento,
      numeroDocumento: d.numeroDocumento || null,
      nomeCompleto: d.nomeCompleto,
      dataNascimento: new Date(d.dataNascimento),
      sexo: d.sexo,
    },
  });

  return NextResponse.json({ ok: true, id: dependente.id }, { status: 201 });
}
