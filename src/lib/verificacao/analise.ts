import "server-only";
import type { TipoDocumento } from "@prisma/client";
import { validarBI, validarPassaporte } from "@/lib/documento";
import { consultarBi, estaConfigurado } from "@/lib/identidade/itao";

/**
 * Análise de uma verificação de identidade.
 *
 * Decisão de desenho: por omissão NÃO inventamos resultados de OCR/biometria
 * (a solução analisada usava `Math.random()`, o que dá uma falsa sensação de
 * segurança). O caminho honesto é:
 *   - validar o FORMATO do documento;
 *   - para o BI, consultar a fonte oficial (dev.it.ao, NIF = BI) e juntar os
 *     dados reais à análise, baixando o risco quando há correspondência;
 *   - deixar a prova de vida PENDENTE e encaminhar para REVISÃO MANUAL.
 *
 * O Passaporte não tem consulta automática — fica sempre para revisão manual.
 */

export interface ResultadoAnalise {
  ocrDados: {
    fonte: string;
    formatoDocumentoValido: boolean;
    observacao: string;
    consultaOficial?: {
      encontrado: boolean;
      nome?: string;
      nif?: string;
      estado?: string;
      municipio?: string;
    };
  };
  resultadoBiometria: "PENDENTE" | "APROVADO" | "REJEITADO";
  pontuacaoRisco: number; // 0 (baixo) … 100 (alto)
  estadoSugerido: "EM_ANALISE" | "APROVADO" | "REJEITADO";
  automatica: boolean;
}

interface DadosVerificacao {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  temFrente: boolean;
  temVerso: boolean;
  temSelfie: boolean;
}

function formatoValido(tipo: TipoDocumento, numero: string): boolean {
  if (tipo === "BI") return validarBI(numero);
  return validarPassaporte(numero); // Passaporte e Autorização de Residência
}

export async function analisarVerificacao(
  dados: DadosVerificacao,
): Promise<ResultadoAnalise> {
  const valido = formatoValido(dados.tipoDocumento, dados.numeroDocumento);

  // Pontuação indicativa (não é um veredito): formato válido reduz o risco.
  let risco = valido ? 25 : 70;
  if (!dados.temFrente) risco += 10;
  if (!dados.temSelfie) risco += 10;

  // Consulta oficial (apenas BI) — junta os dados reais para apoiar a revisão.
  let consultaOficial: ResultadoAnalise["ocrDados"]["consultaOficial"];
  if (dados.tipoDocumento === "BI" && valido && estaConfigurado()) {
    const r = await consultarBi(dados.numeroDocumento);
    if (r.ok && r.normalizado) {
      consultaOficial = {
        encontrado: true,
        nome: r.normalizado.nome,
        nif: r.normalizado.nif,
        estado: r.normalizado.estado,
        municipio: r.normalizado.municipio,
      };
      risco = Math.max(0, risco - 15); // documento confirmado na fonte oficial
    } else {
      consultaOficial = { encontrado: false };
    }
  }

  risco = Math.min(100, Math.max(0, risco));

  return {
    ocrDados: {
      fonte: consultaOficial ? "dev.it.ao + revisão manual" : "manual",
      formatoDocumentoValido: valido,
      observacao:
        "Decisão final por revisão manual (biometria/prova de vida automáticas não configuradas).",
      consultaOficial,
    },
    resultadoBiometria: "PENDENTE",
    pontuacaoRisco: risco,
    estadoSugerido: "EM_ANALISE",
    automatica: false,
  };
}

