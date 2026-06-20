import { NextResponse } from "next/server";
import { utenteAtual } from "@/lib/auth";
import { consultarNif } from "@/lib/identidade/itao";

/**
 * Consulta de dados de um contribuinte/empresa por NIF (dev.it.ao).
 * Restrita a utilizadores autenticados (a chave da API é um segredo do portal
 * e o serviço é pago/limitado).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nif: string }> },
) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  const { nif } = await params;
  const numero = (nif ?? "").trim();
  if (numero.length < 5) {
    return NextResponse.json({ erro: "NIF inválido." }, { status: 422 });
  }

  const r = await consultarNif(numero);
  if (!r.ok) {
    const estado = r.estado >= 400 ? r.estado : 502;
    return NextResponse.json({ erro: r.erro }, { status: estado });
  }

  return NextResponse.json({ ok: true, dados: r.normalizado, bruto: r.dados });
}
