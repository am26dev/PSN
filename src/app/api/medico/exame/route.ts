import { NextResponse } from "next/server";
import { exameSchema } from "@/lib/validacao";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { registarExame } from "@/lib/services/medico.service";

/** Registar um exame clínico (profissional de saúde). */
export async function POST(req: Request) {
  try {
    const medico = await exigirSessao();
    exigirPapel(medico, ["PROFISSIONAL", "ADMIN"]);
    const corpo = await lerJson(req);
    const r = exameSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    await registarExame(medico, r.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
