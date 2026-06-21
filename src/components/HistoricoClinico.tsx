interface Consulta {
  id: string;
  data: Date;
  profissionalNome: string | null;
  unidadeNome: string | null;
  motivo: string | null;
  diagnostico: string | null;
  notas: string | null;
}
interface Exame {
  id: string;
  data: Date;
  nome: string;
  profissionalNome: string | null;
  resultado: string | null;
  notas: string | null;
}
interface Patologia {
  id: string;
  nome: string;
  estado: string;
  desde: string | null;
  notas: string | null;
}

const COR_PATOLOGIA: Record<string, string> = {
  ATIVA: "bg-angola-red/10 text-angola-red-dark",
  CRONICA: "bg-angola-gold/20 text-angola-gold-dark",
  RESOLVIDA: "bg-green-100 text-green-700",
};

function dt(d: Date) {
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(new Date(d));
}

export function HistoricoClinico({
  consultas,
  exames,
  patologias,
}: {
  consultas: Consulta[];
  exames: Exame[];
  patologias: Patologia[];
}) {
  return (
    <div className="space-y-8">
      {/* Patologias */}
      <section>
        <h2 className="text-lg font-bold">Patologias / condições</h2>
        {patologias.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Sem patologias registadas.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {patologias.map((p) => (
              <span key={p.id} className={`badge ${COR_PATOLOGIA[p.estado] ?? "bg-base-muted"}`}>
                {p.nome}
                {p.desde ? ` · desde ${p.desde}` : ""} · {p.estado.toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Consultas */}
      <section>
        <h2 className="text-lg font-bold">Histórico de consultas</h2>
        {consultas.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Sem consultas registadas.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {consultas.map((c) => (
              <li key={c.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.diagnostico || c.motivo || "Consulta"}</p>
                  <span className="text-xs text-gray-400">{dt(c.data)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {[c.profissionalNome, c.unidadeNome].filter(Boolean).join(" · ") || "—"}
                </p>
                {c.motivo && c.diagnostico && (
                  <p className="mt-1 text-sm text-gray-600">Motivo: {c.motivo}</p>
                )}
                {c.notas && <p className="mt-1 text-sm text-gray-600">{c.notas}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Exames */}
      <section>
        <h2 className="text-lg font-bold">Resultados de exames</h2>
        {exames.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Sem exames registados.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {exames.map((e) => (
              <li key={e.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{e.nome}</p>
                  <span className="text-xs text-gray-400">{dt(e.data)}</span>
                </div>
                {e.resultado && <p className="mt-1 text-sm text-gray-600">Resultado: {e.resultado}</p>}
                {e.profissionalNome && (
                  <p className="mt-1 text-xs text-gray-400">{e.profissionalNome}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
