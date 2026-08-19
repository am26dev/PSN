import { NextResponse } from "next/server";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { atualizarCampos } from "@/lib/services/conteudo.service";

/** Atualizar os textos editáveis do site (admin). */
export async function PATCH(req: Request) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const corpo = await lerJson(req);
    await atualizarCampos(corpo as Record<string, unknown>);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
