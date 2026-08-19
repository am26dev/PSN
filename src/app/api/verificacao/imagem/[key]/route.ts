import { NextResponse } from "next/server";
import { exigirSessao, respostaErro } from "@/lib/services/http";
import { exigirAcessoImagem } from "@/lib/services/verificacao.service";
import { lerFicheiro } from "@/lib/armazenamento";

/**
 * Serve uma imagem de verificação de forma protegida. Apenas o dono da
 * verificação ou um administrador podem aceder; os documentos nunca têm URL pública.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const utente = await exigirSessao();
    const { key } = await params;
    await exigirAcessoImagem(utente, key);
    const { buffer, contentType } = await lerFicheiro(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
      },
    });
  } catch (e) {
    return respostaErro(e);
  }
}
