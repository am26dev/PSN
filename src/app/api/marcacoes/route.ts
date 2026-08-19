import { NextResponse } from "next/server";
import { marcacaoSchema } from "@/lib/validacao";
import { exigirSessao, lerJson, respostaErro } from "@/lib/services/http";
import { criarMarcacao } from "@/lib/services/marcacao.service";

/** Criar uma marcação de consulta (utente autenticado). */
export async function POST(req: Request) {
  try {
    const utente = await exigirSessao();
    const corpo = await lerJson(req);
    const r = marcacaoSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    const { id, pagamento } = await criarMarcacao(utente, r.data);
    return NextResponse.json({ ok: true, id, pagamento }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
