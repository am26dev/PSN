import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import type { EstadoPagamento } from "@prisma/client";

/**
 * Adaptador de pagamentos Pay4all (produto «é+ / é-Kwanza»).
 *
 * Baseado na documentação comercial da Pay4all, S.A. (Grupo BAI, Licença BNA
 * nº 426). Suporta os três canais de cobrança do é+:
 *   1. Multicaixa Express (push para a app do cliente)
 *   2. Referência EMIS (paga em qualquer banco/ATM/Multicaixa)
 *   3. é-Kwanza (carteira digital / código QR)
 *
 * IMPORTANTE: os caminhos de endpoint e o formato exato de pedido/resposta têm
 * de ser confirmados com a *documentação técnica* da Pay4all (fornecida após a
 * adesão — ver `b2b@pay4all.ao`). Por isso estão centralizados em `ENDPOINTS` e
 * em `mapearResposta()`, fáceis de ajustar num único sítio.
 *
 * Enquanto `PAY4ALL_API_URL`/`PAY4ALL_API_KEY` não estiverem configurados, o
 * adaptador opera em **modo simulado**: devolve referências/QR de demonstração
 * para que todo o fluxo funcione de ponta a ponta em desenvolvimento.
 */

const config = {
  apiUrl: process.env.PAY4ALL_API_URL ?? "",
  apiKey: process.env.PAY4ALL_API_KEY ?? "",
  // Entidade EMIS atribuída ao comerciante (a documentação comercial indica 10111).
  entidade: process.env.PAY4ALL_ENTIDADE ?? "10111",
  webhookSecret: process.env.PAY4ALL_WEBHOOK_SECRET ?? "",
  // Validade por omissão de uma referência EMIS (em horas).
  validadeReferenciaHoras: Number(process.env.PAY4ALL_VALIDADE_HORAS ?? 72),
};

// Caminhos a confirmar com a documentação técnica da Pay4all.
const ENDPOINTS = {
  multicaixaExpress: "/v1/cobrancas/multicaixa-express",
  referenciaEmis: "/v1/cobrancas/referencia",
  qrEkwanza: "/v1/cobrancas/ekwanza-qr",
} as const;

export function estaConfigurado(): boolean {
  return Boolean(config.apiUrl && config.apiKey);
}

export interface ResultadoCobranca {
  configurado: boolean; // false = modo simulado
  idParceiro: string | null;
  estado: EstadoPagamento;
  entidade?: string;
  referenciaEmis?: string;
  qrCode?: string;
  telefone?: string;
  expiraEm?: Date;
}

interface DadosCobranca {
  valorCentimos: number;
  referenciaInterna: string; // o nosso id de pagamento (para reconciliação)
  telefone?: string;
  descricao?: string;
}

// ── Canais de cobrança ───────────────────────────────────────────────────────

export async function cobrarMulticaixaExpress(
  dados: DadosCobranca,
): Promise<ResultadoCobranca> {
  if (!dados.telefone) {
    throw new Error("Telemóvel obrigatório para cobrança Multicaixa Express.");
  }
  if (!estaConfigurado()) {
    return {
      configurado: false,
      idParceiro: `SIM-MCX-${dados.referenciaInterna}`,
      estado: "AGUARDA",
      telefone: dados.telefone,
    };
  }
  const resposta = await chamar(ENDPOINTS.multicaixaExpress, {
    telefone: dados.telefone,
    montante: kwanzas(dados.valorCentimos),
    referencia_comerciante: dados.referenciaInterna,
    descricao: dados.descricao,
  });
  return mapearResposta(resposta, { telefone: dados.telefone });
}

export async function gerarReferenciaEmis(
  dados: DadosCobranca,
): Promise<ResultadoCobranca> {
  const expiraEm = new Date(
    Date.now() + config.validadeReferenciaHoras * 3600 * 1000,
  );
  if (!estaConfigurado()) {
    return {
      configurado: false,
      idParceiro: `SIM-REF-${dados.referenciaInterna}`,
      estado: "AGUARDA",
      entidade: config.entidade,
      referenciaEmis: referenciaSimulada(),
      expiraEm,
    };
  }
  const resposta = await chamar(ENDPOINTS.referenciaEmis, {
    montante: kwanzas(dados.valorCentimos),
    referencia_comerciante: dados.referenciaInterna,
    validade_horas: config.validadeReferenciaHoras,
    descricao: dados.descricao,
  });
  return mapearResposta(resposta, { entidade: config.entidade, expiraEm });
}

export async function gerarQrEkwanza(
  dados: DadosCobranca,
): Promise<ResultadoCobranca> {
  if (!estaConfigurado()) {
    const payload = `ekwanza://pagar?ref=${dados.referenciaInterna}&valor=${kwanzas(
      dados.valorCentimos,
    )}`;
    return {
      configurado: false,
      idParceiro: `SIM-QR-${dados.referenciaInterna}`,
      estado: "AGUARDA",
      qrCode: payload,
    };
  }
  const resposta = await chamar(ENDPOINTS.qrEkwanza, {
    montante: kwanzas(dados.valorCentimos),
    referencia_comerciante: dados.referenciaInterna,
    descricao: dados.descricao,
  });
  return mapearResposta(resposta, {});
}

// ── Webhook (confirmação de pagamento em tempo real) ─────────────────────────

/**
 * Estados reportados pela Pay4all → estados internos.
 * (Processada → PAGO, Pendente → AGUARDA, Expirada → EXPIRADO.)
 */
export function mapearEstadoPay4all(estado: string): EstadoPagamento {
  switch (estado.toUpperCase()) {
    case "PROCESSADA":
    case "PAGO":
    case "PAID":
      return "PAGO";
    case "EXPIRADA":
    case "EXPIRADO":
      return "EXPIRADO";
    case "FALHADA":
    case "FALHADO":
    case "CANCELADA":
      return "FALHADO";
    default:
      return "AGUARDA";
  }
}

/** Verifica a assinatura HMAC-SHA256 do webhook (cabeçalho `x-pay4all-signature`). */
export function verificarAssinaturaWebhook(
  corpoCru: string,
  assinatura: string | null,
): boolean {
  if (!config.webhookSecret || !assinatura) return false;
  const esperado = createHmac("sha256", config.webhookSecret)
    .update(corpoCru)
    .digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(assinatura);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── Auxiliares ───────────────────────────────────────────────────────────────

function kwanzas(centimos: number): number {
  return Math.round(centimos) / 100;
}

function referenciaSimulada(): string {
  // 9 dígitos, formato típico de uma referência EMIS.
  return String(randomInt(100_000_000, 999_999_999));
}

async function chamar(
  caminho: string,
  corpo: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${config.apiUrl}${caminho}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(corpo),
    // Evita pendurar o pedido do utente se o parceiro estiver lento.
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Pay4all respondeu ${res.status} em ${caminho}.`);
  }
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Normaliza a resposta da Pay4all para `ResultadoCobranca`.
 * Os nomes dos campos são tolerantes (snake_case/camelCase) — confirmar e
 * simplificar quando a documentação técnica estiver disponível.
 */
function mapearResposta(
  r: Record<string, unknown>,
  extra: Partial<ResultadoCobranca>,
): ResultadoCobranca {
  const obj = (r.data as Record<string, unknown>) ?? r;
  const estadoBruto = String(obj.estado ?? obj.status ?? "PENDENTE");
  return {
    configurado: true,
    idParceiro: str(obj.id ?? obj.transaction_id ?? obj.idTransacao) ?? null,
    estado: mapearEstadoPay4all(estadoBruto),
    entidade: str(obj.entidade ?? obj.entity) ?? extra.entidade,
    referenciaEmis: str(obj.referencia ?? obj.reference ?? obj.referenciaEmis),
    qrCode: str(obj.qr_code ?? obj.qrCode ?? obj.qr),
    telefone: extra.telefone,
    expiraEm: obj.expira_em
      ? new Date(String(obj.expira_em))
      : extra.expiraEm,
  };
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export const CANAIS_PAY4ALL = [
  "MULTICAIXA_EXPRESS",
  "REFERENCIA_EMIS",
  "E_KWANZA",
] as const;
