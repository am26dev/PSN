"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIPOS_SANGUE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function FichaSaudeForm({
  ficha,
}: {
  ficha: {
    tipoSanguineo: string | null;
    alergias: string | null;
    doencasCronicas: string | null;
    medicacaoAtual: string | null;
  } | null;
}) {
  const router = useRouter();
  const [abrir, setAbrir] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [form, setForm] = useState({
    tipoSanguineo: ficha?.tipoSanguineo ?? "",
    alergias: ficha?.alergias ?? "",
    doencasCronicas: ficha?.doencasCronicas ?? "",
    medicacaoAtual: ficha?.medicacaoAtual ?? "",
  });

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setAGuardar(true);
    setGuardado(false);
    try {
      const res = await fetch("/api/ficha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setGuardado(true);
        setAbrir(false);
        router.refresh();
      }
    } finally {
      setAGuardar(false);
    }
  }

  if (!abrir) {
    return (
      <div className="space-y-3">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Tipo sanguíneo" valor={form.tipoSanguineo} />
          <Campo rotulo="Alergias" valor={form.alergias} />
          <Campo rotulo="Doenças crónicas" valor={form.doencasCronicas} />
          <Campo rotulo="Medicação atual" valor={form.medicacaoAtual} />
        </dl>
        <button onClick={() => setAbrir(true)} className="btn-ghost py-2">
          Editar ficha de saúde
        </button>
        {guardado && (
          <span className="ml-3 text-sm text-green-700">Ficha atualizada.</span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <div>
        <label className="label">Tipo sanguíneo</label>
        <select
          className="input"
          value={form.tipoSanguineo}
          onChange={(e) => setForm((f) => ({ ...f, tipoSanguineo: e.target.value }))}
        >
          <option value="">Não sei / não indicar</option>
          {TIPOS_SANGUE.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Alergias</label>
        <textarea
          className="input"
          value={form.alergias}
          onChange={(e) => setForm((f) => ({ ...f, alergias: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Doenças crónicas</label>
        <textarea
          className="input"
          value={form.doencasCronicas}
          onChange={(e) => setForm((f) => ({ ...f, doencasCronicas: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Medicação atual</label>
        <textarea
          className="input"
          value={form.medicacaoAtual}
          onChange={(e) => setForm((f) => ({ ...f, medicacaoAtual: e.target.value }))}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={aGuardar} className="btn-primary py-2">
          {aGuardar ? "A guardar…" : "Guardar"}
        </button>
        <button type="button" onClick={() => setAbrir(false)} className="btn-ghost py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{rotulo}</dt>
      <dd className="mt-0.5 font-medium">{valor || "—"}</dd>
    </div>
  );
}
