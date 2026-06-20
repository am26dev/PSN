import { NextResponse } from "next/server";
import { carregarDadosPorBI } from "@/lib/siac";
import { validarBI, provinciaDoBI, normalizarDocumento } from "@/lib/documento";

/**
 * Pré-preenchimento do registo a partir do BI.
 * Hoje devolve apenas o que conseguimos inferir localmente (província de emissão)
 * e tenta o SIAC se estiver configurado. Quando o protocolo com o SIAC estiver
 * ativo, devolve os dados completos do cidadão.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bi = normalizarDocumento(searchParams.get("bi") ?? "");

  if (!validarBI(bi)) {
    return NextResponse.json(
      { erro: "Formato de BI inválido. Exemplo: 003456789LA042." },
      { status: 422 },
    );
  }

  const dadosSiac = await carregarDadosPorBI(bi);
  if (dadosSiac) {
    return NextResponse.json({ origem: "SIAC", dados: dadosSiac });
  }

  return NextResponse.json({
    origem: "LOCAL",
    integracaoSiacDisponivel: false,
    dados: { provincia: provinciaDoBI(bi) },
    aviso:
      "A ligação automática ao SIAC ainda não está disponível. Confirme os seus dados manualmente.",
  });
}
