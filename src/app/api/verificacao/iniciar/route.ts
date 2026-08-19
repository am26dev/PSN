import { NextResponse } from "next/server";
import { iniciarVerificacaoSchema } from "@/lib/validacao";
import { exigirSessao, lerJson, respostaErro, exigirRateLimit } from "@/lib/services/http";
import { iniciar } from "@/lib/services/verificacao.service";

/** Iniciar (ou retomar) o processo de verificação de identidade. */
export async function POST(req: Request) {
  try {
    exigirRateLimit(req, "verificacao:iniciar", 5, 3_600_000); // 5/h por IP
    const utente = await exigirSessao();
    const corpo = await lerJson(req);
    const r = iniciarVerificacaoSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    const { id } = await iniciar(utente, r.data);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
