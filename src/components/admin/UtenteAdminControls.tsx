"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UtenteAdminControls({
  id,
  papel,
  verificado,
}: {
  id: string;
  papel: string;
  verificado: boolean;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [papelAtual, setPapelAtual] = useState(papel);

  async function patch(body: Record<string, unknown>) {
    setOcupado(true);
    try {
      const res = await fetch(`/api/admin/utentes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
      else {
        const d = await res.json();
        alert(d.erro ?? "Não foi possível atualizar.");
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="input w-40 py-1.5 text-sm"
        value={papelAtual}
        disabled={ocupado}
        onChange={(e) => {
          setPapelAtual(e.target.value);
          patch({ papel: e.target.value });
        }}
      >
        <option value="UTENTE">Utente</option>
        <option value="PROFISSIONAL">Profissional</option>
        <option value="ADMIN">Administrador</option>
      </select>
      <button
        onClick={() => patch({ verificado: !verificado })}
        disabled={ocupado}
        className={`badge ${
          verificado ? "bg-green-100 text-green-700" : "bg-base-muted text-gray-600"
        }`}
      >
        {verificado ? "Verificado ✓" : "Marcar verificado"}
      </button>
    </div>
  );
}
