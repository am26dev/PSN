"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CampoConteudo } from "@/lib/conteudo";

export function ConteudoForm({
  campos,
  valores,
}: {
  campos: CampoConteudo[];
  valores: Record<string, string>;
}) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(valores);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [alterado, setAlterado] = useState(false);

  // Agrupa os campos por secção para uma edição mais legível.
  const grupos = campos.reduce<Record<string, CampoConteudo[]>>((acc, c) => {
    (acc[c.grupo] ??= []).push(c);
    return acc;
  }, {});

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(false);
    setOcupado(true);
    try {
      const res = await fetch("/api/admin/conteudo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível guardar.");
        return;
      }
      setOk(true);
      setAlterado(false);
      router.refresh();
    } catch {
      setErro("Erro de ligação. Tente novamente.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-8">
      {Object.entries(grupos).map(([grupo, lista]) => (
        <section key={grupo} className="card space-y-5 p-6">
          <h2 className="text-lg font-bold">{grupo}</h2>
          {lista.map((c) => (
            <div key={c.chave}>
              <label className="label" htmlFor={c.chave}>
                {c.rotulo}
              </label>
              {c.multilinha ? (
                <textarea
                  id={c.chave}
                  className="input min-h-[90px]"
                  value={v[c.chave] ?? ""}
                  onChange={(e) => {
                    setV((s) => ({ ...s, [c.chave]: e.target.value }));
                    setAlterado(true);
                    setOk(false);
                  }}
                />
              ) : (
                <input
                  id={c.chave}
                  className="input"
                  value={v[c.chave] ?? ""}
                  onChange={(e) => {
                    setV((s) => ({ ...s, [c.chave]: e.target.value }));
                    setAlterado(true);
                    setOk(false);
                  }}
                />
              )}
            </div>
          ))}
        </section>
      ))}

      {erro && (
        <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">{erro}</p>
      )}
      {ok && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Conteúdo atualizado. As alterações já estão visíveis no portal.
        </p>
      )}

      <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-2xl border border-base-line bg-white/95 p-3 shadow-xl backdrop-blur">
        <span className="px-2 text-xs text-gray-500">{alterado ? "Alterações por publicar" : "Conteúdo sincronizado"}</span>
        <button type="submit" disabled={ocupado || !alterado} className="btn-primary">
          {ocupado ? "A guardar…" : "Guardar e publicar"}
        </button>
      </div>
    </form>
  );
}
