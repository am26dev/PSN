import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { consultaSchema } from "@/lib/validacao";

export async function POST(req: Request) {
  const medico = await utenteAtual();
  if (!medico || (medico.papel !== "PROFISSIONAL" && medico.papel !== "ADMIN")) {
    return NextResponse.json({ erro: "Acesso reservado a profissionais de saúde." }, { status: 403 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = consultaSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: r.error.issues[0]?.message ?? "Dados inválidos." }, { status: 422 });
  }
  const d = r.data;

  const paciente = await prisma.utente.findUnique({ where: { id: d.pacienteId } });
  if (!paciente) {
    return NextResponse.json({ erro: "Paciente não encontrado." }, { status: 404 });
  }

  await prisma.consulta.create({
    data: {
      pacienteId: d.pacienteId,
      profissionalId: medico.id,
      profissionalNome: medico.nomeCompleto,
      unidadeNome: d.unidadeNome || null,
      motivo: d.motivo || null,
      diagnostico: d.diagnostico || null,
      notas: d.notas || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
