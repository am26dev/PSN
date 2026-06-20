import type { TipoUnidade } from "@prisma/client";

/**
 * Tabela de preços de referência da consulta, em cêntimos de Kwanza (KZ).
 * Valores indicativos do MVP — substituíveis por tabela por unidade/especialidade.
 */
const PRECO_BASE_CENTIMOS: Record<TipoUnidade, number> = {
  HOSPITAL_PUBLICO: 200_000, // 2 000,00 Kz
  CLINICA_PRIVADA: 2_500_000, // 25 000,00 Kz
  FARMACIA: 0,
};

export function precoConsulta(tipo: TipoUnidade): number {
  return PRECO_BASE_CENTIMOS[tipo];
}
