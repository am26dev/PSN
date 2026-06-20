import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { marcacaoSchema } from "@/lib/validacao";
import { precoConsulta } from "@/lib/precos";

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

  const r = marcacaoSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const unidade = await prisma.unidade.findUnique({ where: { id: d.unidadeId } });
  if (!unidade || !unidade.ativo) {
    return NextResponse.json({ erro: "Unidade não encontrada." }, { status: 404 });
  }

  // Se for para um dependente, confirma que pertence ao agregado deste utente.
  if (d.dependenteId) {
    const dep = await prisma.dependente.findFirst({
      where: { id: d.dependenteId, responsavelId: utente.id },
    });
    if (!dep) {
      return NextResponse.json(
        { erro: "Dependente inválido." },
        { status: 403 },
      );
    }
  }

  const data = new Date(d.dataHora);
  if (data.getTime() < Date.now()) {
    return NextResponse.json(
      { erro: "A data da consulta tem de ser no futuro." },
      { status: 422 },
    );
  }

  const valor = precoConsulta(unidade.tipo);
  const isento = d.metodoPagamento === "SEGURO_SAUDE" && !!utente.seguradoraId;

  const marcacao = await prisma.marcacao.create({
    data: {
      utenteId: utente.id,
      dependenteId: d.dependenteId ?? null,
      unidadeId: d.unidadeId,
      especialidadeId: d.especialidadeId ?? null,
      medicoId: d.medicoId ?? null,
      dataHora: data,
      motivo: d.motivo ?? null,
      estado: "PENDENTE",
      pagamento: {
        create: {
          metodo: d.metodoPagamento,
          valorCentimos: valor,
          estado: isento ? "ISENTO" : "AGUARDA",
        },
      },
    },
  });

  return NextResponse.json({ ok: true, id: marcacao.id }, { status: 201 });
}
