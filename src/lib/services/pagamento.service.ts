import "server-only";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "./http";
import type { EstadoPagamento } from "@prisma/client";

/**
 * Processa a confirmação de pagamento recebida via webhook da Pay4all.
 * Localiza o pagamento pela nossa referência interna ou pelo id do parceiro,
 * atualiza o estado e, se confirmado, marca a respetiva marcação como CONFIRMADA.
 */
export async function processarEventoWebhook(
  referenciaInterna: string,
  idParceiro: string,
  estado: EstadoPagamento,
): Promise<void> {
  const pagamento = await prisma.pagamento.findFirst({
    where: {
      OR: [
        referenciaInterna ? { id: referenciaInterna } : undefined,
        idParceiro ? { idParceiro } : undefined,
      ].filter(Boolean) as object[],
    },
  });

  if (!pagamento) {
    throw new ServiceError(404, "Pagamento não encontrado.");
  }

  await prisma.pagamento.update({
    where: { id: pagamento.id },
    data: { estado, idParceiro: idParceiro || pagamento.idParceiro },
  });

  if (estado === "PAGO") {
    await prisma.marcacao.update({
      where: { id: pagamento.marcacaoId },
      data: { estado: "CONFIRMADA" },
    });
  }
}

/** Receita total de pagamentos confirmados (painel admin). */
export async function receitaConfirmada() {
  const r = await prisma.pagamento.aggregate({
    where: { estado: "PAGO" },
    _sum: { valorCentimos: true },
  });
  return r._sum.valorCentimos ?? 0;
}
