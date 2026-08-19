import { NextResponse } from "next/server";
import { exigirSessao, lerFormData, respostaErro } from "@/lib/services/http";
import { uploadFoto } from "@/lib/services/perfil.service";
import { lerFicheiro } from "@/lib/armazenamento";

/** Carregar/atualizar a foto de perfil. */
export async function POST(req: Request) {
  try {
    const utente = await exigirSessao();
    const form = await lerFormData(req);
    const ficheiro = form.get("ficheiro");
    if (!(ficheiro instanceof File)) {
      return NextResponse.json({ erro: "Ficheiro em falta." }, { status: 422 });
    }
    await uploadFoto(utente, ficheiro);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}

/** Serve a foto de perfil do próprio utente. */
export async function GET() {
  try {
    const utente = await exigirSessao();
    if (!utente.avatarKey) {
      return new NextResponse(null, { status: 404 });
    }
    const { buffer, contentType } = await lerFicheiro(utente.avatarKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return respostaErro(e);
  }
}
