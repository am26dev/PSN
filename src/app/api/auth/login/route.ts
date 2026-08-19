import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validacao";
import { lerJson, respostaErro, exigirRateLimit } from "@/lib/services/http";
import { autenticar } from "@/lib/services/auth.service";

/** Autenticar um utente (documento + palavra-passe). */
export async function POST(req: Request) {
  try {
    exigirRateLimit(req, "auth:login", 5, 60_000); // 5/min por IP
    const corpo = await lerJson(req);
    const r = loginSchema.safeParse(corpo);
    if (!r.success) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
    }
    await autenticar(r.data, req.headers.get("user-agent") ?? undefined);
    return NextResponse.json({ ok: true, redirect: "/conta" });
  } catch (e) {
    return respostaErro(e);
  }
}
