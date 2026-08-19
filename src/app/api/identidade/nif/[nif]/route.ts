import { NextResponse } from "next/server";
import { exigirSessao, respostaErro } from "@/lib/services/http";
import { consultarNif } from "@/lib/services/identidade.service";

/**
 * Consulta de dados de um contribuinte/empresa por NIF (dev.it.ao).
 * Restrita a utilizadores autenticados (a chave da API é um segredo do portal).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nif: string }> },
) {
  try {
    await exigirSessao();
    const { nif } = await params;
    const { dados, bruto } = await consultarNif(nif);
    return NextResponse.json({ ok: true, dados, bruto });
  } catch (e) {
    return respostaErro(e);
  }
}
