import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { unidadeSchema } from "@/lib/validacao";

async function exigirAdmin() {
  const admin = await utenteAtual();
  return admin && admin.papel === "ADMIN" ? admin : null;
}

/** Atualizar uma unidade (admin). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ erro: "Acesso reservado à administração." }, { status: 403 });
  }
  const { id } = await params;

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = unidadeSchema.partial().safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const existe = await prisma.unidade.findUnique({ where: { id } });
  if (!existe) {
    return NextResponse.json({ erro: "Unidade não encontrada." }, { status: 404 });
  }

  await prisma.unidade.update({
    where: { id },
    data: {
      ...(d.nome !== undefined && { nome: d.nome }),
      ...(d.tipo !== undefined && { tipo: d.tipo }),
      ...(d.provincia !== undefined && { provincia: d.provincia }),
      ...(d.municipio !== undefined && { municipio: d.municipio }),
      ...(d.morada !== undefined && { morada: d.morada || null }),
      ...(d.telefone !== undefined && { telefone: d.telefone || null }),
      ...(d.horario !== undefined && { horario: d.horario || null }),
      ...(d.urgencia24h !== undefined && { urgencia24h: d.urgencia24h }),
      ...(d.logoUrl !== undefined && { logoUrl: d.logoUrl || null }),
      ...(d.bannerUrl !== undefined && { bannerUrl: d.bannerUrl || null }),
      ...(d.descricao !== undefined && { descricao: d.descricao || null }),
      ...(d.ativo !== undefined && { ativo: d.ativo }),
    },
  });

  return NextResponse.json({ ok: true });
}

/** Desativar (ocultar) uma unidade. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ erro: "Acesso reservado à administração." }, { status: 403 });
  }
  const { id } = await params;
  await prisma.unidade.update({ where: { id }, data: { ativo: false } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
