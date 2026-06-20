import type { TipoUnidade, MetodoPagamento, EstadoMarcacao } from "@prisma/client";

export const ETIQUETA_TIPO_UNIDADE: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "Hospital público",
  CLINICA_PRIVADA: "Clínica privada",
  FARMACIA: "Farmácia",
};

export const ETIQUETA_METODO_PAGAMENTO: Record<MetodoPagamento, string> = {
  MULTICAIXA_EXPRESS: "Multicaixa Express",
  TRANSFERENCIA_BANCARIA: "Transferência bancária",
  SEGURO_SAUDE: "Seguro de saúde",
  PAGAMENTO_ESTADO: "Pagamento ao Estado (RUPE)",
};

export const ETIQUETA_ESTADO_MARCACAO: Record<EstadoMarcacao, string> = {
  PENDENTE: "Pendente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  CONCLUIDA: "Concluída",
};

export const COR_ESTADO_MARCACAO: Record<EstadoMarcacao, string> = {
  PENDENTE: "bg-angola-gold/20 text-angola-gold-dark",
  CONFIRMADA: "bg-green-100 text-green-700",
  CANCELADA: "bg-angola-red/10 text-angola-red-dark",
  CONCLUIDA: "bg-base-muted text-gray-600",
};
