import { NextResponse } from "next/server";
import { marcacaoSchema } from "@/lib/validacao";
import { exigirSessao, lerJson, respostaErro } from "@/lib/services/http";
import {
  cancelarMarcacao,
  remarcar,
} from "@/lib/services/marcacao.service";

type Params = { params: Promise<{ id: string }> };

/** Remarcar uma consulta (apenas o dono). */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const utente = await exigirSessao();
    const { id } = await params;
    const corpo = await lerJson(req);
    const r = marcacaoSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    await remarcar(utente, id, r.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}

/** Cancelar uma consulta (apenas o dono). */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const utente = await exigirSessao();
    const { id } = await params;
    await cancelarMarcacao(utente, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
