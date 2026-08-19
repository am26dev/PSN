import "server-only";
import { NextResponse } from "next/server";
import { utenteAtual } from "@/lib/auth";
import { verificarRateLimit, chaveRateLimit } from "@/lib/rate-limit";
import type { Papel, Utente } from "@prisma/client";

/**
 * Camada de apoio aos route handlers (controladores HTTP finos).
 *
 * Regras de separação de responsabilidades:
 *  - Os route handlers só tratam de HTTP: ler o corpo, validar com zod,
 *    autorizar a sessão/papel, delegar ao serviço e formatar a resposta.
 *  - A lógica de negócio vive em `src/lib/services/*`.
 *  - Erros de negócio são `ServiceError(status, mensagem)` e convertidos
 *    numa resposta JSON pela `respostaErro`.
 */

export class ServiceError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

/** Converte qualquer erro numa resposta JSON coerente (nunca vaza stacks). */
export function respostaErro(e: unknown): NextResponse {
  if (e instanceof ServiceError) {
    return NextResponse.json({ erro: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
}

/** Lê e faz parse do JSON do corpo, ou lança ServiceError(400). */
export async function lerJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ServiceError(400, "Pedido inválido.");
  }
}

/** Lê FormData do corpo, ou lança ServiceError(400). */
export async function lerFormData(req: Request): Promise<FormData> {
  try {
    return await req.formData();
  } catch {
    throw new ServiceError(400, "Pedido inválido.");
  }
}

/** Devolve o utente autenticado ou lança ServiceError(401). */
export async function exigirSessao(): Promise<Utente> {
  const u = await utenteAtual();
  if (!u) throw new ServiceError(401, "Sessão necessária.");
  return u;
}

/** Garante que o utente tem um dos papéis; senão lança ServiceError(403). */
export function exigirPapel(utente: Utente, papeis: Papel[]): void {
  if (!papeis.includes(utente.papel)) {
    throw new ServiceError(403, "Acesso não autorizado.");
  }
}

/** Aplica rate limit por IP + rota. Lança ServiceError(429) se excedido. */
export function exigirRateLimit(
  req: Request,
  rota: string,
  limite: number = 30,
  janelaMs: number = 60_000,
): void {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon";
  const chave = chaveRateLimit(ip, rota);
  const { permitido, resetMs } = verificarRateLimit(chave, limite, janelaMs);
  if (!permitido) {
    throw new ServiceError(
      429,
      `Demasiados pedidos. Tente novamente em ${Math.ceil(resetMs / 1000)}s.`,
    );
  }
}
