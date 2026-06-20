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
    situacao?: string;
  };
  aviso?: string;
}

export async function carregarDadosPorBI(bi: string): Promise<PrefillResultado> {
  const provincia = provinciaDoBI(bi) ?? undefined;

  if (!estaConfigurado()) {
    return {
      origem: "LOCAL",
      disponivel: false,
      dados: { provincia },
      aviso:
        "A consulta automática de dados ainda não está ativa. Confirme os seus dados manualmente.",
    };
  }

  const r = await consultarBi(bi);
  if (!r.ok || !r.normalizado) {
    return {
      origem: "LOCAL",
      disponivel: false,
      dados: { provincia },
      aviso: r.erro ?? "Não foi possível obter os dados automaticamente.",
    };
  }

  return {
    origem: "ITAO",
    disponivel: true,
    dados: {
      nomeCompleto: r.normalizado.nome,
      nif: r.normalizado.nif,
      situacao: r.normalizado.situacao,
      provincia,
    },
  };
}
