"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminRevisao({ verificacaoId }: { verificacaoId: string }) {
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function decidir(acao: "APROVAR" | "REJEITAR") {
    setErro(null);
    if (acao === "REJEITAR" && !motivo.trim()) {
      setErro("Indique o motivo da rejeição.");
      return;
    }
    setOcupado(true);
    try {
      const res = await fetch(`/api/admin/verificacoes/${verificacaoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, motivo: motivo.trim() || undefined }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErro(j.erro ?? "Não foi possível concluir.");
        return;
      }
      router.push("/admin/verificacoes");
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className="input min-h-[80px]"
        placeholder="Motivo (obrigatório em caso de rejeição)"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
      />
      {erro && <p className="text-sm text-angola-red-dark">{erro}</p>}
      <div className="flex gap-2">
        <button onClick={() => decidir("APROVAR")} disabled={ocupado} className="btn-primary flex-1">
          Aprovar
        </button>
        <button
          onClick={() => decidir("REJEITAR")}
          disabled={ocupado}
          className="btn-ghost flex-1 border-angola-red text-angola-red"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}
