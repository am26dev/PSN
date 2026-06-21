"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SlideHero } from "@/lib/imagens";

export function Hero({ slides }: { slides: SlideHero[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden rounded-2xl shadow-card">
      <div className="relative h-[420px] w-full md:h-[460px]">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={idx !== i}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imagem}
              alt=""
              className="h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-angola-black/85 via-angola-red/70 to-angola-red/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
                <div className="max-w-xl text-white">
                  <span className="badge bg-angola-gold text-angola-black">
                    República de Angola
                  </span>
                  <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
                    {s.titulo}
                  </h1>
                  <p className="mt-3 text-white/90">{s.texto}</p>
                  <Link href={s.cta.href} className="btn-gold mt-6">
                    {s.cta.texto}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-6 bg-angola-gold" : "w-2 bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
