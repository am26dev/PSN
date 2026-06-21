"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS_ANGOLA } from "@/lib/validacao";

interface Perfil {
  nomeCompleto: string;
  telefone: string;
  email: string;
  nif: string;
  morada: string;
  provincia: string;
  municipio: string;
}

export function PerfilForm({
  inicial,
  temAvatar,
}: {
  inicial: Perfil;
  temAvatar: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState<Perfil>(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [avatar, setAvatar] = useState(temAvatar);
  const [cacheBust, setCacheBust] = useState(Date.now());

  function set<K extends keyof Perfil>(k: K, val: Perfil[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(false);
    setOcupado(true);
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível guardar.");
        return;
      }
      setOk(true);
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  async function enviarFoto(ficheiro: File) {
    setErro(null);
    setOcupado(true);
    try {
      const fd = new FormData();
      fd.append("ficheiro", ficheiro);
      const res = await fetch("/api/perfil/foto", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível carregar a foto.");
        return;
      }
      setAvatar(true);
      setCacheBust(Date.now());
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  const iniciais = v.nomeCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Foto de perfil */}
      <div className="card flex items-center gap-5 p-6">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-base-line bg-angola-red/10">
          {avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`/api/perfil/foto?t=${cacheBust}`}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-angola-red">
              {iniciais || "?"}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold">Foto de perfil</p>
          <label className="btn-ghost mt-2 inline-flex cursor-pointer py-2">
            {avatar ? "Mudar foto" : "Carregar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) enviarFoto(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* Dados */}
      <form onSubmit={guardar} className="card space-y-5 p-6">
        <div>
          <label className="label">Nome completo</label>
          <input className="input" value={v.nomeCompleto} onChange={(e) => set("nomeCompleto", e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Telefone</label>
            <input className="input" value={v.telefone} onChange={(e) => set("telefone", e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={v.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Província</label>
            <select className="input" value={v.provincia} onChange={(e) => set("provincia", e.target.value)}>
              <option value="">Selecione…</option>
              {PROVINCIAS_ANGOLA.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Município</label>
            <input className="input" value={v.municipio} onChange={(e) => set("municipio", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">NIF</label>
            <input className="input" value={v.nif} onChange={(e) => set("nif", e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="label">Morada</label>
            <input className="input" value={v.morada} onChange={(e) => set("morada", e.target.value)} />
          </div>
        </div>

        {erro && <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">{erro}</p>}
        {ok && <p className="text-sm text-green-700">Perfil atualizado.</p>}

        <button type="submit" disabled={ocupado} className="btn-primary">
          {ocupado ? "A guardar…" : "Guardar alterações"}
        </button>
      </form>
    </div>
  );
}
