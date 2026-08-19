import { NextResponse } from "next/server";
import { exigirSessao, exigirPapel, lerFormData, respostaErro } from "@/lib/services/http";
import { guardarPublico } from "@/lib/services/ficheiro.service";

/** Upload de imagem pública (logótipos/banners de unidades). Admin. */
export async function POST(req: Request) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const form = await lerFormData(req);
    const ficheiro = form.get("ficheiro");
    const { url } = await guardarPublico(ficheiro as File);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return respostaErro(e);
  }
}
