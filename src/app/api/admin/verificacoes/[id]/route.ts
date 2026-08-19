import { NextResponse } from "next/server";
import { revisaoVerificacaoSchema } from "@/lib/validacao";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { rever } from "@/lib/services/verificacao.service";

/** Aprovar ou rejeitar uma verificação (apenas administradores). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const { id } = await params;
    const corpo = await lerJson(req);
    const r = revisaoVerificacaoSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
    }
    const { estado } = await rever(admin, id, r.data);
    return NextResponse.json({ ok: true, estado });
  } catch (e) {
    return respostaErro(e);
  }
}
