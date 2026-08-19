"use client";

import { useState } from "react";

/**
 * Logótipo de uma seguradora, com reserva elegante: se a imagem não existir
 * (logótipo não disponível), mostra um chip com o nome.
 */
export function LogoSeguradora({
  nome,
  logoUrl,
  compacto = false,
}: {
  nome: string;
  logoUrl?: string | null;
  compacto?: boolean;
}) {
  const [falhou, setFalhou] = useState(false);

  if (logoUrl && !falhou) {
    return (
      <span
        title={nome}
        className={`inline-flex items-center rounded-xl border border-base-line bg-white shadow-sm ${
          compacto ? "h-8 px-2" : "h-10 gap-2 px-3"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={nome}
          className={`${compacto ? "h-5 max-w-[62px]" : "h-6 max-w-[90px]"} w-auto object-contain`}
          loading="lazy"
          onError={() => setFalhou(true)}
        />
        {!compacto && <span className="text-xs font-medium text-gray-700">{nome}</span>}
      </span>
    );
  }

  return (
    <span
      title={nome}
      className={`badge bg-angola-gold/20 text-angola-gold-dark ${compacto ? "max-w-[90px] truncate" : ""}`}
    >
      {nome}
    </span>
  );
}
