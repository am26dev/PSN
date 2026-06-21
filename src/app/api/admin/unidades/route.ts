import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { unidadeSchema } from "@/lib/validacao";

/** Criar uma unidade (admin). */
export async function POST(req: Request) {
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

  const r = unidadeSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const unidade = await prisma.unidade.create({
    data: {
      nome: d.nome,
      tipo: d.tipo,
      provincia: d.provincia,
      municipio: d.municipio,
      morada: d.morada || null,
      telefone: d.telefone || null,
      horario: d.horario || null,
      urgencia24h: d.urgencia24h ?? false,
      logoUrl: d.logoUrl || null,
      bannerUrl: d.bannerUrl || null,
      descricao: d.descricao || null,
      ativo: d.ativo ?? true,
    },
  });

  return NextResponse.json({ ok: true, id: unidade.id }, { status: 201 });
}
