import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";

const fichaSchema = z.object({
  tipoSanguineo: z.string().max(4).optional().or(z.literal("")),
  alergias: z.string().max(2000).optional().or(z.literal("")),
  doencasCronicas: z.string().max(2000).optional().or(z.literal("")),
  medicacaoAtual: z.string().max(2000).optional().or(z.literal("")),
});

export async function PUT(req: Request) {
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

  const r = fichaSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
  }
  const d = r.data;

  const dados = {
    tipoSanguineo: d.tipoSanguineo || null,
    alergias: d.alergias || null,
    doencasCronicas: d.doencasCronicas || null,
    medicacaoAtual: d.medicacaoAtual || null,
  };

  await prisma.fichaSaude.upsert({
    where: { utenteId: utente.id },
    update: dados,
    create: { utenteId: utente.id, ...dados },
  });

  return NextResponse.json({ ok: true });
}
