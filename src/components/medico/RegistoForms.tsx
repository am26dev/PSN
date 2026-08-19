"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Aba = "consulta" | "exame" | "patologia";

export function RegistoForms({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("consulta");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [aGravar, setAGravar] = useState(false);

  async function submeter(endpoint: string, corpo: Record<string, unknown>) {
    setErro(null);
    setOk(false);
    setAGravar(true);
    try {
      const res = await fetch(`/api/medico/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...corpo, pacienteId }),
      });
      const dados = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível guardar o registo.");
        return false;
      }
      setOk(true);
      router.refresh();
      return true;
    } catch {
      setErro("Erro de ligação. Tente novamente.");
      return false;
    } finally {
      setAGravar(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold">Adicionar registo clínico</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["consulta", "Consulta"],
            ["exame", "Exame"],
            ["patologia", "Patologia"],
          ] as [Aba, string][]
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            onClick={() => {
              setAba(valor);
              setErro(null);
              setOk(false);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              aba === valor
                ? "bg-angola-red text-white"
                : "border border-base-line text-angola-black hover:border-angola-red"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {erro && (
        <p className="mt-4 rounded-lg bg-angola-red/5 p-3 text-sm text-angola-red-dark">
          {erro}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Registo guardado com sucesso.
        </p>
      )}

      {aba === "consulta" && (
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget;
            const dados = new FormData(f);
            const sucesso = await submeter("consulta", {
              unidadeNome: dados.get("unidadeNome"),
              motivo: dados.get("motivo"),
              diagnostico: dados.get("diagnostico"),
              notas: dados.get("notas"),
            });
            if (sucesso) f.reset();
          }}
        >
          <input name="unidadeNome" placeholder="Unidade / clínica" className="input w-full" />
          <input name="motivo" placeholder="Motivo da consulta" className="input w-full" />
          <input name="diagnostico" placeholder="Diagnóstico" className="input w-full" />
          <textarea name="notas" placeholder="Notas clínicas" rows={3} className="input w-full" />
          <button type="submit" disabled={aGravar} className="btn-primary">
            {aGravar ? "A guardar…" : "Guardar consulta"}
          </button>
        </form>
      )}

      {aba === "exame" && (
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget;
            const dados = new FormData(f);
            const sucesso = await submeter("exame", {
              nome: dados.get("nome"),
              resultado: dados.get("resultado"),
              notas: dados.get("notas"),
            });
            if (sucesso) f.reset();
          }}
        >
          <input name="nome" placeholder="Nome do exame (ex.: Hemograma)" className="input w-full" required />
          <textarea name="resultado" placeholder="Resultado" rows={3} className="input w-full" />
          <textarea name="notas" placeholder="Notas" rows={2} className="input w-full" />
          <button type="submit" disabled={aGravar} className="btn-primary">
            {aGravar ? "A guardar…" : "Guardar exame"}
          </button>
        </form>
      )}

      {aba === "patologia" && (
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget;
            const dados = new FormData(f);
            const sucesso = await submeter("patologia", {
              nome: dados.get("nome"),
              estado: dados.get("estado"),
              desde: dados.get("desde"),
              notas: dados.get("notas"),
            });
            if (sucesso) f.reset();
          }}
        >
          <input name="nome" placeholder="Patologia / condição" className="input w-full" required />
          <div className="flex gap-3">
            <select name="estado" className="input flex-1" defaultValue="ATIVA">
              <option value="ATIVA">Ativa</option>
              <option value="CRONICA">Crónica</option>
              <option value="RESOLVIDA">Resolvida</option>
            </select>
            <input name="desde" placeholder="Desde (ex.: 2021)" className="input flex-1" />
          </div>
          <textarea name="notas" placeholder="Notas" rows={2} className="input w-full" />
          <button type="submit" disabled={aGravar} className="btn-primary">
            {aGravar ? "A guardar…" : "Guardar patologia"}
          </button>
        </form>
      )}
    </div>
  );
}
