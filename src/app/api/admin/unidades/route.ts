import { NextResponse } from "next/server";
import { unidadeSchema } from "@/lib/validacao";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { criar } from "@/lib/services/unidade.service";

/** Criar uma unidade (admin). */
export async function POST(req: Request) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const corpo = await lerJson(req);
    const r = unidadeSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    const { id } = await criar(r.data);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
