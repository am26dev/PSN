import type { TipoUnidade } from "@prisma/client";

/**
 * Tabela de preços de referência da consulta, em cêntimos de Kwanza (KZ).
 * Valores indicativos do MVP — substituíveis por tabela por unidade/especialidade.
 */
const PRECO_BASE_CENTIMOS: Record<TipoUnidade, number> = {
  HOSPITAL_PUBLICO: 200_000, // 2 000,00 Kz
  UNIDADE_HOSPITALAR: 2_500_000,
  CLINICA_PRIVADA: 2_500_000, // 25 000,00 Kz
  CENTRO_MEDICO: 2_500_000,
  CLINICA_DENTARIA: 2_500_000,
  LABORATORIO: 2_500_000,
  FISIOTERAPIA: 2_500_000,
  OPTICA: 2_500_000,
  PRESTADOR_SAUDE: 2_500_000,
  FARMACIA: 0,
};

export function precoConsulta(tipo: TipoUnidade): number {
  return PRECO_BASE_CENTIMOS[tipo];
}
