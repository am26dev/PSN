import { NextResponse } from "next/server";
import { utenteAdminSchema } from "@/lib/validacao";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { alterarAcesso } from "@/lib/services/utenteAdmin.service";

/** Alterar nível de acesso / estado de um utente (admin). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await exigirSessao();
    exigirPapel(admin, ["ADMIN"]);
    const { id } = await params;
    const corpo = await lerJson(req);
    const r = utenteAdminSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
    }
    await alterarAcesso(admin, id, r.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
