"use client";

import { useState } from "react";

/**
 * Logótipo de uma seguradora, com reserva elegante: se a imagem não existir
 * (logótipo não disponível), mostra um chip com o nome.
 */
export function LogoSeguradora({
  nome,
  logoUrl,
}: {
  nome: string;
  logoUrl?: string | null;
}) {
  const [falhou, setFalhou] = useState(false);

  if (logoUrl && !falhou) {
    return (
      <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-base-line bg-white px-3 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={nome}
          className="h-6 w-auto max-w-[90px] object-contain"
          loading="lazy"
          onError={() => setFalhou(true)}
        />
        <span className="text-xs font-medium text-gray-700">{nome}</span>
      </span>
    );
  }

  return (
    <span className="badge bg-angola-gold/20 text-angola-gold-dark">{nome}</span>
  );
}
