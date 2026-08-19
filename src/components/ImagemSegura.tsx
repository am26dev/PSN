"use client";

import { useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallback: string;
};

/** Imagem resiliente: troca URLs indisponíveis por um recurso local otimizado. */
export function ImagemSegura({ src, fallback, onError, ...props }: Props) {
  const [erro, setErro] = useState(false);
  const atual = erro || !src ? fallback : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={atual}
      alt={props.alt ?? ""}
      onError={(evento) => {
        if (!erro) setErro(true);
        onError?.(evento);
      }}
      decoding={props.decoding ?? "async"}
    />
  );
}
