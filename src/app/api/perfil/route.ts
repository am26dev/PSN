import { NextResponse } from "next/server";
import { perfilSchema } from "@/lib/validacao";
import { exigirSessao, lerJson, respostaErro } from "@/lib/services/http";
import { atualizarPerfil } from "@/lib/services/perfil.service";

/** Atualizar o perfil do próprio utente. */
export async function PATCH(req: Request) {
  try {
    const utente = await exigirSessao();
    const corpo = await lerJson(req);
    const r = perfilSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    await atualizarPerfil(utente, r.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
