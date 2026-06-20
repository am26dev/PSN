import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verificarAssinaturaWebhook,
  mapearEstadoPay4all,
} from "@/lib/pagamentos/pay4all";

/**
 * Webhook de confirmação de pagamento da Pay4all.
 * A Pay4all chama este endpoint quando o estado de uma cobrança muda
 * (ex.: referência paga). A correspondência faz-se pela referência interna
 * (id do nosso Pagamento) ou pelo identificador da transação do parceiro.
 *
 * Segurança: o corpo é validado por assinatura HMAC-SHA256
 * (`x-pay4all-signature`) com o segredo partilhado `PAY4ALL_WEBHOOK_SECRET`.
 */
export async function POST(req: Request) {
  const corpoCru = await req.text();
  const assinatura = req.headers.get("x-pay4all-signature");

  if (!verificarAssinaturaWebhook(corpoCru, assinatura)) {
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 401 });
  }

  let evento: Record<string, unknown>;
  try {
    evento = JSON.parse(corpoCru);
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const dados = (evento.data as Record<string, unknown>) ?? evento;
  const referenciaInterna = String(
    dados.referencia_comerciante ?? dados.referenciaInterna ?? "",
  );
  const idParceiro = String(dados.id ?? dados.transaction_id ?? "");
  const estado = mapearEstadoPay4all(
    String(dados.estado ?? dados.status ?? ""),
  );

  // Localiza o pagamento pelo nosso id (referência interna) ou pelo id do parceiro.
  const pagamento = await prisma.pagamento.findFirst({
    where: {
      OR: [
        referenciaInterna ? { id: referenciaInterna } : undefined,
        idParceiro ? { idParceiro } : undefined,
      ].filter(Boolean) as object[],
    },
  });

  if (!pagamento) {
    return NextResponse.json({ erro: "Pagamento não encontrado." }, { status: 404 });
  }

  await prisma.pagamento.update({
    where: { id: pagamento.id },
    data: { estado, idParceiro: idParceiro || pagamento.idParceiro },
  });

  // Quando o pagamento é confirmado, a marcação passa a confirmada.
  if (estado === "PAGO") {
    await prisma.marcacao.update({
      where: { id: pagamento.marcacaoId },
      data: { estado: "CONFIRMADA" },
    });
  }

  return NextResponse.json({ ok: true });
}
