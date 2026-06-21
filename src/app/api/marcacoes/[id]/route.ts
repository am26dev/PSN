import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";

const remarcarSchema = z.object({
  dataHora: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Data/hora inválida.",
  }),
  especialidadeId: z.string().optional(),
  medicoId: z.string().optional(),
  motivo: z.string().optional(),
});

/** Remarcar uma consulta (alterar data/especialidade/médico). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  const { id } = await params;
  const marcacao = await prisma.marcacao.findFirst({
    where: { id, utenteId: utente.id },
  });
  if (!marcacao) {
    return NextResponse.json({ erro: "Marcação não encontrada." }, { status: 404 });
  }
  if (marcacao.estado === "CANCELADA" || marcacao.estado === "CONCLUIDA") {
    return NextResponse.json(
      { erro: "Esta consulta já não pode ser remarcada." },
      { status: 409 },
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = remarcarSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const data = new Date(d.dataHora);
  if (data.getTime() < Date.now()) {
    return NextResponse.json(
      { erro: "A nova data tem de ser no futuro." },
      { status: 422 },
    );
  }

  await prisma.marcacao.update({
    where: { id },
    data: {
      dataHora: data,
      especialidadeId: d.especialidadeId ?? marcacao.especialidadeId,
      medicoId: d.medicoId ?? marcacao.medicoId,
      motivo: d.motivo ?? marcacao.motivo,
      estado: "PENDENTE",
    },
  });

  return NextResponse.json({ ok: true });
}

/** Cancelar uma consulta. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }
  const { id } = await params;
  const marcacao = await prisma.marcacao.findFirst({
    where: { id, utenteId: utente.id },
  });
  if (!marcacao) {
    return NextResponse.json({ erro: "Marcação não encontrada." }, { status: 404 });
  }
  await prisma.marcacao.update({ where: { id }, data: { estado: "CANCELADA" } });
  return NextResponse.json({ ok: true });
}
