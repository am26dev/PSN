/**
 * Validação de documentos de identificação.
 *
 * BI de Angola: 14 caracteres no formato 9 dígitos + 2 letras + 3 dígitos
 *   (ex.: 003456789LA042). As 2 letras identificam a província de emissão.
 * Passaporte (estrangeiros): alfanumérico, 6 a 9 caracteres.
 *
 * Nota: validamos o FORMATO. A confirmação dos dados reais do cidadão fica
 * dependente da integração com o SIAC (ver src/lib/siac.ts).
 */

const BI_REGEX = /^[0-9]{9}[A-Z]{2}[0-9]{3}$/;
const PASSAPORTE_REGEX = /^[A-Z0-9]{6,9}$/;

export function normalizarDocumento(valor: string): string {
  return valor.trim().toUpperCase().replace(/\s+/g, "");
}

export function validarBI(valor: string): boolean {
  return BI_REGEX.test(normalizarDocumento(valor));
}

export function validarPassaporte(valor: string): boolean {
  return PASSAPORTE_REGEX.test(normalizarDocumento(valor));
}

// Mapa das siglas de província nos BI angolanos (2 letras).
const PROVINCIAS_BI: Record<string, string> = {
  LA: "Luanda",
  BG: "Benguela",
  HU: "Huambo",
  HL: "Huíla",
  BI: "Bié",
  CB: "Cabinda",
  CC: "Cuando Cubango",
  CN: "Cunene",
  CS: "Cuanza Sul",
  KN: "Cuanza Norte",
  LN: "Lunda Norte",
  LS: "Lunda Sul",
  MA: "Malanje",
  MO: "Moxico",
  NA: "Namibe",
  UI: "Uíge",
  ZA: "Zaire",
};

export function provinciaDoBI(valor: string): string | null {
  const v = normalizarDocumento(valor);
  if (!validarBI(v)) return null;
  const sigla = v.substring(9, 11);
  return PROVINCIAS_BI[sigla] ?? null;
}
