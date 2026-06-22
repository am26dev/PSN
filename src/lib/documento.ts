/**
 * Validação de documentos de identificação.
 *
 * BI de Angola: 14 caracteres no formato 9 dígitos + 2 letras + 3 dígitos
 *   (ex.: 003456789LA042). As 2 letras identificam a província de emissão.
 * Passaporte (estrangeiros): alfanumérico, 6 a 9 caracteres.
 *
 * Nota: validamos o FORMATO. A confirmação dos dados reais do cidadão é feita
 * pela consulta à fonte oficial (ver src/lib/identidade/itao.ts).
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

// Mapa dos códigos de província (2 letras) usados no BI e na fonte oficial (AGT).
const PROVINCIAS: Record<string, string> = {
  BO: "Bengo",
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

/** Converte um código de província (ex.: "LA") ou nome no nome canónico (ex.: "Luanda"). */
export function nomeProvincia(codigo: string | null | undefined): string | undefined {
  if (!codigo) return undefined;
  const up = codigo.trim().toUpperCase();
  // 1) Código de 2 letras (ex.: "LA").
  if (PROVINCIAS[up]) return PROVINCIAS[up];
  // 2) Nome completo, ignorando maiúsculas e acentos (ex.: "LUANDA" → "Luanda").
  const marcasAcento = new RegExp("[\\u0300-\\u036f]", "g");
  const semAcento = (s: string) =>
    s.normalize("NFD").replace(marcasAcento, "").toUpperCase();
  const alvo = semAcento(codigo);
  for (const nome of Object.values(PROVINCIAS)) {
    if (semAcento(nome) === alvo) return nome;
  }
  return codigo; // desconhecido — devolve como está
}

export function provinciaDoBI(valor: string): string | null {
  const v = normalizarDocumento(valor);
  if (!validarBI(v)) return null;
  return PROVINCIAS[v.substring(9, 11)] ?? null;
}
