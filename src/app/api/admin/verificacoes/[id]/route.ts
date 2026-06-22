import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { revisaoVerificacaoSchema } from "@/lib/validacao";

/** Aprovar ou rejeitar uma verificação (apenas administradores). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await utenteAtual();
  if (!admin) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }
  if (admin.papel !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso reservado à administração." }, { status: 403 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = revisaoVerificacaoSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
  }
  const { acao, motivo } = r.data;

  const { id } = await params;
  const verificacao = await prisma.verificacao.findUnique({ where: { id } });
  if (!verificacao) {
    return NextResponse.json({ erro: "Verificação não encontrada." }, { status: 404 });
  }
  if (verificacao.estado === "APROVADO" || verificacao.estado === "REJEITADO") {
    return NextResponse.json({ erro: "Verificação já revista." }, { status: 409 });
  }

  if (acao === "REJEITAR" && !motivo) {
    return NextResponse.json(
      { erro: "Indique o motivo da rejeição." },
      { status: 422 },
    );
  }

  const aprovar = acao === "APROVAR";
  const novoEstado = aprovar ? "APROVADO" : "REJEITADO";

  await prisma.$transaction(async (tx) => {
    await tx.verificacao.update({
      where: { id },
      data: {
        estado: novoEstado,
        motivoRejeicao: aprovar ? null : motivo,
        revistoPorId: admin.id,
        revistoEm: new Date(),
        eventos: {
          create: {
            evento: aprovar ? "VERIFICACAO_APROVADA" : "VERIFICACAO_REJEITADA",
            metadata: { revistoPor: admin.id, motivo: motivo ?? null },
          },
        },
      },
    });

    // Quando aprovada, marca o utente como verificado.
    if (aprovar) {
      await tx.utente.update({
        where: { id: verificacao.utenteId },
        data: { verificado: true },
      });
    }
  });

  return NextResponse.json({ ok: true, estado: novoEstado });
}
