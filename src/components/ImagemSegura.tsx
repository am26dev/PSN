"use client";

import { useEffect, useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallback: string;
};

/** Imagem resiliente: troca URLs indisponíveis por um recurso local otimizado. */
export function ImagemSegura({ src, fallback, onError, ...props }: Props) {
  const [atual, setAtual] = useState(src || fallback);

  useEffect(() => setAtual(src || fallback), [src, fallback]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={atual}
      onError={(evento) => {
        if (atual !== fallback) setAtual(fallback);
        onError?.(evento);
      }}
      decoding={props.decoding ?? "async"}
    />
  );
}
