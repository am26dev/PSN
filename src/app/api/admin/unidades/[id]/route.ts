import { NextResponse } from "next/server";
import { unidadeSchema } from "@/lib/validacao";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { atualizar, desativar } from "@/lib/services/unidade.service";

type Params = { params: Promise<{ id: string }> };

/** Atualizar uma unidade (admin). */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const { id } = await params;
    const corpo = await lerJson(req);
    const r = unidadeSchema.partial().safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    await atualizar(id, r.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}

/** Desativar (ocultar) uma unidade (admin). */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const { id } = await params;
    await desativar(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
