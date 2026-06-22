/**
 * Formatação monetária do portal — Kwanza angolano (KZ).
 * Valores armazenados em cêntimos (inteiros) para evitar erros de vírgula flutuante.
 */

export function formatarKz(centimos: number): string {
  const valor = centimos / 100;
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  })
    .format(valor)
    // Garante o símbolo "Kz" mesmo em ambientes sem locale pt-AO instalado.
    .replace(/AOA|Kz/i, "Kz");
}

export function kwanzasParaCentimos(kwanzas: number): number {
  return Math.round(kwanzas * 100);
}
