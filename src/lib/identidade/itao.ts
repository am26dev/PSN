import "server-only";

/**
 * Cliente da API «Consulta NIF Angola» (https://dev.it.ao).
 *
 * Funciona como proxy da fonte oficial (AGT). Consulta dados de contribuintes
 * e empresas pelo NIF. Em Angola, o NIF de uma pessoa singular é o próprio
 * número do Bilhete de Identidade — por isso a consulta de BI usa o mesmo
 * endpoint (ver `consultarBi`).
 *
 * Contrato (documentação oficial):
 *   Base URL: https://dev.it.ao
 *   Auth:     Authorization: Bearer <API_KEY>   (+ Accept: application/json)
 *   GET /api/nif-lookup/{nif}   → consulta oficial
 *   GET /consultar/{nif}        → consulta legacy (fallback)
 *   Erros:    401 token em falta/inválido · 403 token desativado
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
  tipo?: string; // singular / coletivo
  situacao?: string; // situação fiscal / estado
  morada?: string;
  regime?: string;
}

export interface ResultadoConsulta {
  ok: boolean;
  estado: number; // código HTTP (0 = sem ligação)
  erro?: string;
  dados?: Record<string, unknown>; // resposta crua da API
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
        ultimoErro = "NIF não encontrado.";
        continue; // tenta o caminho seguinte
      }
      if (!res.ok) {
        ultimoErro = `A API respondeu ${res.status}.`;
        continue;
      }

      const dados = (await res.json()) as Record<string, unknown>;
      return {
        ok: true,
        estado: res.status,
        dados,
        normalizado: normalizar(dados),
      };
    } catch {
      ultimoErro = "Falha de ligação à API de consulta.";
    }
  }

  return { ok: false, estado: 0, erro: ultimoErro };
}

/** Consulta de BI (= NIF para pessoas singulares em Angola). */
export const consultarBi = consultarNif;

/**
 * Normaliza os campos da resposta de forma tolerante.
 * Os nomes exatos dos campos devem ser confirmados na secção «Campos da
 * Resposta» da documentação / na primeira resposta real — estão centralizados
 * aqui para serem ajustados num só sítio.
 */
function normalizar(r: Record<string, unknown>): DadosContribuinte {
  const obj = (r.data as Record<string, unknown>) ?? r;
  const s = (...chaves: string[]): string | undefined => {
    for (const c of chaves) {
      const v = obj[c];
      if (typeof v === "string" && v.trim()) return v.trim();
      if (typeof v === "number") return String(v);
    }
    return undefined;
  };
  return {
    nif: s("nif", "numero", "taxId", "contribuinte"),
    nome: s("nome", "name", "nome_completo", "designacao", "designation"),
    tipo: s("tipo", "type", "tipo_contribuinte"),
    situacao: s("situacao", "estado", "status", "situacao_fiscal"),
    morada: s("morada", "endereco", "address"),
    regime: s("regime", "regime_fiscal"),
  };
}
