import { NextResponse } from "next/server";
import { carregarDadosPorBI } from "@/lib/identidade/prefill";
import { validarBI, normalizarDocumento } from "@/lib/documento";

/**
 * Pré-preenchimento do registo a partir do BI (consulta dev.it.ao).
 * Usado pelo botão "Carregar dados" no formulário de registo.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bi = normalizarDocumento(searchParams.get("numero") ?? "");

  if (!validarBI(bi)) {
    return NextResponse.json(
      { erro: "Formato de BI inválido. Exemplo: 003456789LA042." },
      { status: 422 },
    );
  }

  const resultado = await carregarDadosPorBI(bi);
  return NextResponse.json(resultado);
}
