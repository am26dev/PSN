import { NextResponse } from "next/server";
import { patologiaSchema } from "@/lib/validacao";
import { exigirSessao, exigirPapel, lerJson, respostaErro } from "@/lib/services/http";
import { registarPatologia } from "@/lib/services/medico.service";

/** Registar uma patologia (profissional de saúde). */
export async function POST(req: Request) {
  try {
    const medico = await exigirSessao();
    exigirPapel(medico, ["PROFISSIONAL", "ADMIN"]);
    const corpo = await lerJson(req);
    const r = patologiaSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    await registarPatologia(medico, r.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
