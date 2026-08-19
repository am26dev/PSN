import { NextResponse } from "next/server";
import {
  verificarAssinaturaWebhook,
  mapearEstadoPay4all,
} from "@/lib/pagamentos/pay4all";
import { respostaErro } from "@/lib/services/http";
import { processarEventoWebhook } from "@/lib/services/pagamento.service";

/**
 * Webhook de confirmação de pagamento da Pay4all.
 * Segurança: o corpo é validado por assinatura HMAC-SHA256
 * (`x-pay4all-signature`) com o segredo partilhado `PAY4ALL_WEBHOOK_SECRET`.
 */
export async function POST(req: Request) {
  try {
    const corpoCru = await req.text();
    const assinatura = req.headers.get("x-pay4all-signature");

    if (!verificarAssinaturaWebhook(corpoCru, assinatura)) {
      return NextResponse.json({ erro: "Assinatura inválida." }, { status: 401 });
    }

    const evento = JSON.parse(corpoCru);
    const dados = (evento.data as Record<string, unknown>) ?? evento;
    const referenciaInterna = String(
      dados.referencia_comerciante ?? dados.referenciaInterna ?? "",
    );
    const idParceiro = String(dados.id ?? dados.transaction_id ?? "");
    const estado = mapearEstadoPay4all(String(dados.estado ?? dados.status ?? ""));

    await processarEventoWebhook(referenciaInterna, idParceiro, estado);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return respostaErro(e);
  }
}
