"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS_ANGOLA } from "@/lib/validacao";

interface Valores {
  nome: string;
  tipo: string;
  provincia: string;
  municipio: string;
  morada: string;
  telefone: string;
  horario: string;
  urgencia24h: boolean;
  logoUrl: string;
  bannerUrl: string;
  descricao: string;
  ativo: boolean;
}

export function UnidadeForm({
  id,
  inicial,
}: {
  id?: string;
  inicial?: Partial<Valores>;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [v, setV] = useState<Valores>({
    nome: inicial?.nome ?? "",
    tipo: inicial?.tipo ?? "HOSPITAL_PUBLICO",
    provincia: inicial?.provincia ?? "",
    municipio: inicial?.municipio ?? "",
    morada: inicial?.morada ?? "",
    telefone: inicial?.telefone ?? "",
    horario: inicial?.horario ?? "",
    urgencia24h: inicial?.urgencia24h ?? false,
    logoUrl: inicial?.logoUrl ?? "",
    bannerUrl: inicial?.bannerUrl ?? "",
    descricao: inicial?.descricao ?? "",
    ativo: inicial?.ativo ?? true,
  });

  function set<K extends keyof Valores>(k: K, val: Valores[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);
    try {
      const url = id ? `/api/admin/unidades/${id}` : "/api/admin/unidades";
      const res = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível guardar.");
        return;
      }
      router.push("/admin/unidades");
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={guardar} className="card space-y-5 p-6">
      <div>
        <label className="label">Nome da unidade</label>
        <input className="input" value={v.nome} onChange={(e) => set("nome", e.target.value)} required />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={v.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="HOSPITAL_PUBLICO">Hospital público</option>
            <option value="CLINICA_PRIVADA">Clínica privada</option>
            <option value="FARMACIA">Farmácia</option>
          </select>
        </div>
        <div>
          <label className="label">Província</label>
          <select className="input" value={v.provincia} onChange={(e) => set("provincia", e.target.value)} required>
            <option value="">Selecione…</option>
            {PROVINCIAS_ANGOLA.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Município</label>
          <input className="input" value={v.municipio} onChange={(e) => set("municipio", e.target.value)} required />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Telefone</label>
          <input className="input" value={v.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </div>
        <div>
          <label className="label">Horário</label>
          <input className="input" value={v.horario} onChange={(e) => set("horario", e.target.value)} placeholder="Seg-Sex, 08h-18h" />
        </div>
      </div>

      <div>
        <label className="label">Morada</label>
        <input className="input" value={v.morada} onChange={(e) => set("morada", e.target.value)} />
      </div>

      <div>
        <label className="label">Logótipo (URL da imagem)</label>
        <input className="input" value={v.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
      </div>
      <div>
        <label className="label">Banner (URL da imagem)</label>
        <input className="input" value={v.bannerUrl} onChange={(e) => set("bannerUrl", e.target.value)} placeholder="https://…" />
      </div>

      <div>
        <label className="label">Descrição</label>
        <textarea className="input min-h-[90px]" value={v.descricao} onChange={(e) => set("descricao", e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.urgencia24h} onChange={(e) => set("urgencia24h", e.target.checked)} />
          Urgência 24 horas
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.ativo} onChange={(e) => set("ativo", e.target.checked)} />
          Ativa (visível no portal)
        </label>
      </div>

      {erro && <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">{erro}</p>}

      <button type="submit" disabled={ocupado} className="btn-primary w-full">
        {ocupado ? "A guardar…" : id ? "Guardar alterações" : "Criar unidade"}
      </button>
    </form>
  );
}
