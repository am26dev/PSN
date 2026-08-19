import { NextResponse } from "next/server";
import { dependenteSchema } from "@/lib/validacao";
import { exigirSessao, lerJson, respostaErro } from "@/lib/services/http";
import { criarDependente } from "@/lib/services/dependente.service";

/** Registar um dependente do agregado familiar. */
export async function POST(req: Request) {
  try {
    const utente = await exigirSessao();
    const corpo = await lerJson(req);
    const r = dependenteSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    const { id } = await criarDependente(utente, r.data);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
