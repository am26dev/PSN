"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SlideHero } from "@/lib/imagens";
import { ImagemSegura } from "@/components/ImagemSegura";

export function Hero({ slides }: { slides: SlideHero[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="full-bleed relative -mt-8 overflow-hidden bg-angola-black shadow-2xl">
      <div className="relative h-[calc(100svh-4rem)] min-h-[580px] max-h-[860px] w-full">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={idx !== i}
          >
            <ImagemSegura
              src={s.imagem}
              fallback="/img/hero/1.webp"
              alt={s.titulo}
              className="h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
              fetchPriority={idx === 0 ? "high" : "auto"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-angola-black/95 via-angola-black/65 to-angola-red/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-angola-black/50 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
                <div className="max-w-2xl text-white">
                  <span className="badge bg-angola-gold text-angola-black">
                    República de Angola
                  </span>
                  <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] drop-shadow md:text-6xl">
                    {s.titulo}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/90 md:text-lg">{s.texto}</p>
                  <Link href={s.cta.href} className="btn-gold mt-8">
                    {s.cta.texto}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              idx === i ? "w-8 bg-angola-gold" : "w-2.5 bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
