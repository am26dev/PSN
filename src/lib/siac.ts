/**
 * Encaixe para o SIAC (Serviço Integrado de Atendimento ao Cidadão).
 *
 * Objetivo futuro: ao introduzir o número do BI, carregar automaticamente os
 * dados do cidadão (nome, data de nascimento, sexo, naturalidade).
 *
 * Estado atual: NÃO existe API pública do SIAC. Esta função fica preparada para
 * ligar quando houver protocolo institucional. Até lá devolve `null` e o registo
 * é feito com preenchimento assistido pelo próprio utente.
 */

export interface DadosCidadao {
  nomeCompleto: string;
  dataNascimento: string; // ISO
  sexo: "MASCULINO" | "FEMININO" | "OUTRO";
  provincia?: string;
}

export async function carregarDadosPorBI(
  _numeroBI: string,
): Promise<DadosCidadao | null> {
  const apiUrl = process.env.SIAC_API_URL;
  const apiKey = process.env.SIAC_API_KEY;

  // Sem credenciais configuradas → integração ainda não disponível.
  if (!apiUrl || !apiKey) return null;

  // TODO: implementar a chamada real quando o protocolo com o SIAC estiver ativo.
  return null;
}
