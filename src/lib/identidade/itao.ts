import "server-only";
import { nomeProvincia } from "@/lib/documento";

/**
 * Cliente da API «Consulta NIF Angola» (https://dev.it.ao).
 *
 * Proxy da fonte oficial (AGT). Consulta dados de contribuintes e empresas pelo
 * NIF. Em Angola, o NIF de uma pessoa singular é o número do Bilhete de
 * Identidade — por isso a consulta de BI usa o mesmo endpoint (ver `consultarBi`).
 * O exemplo `006887386BE049` da documentação confirma que o BI é aceite.
 *
 * Contrato (documentação oficial):
 *   Base URL: https://dev.it.ao
 *   Auth:     Authorization: Bearer <API_KEY>   (+ Accept: application/json)
 *   GET /api/nif-lookup/{nif}   → consulta oficial
 *   GET /consultar/{nif}        → consulta legacy (fallback)
 *   Resposta: { "success": true, "data": { nif, nome, telefone, morada,
 *               municipio, provincia (código, ex. "LA"), bairro, estado,
 *               tipo ("SINGULAR"|"COLLECTIVE"), data_constituicao, original } }
 *   404:      { "success": false, "message": "NIF não encontrado" }
 *   Erros:    401 token em falta/inválido · 403 token desativado · 500 serviço
 *   Limite:   máx. 10 pedidos/min por NIF
 */

const config = {
  baseUrl: (process.env.ITAO_API_URL ?? "https://dev.it.ao").replace(/\/$/, ""),
  apiKey: process.env.ITAO_API_KEY ?? "",
};

export function estaConfigurado(): boolean {
  return Boolean(config.apiKey);
}

export interface DadosContribuinte {
  nif?: string;
  nome?: string;
  telefone?: string;
  morada?: string;
  municipio?: string;
  provinciaCodigo?: string; // ex.: "LA"
  provincia?: string; // ex.: "Luanda"
  bairro?: string;
  estado?: string; // ex.: "Activo"
  tipo?: string; // "SINGULAR" | "COLLECTIVE"
  ehEmpresa?: boolean;
  dataConstituicao?: string; // YYYY-MM-DD
  original?: unknown; // objeto completo da fonte oficial
}

export interface ResultadoConsulta {
  ok: boolean;
  estado: number; // código HTTP (0 = sem ligação)
  erro?: string;
  dados?: Record<string, unknown>; // envelope cru { success, data }
  normalizado?: DadosContribuinte;
}

const CAMINHOS = (nif: string) => [
  `/api/nif-lookup/${encodeURIComponent(nif)}`, // oficial
  `/consultar/${encodeURIComponent(nif)}`, // legacy (fallback)
];

export async function consultarNif(numero: string): Promise<ResultadoConsulta> {
  if (!estaConfigurado()) {
    return { ok: false, estado: 0, erro: "ITAO_API_KEY não configurada." };
  }
  const nif = numero.trim().toUpperCase();

  let naoEncontrado = false;
  let ultimoErro = "Não foi possível contactar o serviço de consulta.";

  for (const caminho of CAMINHOS(nif)) {
    try {
      const res = await fetch(`${config.baseUrl}${caminho}`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (res.status === 401)
        return { ok: false, estado: 401, erro: "Token em falta ou inválido." };
      if (res.status === 403)
        return {
          ok: false,
          estado: 403,
          erro: "Token desativado — contacte o suporte da API.",
        };

      if (res.status === 404) {
        naoEncontrado = true;
        continue; // tenta o caminho seguinte
      }
      if (!res.ok) {
        ultimoErro = `A API respondeu ${res.status}.`;
        continue;
      }

      const envelope = (await res.json()) as Record<string, unknown>;

      // A API responde 200 mas com success=false quando o NIF não existe.
      if (envelope.success === false || !envelope.data) {
        naoEncontrado = true;
        continue;
      }

      return {
        ok: true,
        estado: res.status,
        dados: envelope,
        normalizado: normalizar(envelope.data as Record<string, unknown>),
      };
    } catch {
      ultimoErro = "Falha de ligação à API de consulta.";
    }
  }

  if (naoEncontrado) {
    return { ok: false, estado: 404, erro: "NIF não encontrado." };
  }
  return { ok: false, estado: 0, erro: ultimoErro };
}

/** Consulta de BI (= NIF para pessoas singulares em Angola). */
export const consultarBi = consultarNif;

function str(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number") return String(v);
  return undefined;
}

function normalizar(data: Record<string, unknown>): DadosContribuinte {
  const provinciaCodigo = str(data.provincia);
  const tipo = str(data.tipo);
  return {
    nif: str(data.nif),
    nome: str(data.nome),
    telefone: str(data.telefone),
    morada: str(data.morada),
    municipio: str(data.municipio),
    provinciaCodigo,
    provincia: nomeProvincia(provinciaCodigo),
    bairro: str(data.bairro),
    estado: str(data.estado),
    tipo,
    ehEmpresa: tipo?.toUpperCase() === "COLLECTIVE",
    dataConstituicao: str(data.data_constituicao),
    original: data.original,
  };
}
