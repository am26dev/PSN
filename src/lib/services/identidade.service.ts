import "server-only";
import { carregarDadosPorBI } from "@/lib/identidade/prefill";
import { consultarNif as consultarNifItAo } from "@/lib/identidade/itao";
import { validarBI, normalizarDocumento } from "@/lib/documento";
import { ServiceError } from "./http";

/** Pré-preenchimento do registo a partir do BI (consulta dev.it.ao). */
export async function consultarPorBI(numero: string): Promise<unknown> {
  const bi = normalizarDocumento(numero);
  if (!validarBI(bi)) {
    throw new ServiceError(422, "Formato de BI inválido. Exemplo: 003456789LA042.");
  }
  return carregarDadosPorBI(bi);
}

/** Consulta de contribuinte/empresa por NIF (dev.it.ao). */
export async function consultarNif(
  nif: string,
): Promise<{ dados: unknown; bruto: unknown }> {
  const numero = (nif ?? "").trim();
  if (numero.length < 5) throw new ServiceError(422, "NIF inválido.");

  const r = await consultarNifItAo(numero);
  if (!r.ok) {
    const estado = r.estado >= 400 ? r.estado : 502;
    throw new ServiceError(estado, r.erro ?? "Erro ao consultar o NIF.");
  }
  return { dados: r.normalizado, bruto: r.dados };
}
