import { NextResponse } from "next/server";
import { fichaSchema, gravarFicha } from "@/lib/services/ficha.service";
import { exigirSessao, lerJson, respostaErro } from "@/lib/services/http";

/** Gravar a ficha clínica do próprio utente. */
export async function PUT(req: Request) {
  try {
    const utente = await exigirSessao();
    const corpo = await lerJson(req);
    const r = fichaSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
    }
    await gravarFicha(utente, r.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
