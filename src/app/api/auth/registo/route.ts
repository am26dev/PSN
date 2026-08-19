import { NextResponse } from "next/server";
import { registoSchema } from "@/lib/validacao";
import { lerJson, respostaErro, exigirRateLimit } from "@/lib/services/http";
import { registarUtente } from "@/lib/services/auth.service";

/** Registar um novo utente e iniciar sessão. */
export async function POST(req: Request) {
  try {
    exigirRateLimit(req, "auth:registo", 3, 60_000); // 3/min por IP
    const corpo = await lerJson(req);
    const r = registoSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json(
        { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 422 },
      );
    }
    await registarUtente(r.data, req.headers.get("user-agent") ?? undefined);
    return NextResponse.json({ ok: true, redirect: "/conta" }, { status: 201 });
  } catch (e) {
    return respostaErro(e);
  }
}
