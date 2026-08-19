import { NextResponse } from "next/server";
import { exigirSessao, lerFormData, respostaErro } from "@/lib/services/http";
import { carregarImagem } from "@/lib/services/verificacao.service";

/** Carregar uma imagem (frente/verso/selfie) para a verificação. */
export async function POST(req: Request) {
  try {
    const utente = await exigirSessao();
    const form = await lerFormData(req);
    const verificacaoId = String(form.get("verificacaoId") ?? "");
    const tipo = String(form.get("tipo") ?? "");
    const ficheiro = form.get("ficheiro");
    if (!(ficheiro instanceof File)) {
      return NextResponse.json({ erro: "Ficheiro em falta." }, { status: 422 });
    }
    const { key } = await carregarImagem(utente, verificacaoId, tipo, ficheiro);
    return NextResponse.json({ ok: true, key });
  } catch (e) {
    return respostaErro(e);
  }
}
