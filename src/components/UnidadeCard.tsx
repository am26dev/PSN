import Link from "next/link";
import type { TipoUnidade } from "@prisma/client";
import { ETIQUETA_TIPO_UNIDADE } from "@/lib/etiquetas";
import { fotoUnidade, imagemPadraoUnidade } from "@/lib/imagens";
import { LogoSeguradora } from "@/components/LogoSeguradora";
import { ImagemSegura } from "@/components/ImagemSegura";

const COR_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "bg-angola-red/10 text-angola-red-dark",
  UNIDADE_HOSPITALAR: "bg-angola-red/10 text-angola-red-dark",
  CLINICA_PRIVADA: "bg-angola-gold/20 text-angola-gold-dark",
  CENTRO_MEDICO: "bg-angola-gold/20 text-angola-gold-dark",
  CLINICA_DENTARIA: "bg-angola-gold/20 text-angola-gold-dark",
  LABORATORIO: "bg-blue-100 text-blue-700",
  FISIOTERAPIA: "bg-emerald-100 text-emerald-700",
  OPTICA: "bg-sky-100 text-sky-700",
  PRESTADOR_SAUDE: "bg-base-muted text-gray-700",
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
    seguradoras: {
      seguradoraId: string;
      seguradora: { nome: string; logoUrl: string | null };
    }[];
  };
}) {
  return (
    <Link
      href={`/unidades/${unidade.id}`}
      className="card group block overflow-hidden transition hover:shadow-lg"
    >
      <div className="relative h-36 w-full overflow-hidden bg-base-muted">
        <ImagemSegura
          src={fotoUnidade(unidade.tipo, unidade.id, unidade.logoUrl)}
          fallback={imagemPadraoUnidade(unidade.tipo)}
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
        {unidade.seguradoras.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-base-line pt-3">
            <span className="mr-1 text-[11px] font-medium text-gray-400">Cobertura:</span>
            {unidade.seguradoras.slice(0, 4).map((s) => (
              <LogoSeguradora
                key={s.seguradoraId}
                nome={s.seguradora.nome}
                logoUrl={s.seguradora.logoUrl}
                compacto
              />
            ))}
            {unidade.seguradoras.length > 4 && (
              <span className="text-xs text-gray-400">+{unidade.seguradoras.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
