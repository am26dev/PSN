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
                  onChange={(e) => setV((s) => ({ ...s, [c.chave]: e.target.value }))}
                />
              ) : (
                <input
                  id={c.chave}
                  className="input"
                  value={v[c.chave] ?? ""}
                  onChange={(e) => setV((s) => ({ ...s, [c.chave]: e.target.value }))}
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

      <button type="submit" disabled={ocupado} className="btn-primary">
        {ocupado ? "A guardar…" : "Guardar alterações"}
      </button>
    </form>
  );
}
