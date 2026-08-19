/**
 * Rate limiter em memória (sliding window).
 * Adequado para deploy em instância única (Render, VPS).
 * Para multi-instância, migrar para Upstash/Redis.
 */

interface Entrada {
  timestamps: number[];
}

const janelas = new Map<string, Entrada>();

/** Limpa entradas expiradas periodicamente (a cada 60s). */
setInterval(() => {
  const agora = Date.now();
  for (const [chave, entrada] of janelas) {
    entrada.timestamps = entrada.timestamps.filter((t) => agora - t < 60_000);
    if (entrada.timestamps.length === 0) janelas.delete(chave);
  }
}, 60_000);

/**
 * Verifica se o pedido é permitido.
 * @returns { permitido, restantes, resetMs }
 */
export function verificarRateLimit(
  chave: string,
  limite: number,
  janelaMs: number = 60_000,
): { permitido: boolean; restantes: number; resetMs: number } {
  const agora = Date.now();
  let entrada = janelas.get(chave);
  if (!entrada) {
    entrada = { timestamps: [] };
    janelas.set(chave, entrada);
  }

  // Remove timestamps fora da janela
  entrada.timestamps = entrada.timestamps.filter((t) => agora - t < janelaMs);

  if (entrada.timestamps.length >= limite) {
    const maisAntigo = entrada.timestamps[0];
    const resetMs = maisAntigo + janelaMs - agora;
    return { permitido: false, restantes: 0, resetMs };
  }

  entrada.timestamps.push(agora);
  return { permitido: true, restantes: limite - entrada.timestamps.length, resetMs: janelaMs };
}

/** Gera chave de rate limit a partir do IP + rota. */
export function chaveRateLimit(ip: string | undefined, rota: string): string {
  return `${ip ?? "anon"}:${rota}`;
}
