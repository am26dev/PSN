"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/directorio", rotulo: "Encontrar unidades" },
  { href: "/directorio?tipo=HOSPITAL_PUBLICO", rotulo: "Públicas" },
  { href: "/directorio?tipo=CLINICA_PRIVADA", rotulo: "Privadas" },
  { href: "/directorio?tipo=LABORATORIO", rotulo: "Laboratórios" },
  { href: "/directorio?tipo=FARMACIA", rotulo: "Farmácias" },
  { href: "/sobre", rotulo: "Sobre a PSN" },
  { href: "/contactos", rotulo: "Contactos" },
];

export function Header({
  autenticado,
  nome,
  admin,
}: {
  autenticado: boolean;
  nome: string | null;
  admin?: boolean;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-base-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Início" onClick={() => setAberto(false)}>
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium text-angola-black lg:flex">
          {LINKS.map((l) => (
            <Link key={l.rotulo} href={l.href} className="whitespace-nowrap hover:text-angola-red">
              {l.rotulo}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {autenticado ? (
            <>
              {admin && <Link href="/admin" className="btn-ghost py-2">Admin</Link>}
              <Link href="/conta" className="btn-ghost py-2">{nome?.split(" ")[0] ?? "Conta"}</Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn-ghost py-2">Sair</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn-ghost py-2">Entrar</Link>
              <Link href="/registo" className="btn-primary py-2">Criar conta</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setAberto((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-base-line lg:hidden"
          aria-label="Menu"
          aria-expanded={aberto}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {aberto ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {aberto && (
        <div className="border-t border-base-line bg-white lg:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2">
            {LINKS.map((l) => (
              <Link
                key={l.rotulo}
                href={l.href}
                onClick={() => setAberto(false)}
                className="border-b border-base-line/60 py-3 text-sm font-medium hover:text-angola-red"
              >
                {l.rotulo}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 py-3">
              {autenticado ? (
                <>
                  {admin && <Link href="/admin" onClick={() => setAberto(false)} className="btn-ghost py-2">Admin</Link>}
                  <Link href="/conta" onClick={() => setAberto(false)} className="btn-ghost py-2">A minha conta</Link>
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="btn-ghost py-2">Sair</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/entrar" onClick={() => setAberto(false)} className="btn-ghost py-2">Entrar</Link>
                  <Link href="/registo" onClick={() => setAberto(false)} className="btn-primary py-2">Criar conta</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
