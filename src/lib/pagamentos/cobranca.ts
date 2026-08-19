import "server-only";
import type { MetodoPagamento, Prisma } from "@prisma/client";
import {
  cobrarMulticaixaExpress,
  gerarReferenciaEmis,
  gerarQrEkwanza,
  type ResultadoCobranca,
} from "./pay4all";

interface DadosCobranca {
  valorCentimos: number;
  referenciaInterna: string;
  telefone?: string;
  descricao?: string;
}

/**
 * Inicia a cobrança no canal Pay4all correspondente ao método escolhido.
 * Devolve `null` para métodos que não passam pela Pay4all (Seguro / RUPE).
 */
export async function iniciarCobranca(
  metodo: MetodoPagamento,
  dados: DadosCobranca,
): Promise<ResultadoCobranca | null> {
  switch (metodo) {
    case "MULTICAIXA_EXPRESS":
      return cobrarMulticaixaExpress(dados);
    case "REFERENCIA_EMIS":
      return gerarReferenciaEmis(dados);
    case "E_KWANZA":
      return gerarQrEkwanza(dados);
    default:
      return null;
  }
}

/** Converte o resultado da Pay4all nos campos a gravar no Pagamento. */
export function dadosPagamentoDaCobranca(
  r: ResultadoCobranca,
): Prisma.PagamentoUpdateInput {
  return {
    estado: r.estado,
    idParceiro: r.idParceiro,
    entidade: r.entidade ?? null,
    referenciaEmis: r.referenciaEmis ?? null,
    qrCode: r.qrCode ?? null,
    telefone: r.telefone ?? null,
    expiraEm: r.expiraEm ?? null,
  };
}
