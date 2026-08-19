import { NextResponse } from "next/server";
import { respostaErro, exigirRateLimit } from "@/lib/services/http";
import { consultarPorBI } from "@/lib/services/identidade.service";

/**
 * Pré-preenchimento do registo a partir do BI (consulta dev.it.ao).
 * Usado pelo botão "Carregar dados" no formulário de registo.
 */
export async function GET(req: Request) {
  try {
    exigirRateLimit(req, "identidade:consultar", 10, 60_000); // 10/min por IP
    const { searchParams } = new URL(req.url);
    const resultado = await consultarPorBI(searchParams.get("numero") ?? "");
    return NextResponse.json(resultado);
  } catch (e) {
    return respostaErro(e);
  }
}
