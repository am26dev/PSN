"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Dependente {
  id: string;
  nomeCompleto: string;
  parentesco: string;
  dataNascimento: string;
}

const PARENTESCO_ROTULO: Record<string, string> = {
  FILHO: "Filho(a)",
  CONJUGE: "Cônjuge",
  PAI: "Pai",
  MAE: "Mãe",
  OUTRO: "Outro",
};

export function AgregadoFamiliar({ dependentes }: { dependentes: Dependente[] }) {
  const router = useRouter();
  const [abrir, setAbrir] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: "",
    parentesco: "FILHO",
    tipoDocumento: "BI",
    numeroDocumento: "",
    dataNascimento: "",
    sexo: "MASCULINO",
  });

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAGuardar(true);
    try {
      const res = await fetch("/api/dependentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível adicionar.");
        return;
      }
      setAbrir(false);
      setForm({
        nomeCompleto: "",
        parentesco: "FILHO",
        tipoDocumento: "BI",
        numeroDocumento: "",
        dataNascimento: "",
        sexo: "MASCULINO",
      });
      router.refresh();
    } catch {
      setErro("Falha de ligação.");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="space-y-4">
      {dependentes.length === 0 ? (
        <p className="text-sm text-gray-500">
          Ainda não adicionou dependentes ao seu agregado familiar.
        </p>
      ) : (
        <ul className="divide-y divide-base-line">
          {dependentes.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{d.nomeCompleto}</p>
                <p className="text-sm text-gray-500">
                  {PARENTESCO_ROTULO[d.parentesco] ?? d.parentesco}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!abrir ? (
        <button onClick={() => setAbrir(true)} className="btn-gold py-2">
          + Adicionar familiar
        </button>
      ) : (
        <form onSubmit={adicionar} className="space-y-4 rounded-xl bg-base-soft p-4">
          <div>
            <label className="label">Nome completo</label>
            <input
              className="input"
              value={form.nomeCompleto}
              onChange={(e) => setForm((f) => ({ ...f, nomeCompleto: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Parentesco</label>
              <select
                className="input"
                value={form.parentesco}
                onChange={(e) => setForm((f) => ({ ...f, parentesco: e.target.value }))}
              >
                {Object.entries(PARENTESCO_ROTULO).map(([v, r]) => (
                  <option key={v} value={v}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sexo</label>
              <select
                className="input"
                value={form.sexo}
                onChange={(e) => setForm((f) => ({ ...f, sexo: e.target.value }))}
              >
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tipo de documento</label>
              <select
                className="input"
                value={form.tipoDocumento}
                onChange={(e) => setForm((f) => ({ ...f, tipoDocumento: e.target.value }))}
              >
                <option value="BI">Bilhete de Identidade</option>
                <option value="PASSAPORTE">Passaporte</option>
              </select>
            </div>
            <div>
              <label className="label">Nº documento (opcional)</label>
              <input
                className="input"
                value={form.numeroDocumento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numeroDocumento: e.target.value.toUpperCase() }))
                }
              />
            </div>
          </div>
          <div>
            <label className="label">Data de nascimento</label>
            <input
              type="date"
              className="input"
              value={form.dataNascimento}
              onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
              required
            />
          </div>
          {erro && <p className="text-sm text-angola-red-dark">{erro}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={aGuardar} className="btn-primary py-2">
              {aGuardar ? "A adicionar…" : "Adicionar"}
            </button>
            <button type="button" onClick={() => setAbrir(false)} className="btn-ghost py-2">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
