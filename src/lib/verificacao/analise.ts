import "server-only";
import type { TipoDocumento } from "@prisma/client";
import { validarBI, validarPassaporte } from "@/lib/documento";

/**
 * Análise de uma verificação de identidade.
 *
 * Decisão de desenho: por omissão NÃO inventamos resultados de OCR/biometria
 * (a solução analisada usava `Math.random()`, o que dá uma falsa sensação de
 * segurança). Aqui o caminho honesto é:
 *   - validar o FORMATO do documento;
 *   - calcular uma pontuação de risco indicativa a partir dessa validação;
 *   - deixar a prova de vida PENDENTE e encaminhar para REVISÃO MANUAL.
 *
 * `VERIFICACAO_PROVIDER_URL` é o encaixe para ligar um fornecedor real de
 * OCR/biometria — ou o SIAC — que devolva resultados automáticos fiáveis.
 */

export interface ResultadoAnalise {
  ocrDados: { fonte: string; formatoDocumentoValido: boolean; observacao: string };
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
  const provider = process.env.VERIFICACAO_PROVIDER_URL;

  // Encaixe: fornecedor real de OCR/biometria (a implementar quando existir).
  if (provider) {
    // TODO: chamar o fornecedor e mapear a resposta para ResultadoAnalise.
  }

  const valido = formatoValido(dados.tipoDocumento, dados.numeroDocumento);

  // Pontuação indicativa (não é um veredito): formato válido reduz o risco.
  let risco = valido ? 25 : 70;
  if (!dados.temFrente) risco += 10;
  if (!dados.temSelfie) risco += 10;
  risco = Math.min(100, risco);

  return {
    ocrDados: {
      fonte: "manual",
      formatoDocumentoValido: valido,
      observacao:
        "OCR e biometria automáticos não configurados — aguarda revisão manual.",
    },
    resultadoBiometria: "PENDENTE",
    pontuacaoRisco: risco,
    estadoSugerido: "EM_ANALISE",
    automatica: false,
  };
}
