"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatarKz } from "@/lib/moeda";

interface Opcao {
  id: string;
  nome: string;
}

export function MarcacaoForm({
  unidadeId,
  especialidades,
  medicos,
  dependentes,
  temSeguro,
  valorCentimos,
}: {
  unidadeId: string;
  especialidades: Opcao[];
  medicos: { id: string; nome: string; especialidadeId: string }[];
  dependentes: { id: string; nomeCompleto: string }[];
  temSeguro: boolean;
  valorCentimos: number;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aSubmeter, setASubmeter] = useState(false);
  const [especialidadeId, setEspecialidadeId] = useState("");
  const [form, setForm] = useState({
    paraQuem: "EU",
    dependenteId: "",
    medicoId: "",
    dataHora: "",
    motivo: "",
    metodoPagamento: "MULTICAIXA_EXPRESS",
  });

  const medicosFiltrados = especialidadeId
    ? medicos.filter((m) => m.especialidadeId === especialidadeId)
    : medicos;

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setASubmeter(true);
    try {
      const res = await fetch("/api/marcacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadeId,
          especialidadeId: especialidadeId || undefined,
          medicoId: form.medicoId || undefined,
          dependenteId: form.paraQuem === "DEP" ? form.dependenteId : undefined,
          dataHora: form.dataHora,
          motivo: form.motivo || undefined,
          metodoPagamento: form.metodoPagamento,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível marcar a consulta.");
        return;
      }
      router.push("/conta?marcacao=ok");
      router.refresh();
    } catch {
      setErro("Falha de ligação. Tente novamente.");
    } finally {
      setASubmeter(false);
    }
  }

  return (
    <form onSubmit={submeter} className="card space-y-5 p-6">
      {/* Para quem */}
      <div>
        <label className="label">Para quem é a consulta?</label>
        <select
          className="input"
          value={form.paraQuem}
          onChange={(e) => setForm((f) => ({ ...f, paraQuem: e.target.value }))}
        >
          <option value="EU">Para mim</option>
          {dependentes.length > 0 && (
            <option value="DEP">Para um dependente do meu agregado</option>
          )}
        </select>
        {form.paraQuem === "DEP" && (
          <select
            className="input mt-3"
            value={form.dependenteId}
            onChange={(e) => setForm((f) => ({ ...f, dependenteId: e.target.value }))}
            required
          >
            <option value="">Selecione o dependente…</option>
            {dependentes.map((d) => (
              <option key={d.id} value={d.id}>{d.nomeCompleto}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Especialidade</label>
          <select
            className="input"
            value={especialidadeId}
            onChange={(e) => {
              setEspecialidadeId(e.target.value);
              setForm((f) => ({ ...f, medicoId: "" }));
            }}
          >
            <option value="">Qualquer especialidade</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Médico (opcional)</label>
          <select
            className="input"
            value={form.medicoId}
            onChange={(e) => setForm((f) => ({ ...f, medicoId: e.target.value }))}
          >
            <option value="">Sem preferência</option>
            {medicosFiltrados.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Data e hora pretendidas</label>
        <input
          type="datetime-local"
          className="input"
          value={form.dataHora}
          onChange={(e) => setForm((f) => ({ ...f, dataHora: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="label">Motivo (opcional)</label>
        <textarea
          className="input min-h-[80px]"
          value={form.motivo}
          onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
        />
      </div>

      {/* Pagamento */}
      <div>
        <label className="label">Método de pagamento</label>
        <select
          className="input"
          value={form.metodoPagamento}
          onChange={(e) => setForm((f) => ({ ...f, metodoPagamento: e.target.value }))}
        >
          <option value="MULTICAIXA_EXPRESS">Multicaixa Express</option>
          <option value="TRANSFERENCIA_BANCARIA">Transferência bancária</option>
          {temSeguro && <option value="SEGURO_SAUDE">Seguro de saúde</option>}
          <option value="PAGAMENTO_ESTADO">Pagamento ao Estado (RUPE)</option>
        </select>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-base-soft px-4 py-3">
        <span className="text-sm text-gray-600">Valor da consulta</span>
        <span className="text-lg font-bold text-angola-red">
          {formatarKz(valorCentimos)}
        </span>
      </div>

      {erro && (
        <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
          {erro}
        </p>
      )}

      <button type="submit" disabled={aSubmeter} className="btn-primary w-full">
        {aSubmeter ? "A marcar…" : "Confirmar marcação"}
      </button>
      <p className="text-center text-xs text-gray-400">
        O pagamento é processado na fase de integração com a EMIS/Multicaixa. Por
        agora a marcação fica registada como pendente de pagamento.
      </p>
    </form>
  );
}
