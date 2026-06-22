import "server-only";
import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Papel } from "@prisma/client";

const COOKIE_NOME = "psn_sessao";
const MAX_AGE = Number(process.env.SESSION_MAX_AGE ?? 28800); // 8h

function segredo(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET em falta ou demasiado curto (mínimo 32 caracteres).",
    );
  }
  return new TextEncoder().encode(s);
}

// ── Passwords (Argon2id) ─────────────────────────────────────────────────────
export async function criarHashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verificarPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// ── Sessões ──────────────────────────────────────────────────────────────────
interface PayloadSessao {
  sub: string; // utenteId
  papel: Papel;
  jti: string; // identificador do token (ligado ao registo em BD)
}

function hashToken(jti: string): string {
  return createHash("sha256").update(jti).digest("hex");
}

export async function criarSessao(
  utenteId: string,
  papel: Papel,
  meta?: { userAgent?: string; ip?: string },
): Promise<void> {
  const jti = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + MAX_AGE * 1000);

  await prisma.sessao.create({
    data: {
      utenteId,
      tokenHash: hashToken(jti),
      userAgent: meta?.userAgent,
      ip: meta?.ip,
      expiraEm,
    },
  });

  const token = await new SignJWT({ papel, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(utenteId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(segredo());

  const store = await cookies();
  store.set(COOKIE_NOME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export interface UtenteSessao {
  id: string;
  papel: Papel;
}

export async function obterSessao(): Promise<UtenteSessao | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NOME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, segredo());
    const p = payload as unknown as PayloadSessao;
    if (!p.sub || !p.jti) return null;

    // Confirma que a sessão continua válida em BD (permite revogação).
    const sessao = await prisma.sessao.findUnique({
      where: { tokenHash: hashToken(p.jti) },
    });
    if (!sessao || sessao.expiraEm < new Date()) return null;

    return { id: p.sub, papel: p.papel };
  } catch {
    return null;
  }
}

export async function terminarSessao(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NOME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, segredo());
      const p = payload as unknown as PayloadSessao;
      if (p.jti) {
        await prisma.sessao.deleteMany({ where: { tokenHash: hashToken(p.jti) } });
      }
    } catch {
      /* token inválido — basta apagar o cookie */
    }
  }
  store.delete(COOKIE_NOME);
}

export async function utenteAtual() {
  const sessao = await obterSessao();
  if (!sessao) return null;
  return prisma.utente.findUnique({
    where: { id: sessao.id },
    include: { seguradora: true, fichaSaude: true },
  });
}
