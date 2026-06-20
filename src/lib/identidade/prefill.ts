import "server-only";
import { consultarBi, estaConfigurado } from "./itao";
import { provinciaDoBI } from "@/lib/documento";

/**
 * Pré-preenchimento dos dados do cidadão a partir do BI.
 * Fonte: API «Consulta NIF Angola» (dev.it.ao) — o NIF de uma pessoa singular
 * é o seu número de BI. Quando a API não está configurada/disponível, devolve
 * apenas o que se infere localmente (província de emissão do BI).
 */

export interface PrefillResultado {
  origem: "ITAO" | "LOCAL";
  disponivel: boolean;
  dados: {
    nomeCompleto?: string;
    nif?: string;
    provincia?: string;
    municipio?: string;
    estado?: string; // situação na fonte oficial (ex.: "Activo")
  };
  aviso?: string;
}

export async function carregarDadosPorBI(bi: string): Promise<PrefillResultado> {
  const provinciaLocal = provinciaDoBI(bi) ?? undefined;

  if (!estaConfigurado()) {
    return {
      origem: "LOCAL",
      disponivel: false,
      dados: { provincia: provinciaLocal },
      aviso:
        "A consulta automática de dados ainda não está ativa. Confirme os seus dados manualmente.",
    };
  }

  const r = await consultarBi(bi);
  if (!r.ok || !r.normalizado) {
    return {
      origem: "LOCAL",
      disponivel: false,
      dados: { provincia: provinciaLocal },
      aviso: r.erro ?? "Não foi possível obter os dados automaticamente.",
    };
  }

  const d = r.normalizado;
  return {
    origem: "ITAO",
    disponivel: true,
    dados: {
      nomeCompleto: d.nome,
      nif: d.nif,
      // Prefere a província da fonte oficial; recorre à inferência do BI.
      provincia: d.provincia ?? provinciaLocal,
      municipio: d.municipio,
      estado: d.estado,
    },
  };
}
