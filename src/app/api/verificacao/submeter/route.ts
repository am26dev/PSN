import { NextResponse } from "next/server";
import { exigirSessao, lerJson, respostaErro } from "@/lib/services/http";
import { submeter } from "@/lib/services/verificacao.service";

/** Submeter a verificação para análise. */
export async function POST(req: Request) {
  try {
    const utente = await exigirSessao();
    const corpo = await lerJson(req);
    const verificacaoId = (corpo as { verificacaoId?: string })?.verificacaoId;
    const { estado } = await submeter(utente, verificacaoId ?? "");
    return NextResponse.json({ ok: true, estado });
  } catch (e) {
    return respostaErro(e);
  }
}
