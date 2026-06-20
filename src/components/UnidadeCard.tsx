import Link from "next/link";
import type { TipoUnidade } from "@prisma/client";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";

const COR_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "bg-angola-red/10 text-angola-red-dark",
  CLINICA_PRIVADA: "bg-angola-gold/20 text-angola-gold-dark",
  FARMACIA: "bg-base-muted text-gray-700",
};

export function UnidadeCard({
  unidade,
}: {
  unidade: {
    id: string;
    nome: string;
    tipo: TipoUnidade;
    provincia: string;
    municipio: string;
    urgencia24h: boolean;
    especialidades: { especialidade: { nome: string } }[];
  };
}) {
  return (
    <Link href={`/unidades/${unidade.id}`} className="card block p-5 transition hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold leading-snug">{unidade.nome}</h3>
        {unidade.urgencia24h && (
          <span className="badge bg-angola-red text-white">Urgência 24h</span>
        )}
      </div>
      <span className={`badge mt-2 ${COR_TIPO[unidade.tipo]}`}>
        {ETIQUETA_TIPO_UNIDADE[unidade.tipo]}
      </span>
      <p className="mt-2 text-sm text-gray-600">
        {unidade.municipio}, {unidade.provincia}
      </p>
      {unidade.especialidades.length > 0 && (
        <p className="mt-3 line-clamp-1 text-xs text-gray-500">
          {unidade.especialidades.map((e) => e.especialidade.nome).join(" · ")}
        </p>
      )}
    </Link>
  );
}
