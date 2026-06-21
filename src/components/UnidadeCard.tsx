import Link from "next/link";
import type { TipoUnidade } from "@prisma/client";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";
import { fotoUnidade } from "@/lib/imagens";

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
    logoUrl?: string | null;
    especialidades: { especialidade: { nome: string } }[];
  };
}) {
  return (
    <Link
      href={`/unidades/${unidade.id}`}
      className="card group block overflow-hidden transition hover:shadow-lg"
    >
      <div className="relative h-36 w-full overflow-hidden bg-base-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUnidade(unidade.tipo, unidade.id, unidade.logoUrl)}
          alt={unidade.nome}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {unidade.urgencia24h && (
          <span className="badge absolute right-2 top-2 bg-angola-red text-white">
            Urgência 24h
          </span>
        )}
        <span className={`badge absolute left-2 top-2 ${COR_TIPO[unidade.tipo]}`}>
          {ETIQUETA_TIPO_UNIDADE[unidade.tipo]}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-bold leading-snug">{unidade.nome}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {unidade.municipio}, {unidade.provincia}
        </p>
        {unidade.especialidades.length > 0 && (
          <p className="mt-3 line-clamp-1 text-xs text-gray-500">
            {unidade.especialidades.map((e) => e.especialidade.nome).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
