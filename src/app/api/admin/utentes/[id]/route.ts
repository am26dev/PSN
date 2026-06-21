import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { utenteAdminSchema } from "@/lib/validacao";

/** Alterar nível de acesso / estado de um utente (admin). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await utenteAtual();
  if (!admin || admin.papel !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso reservado à administração." }, { status: 403 });
  }

  const { id } = await params;

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = utenteAdminSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
  }
  const d = r.data;

  // Salvaguarda: o admin não se pode despromover/desativar a si próprio.
  if (id === admin.id && (d.papel === "UTENTE" || d.ativo === false)) {
    return NextResponse.json(
      { erro: "Não pode remover o seu próprio acesso de administrador." },
      { status: 422 },
    );
  }

  const existe = await prisma.utente.findUnique({ where: { id } });
  if (!existe) {
    return NextResponse.json({ erro: "Utente não encontrado." }, { status: 404 });
  }

  await prisma.utente.update({
    where: { id },
    data: {
      ...(d.papel !== undefined && { papel: d.papel }),
      ...(d.verificado !== undefined && { verificado: d.verificado }),
      ...(d.ativo !== undefined && { ativo: d.ativo }),
    },
  });

  return NextResponse.json({ ok: true });
}
