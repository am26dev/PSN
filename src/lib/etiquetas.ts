import type {
  TipoUnidade,
  MetodoPagamento,
  EstadoMarcacao,
  EstadoPagamento,
} from "@prisma/client";

export const ETIQUETA_TIPO_UNIDADE: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "Hospital público",
  CLINICA_PRIVADA: "Clínica privada",
  FARMACIA: "Farmácia",
};

export const ETIQUETA_METODO_PAGAMENTO: Record<MetodoPagamento, string> = {
  MULTICAIXA_EXPRESS: "Multicaixa Express",
  REFERENCIA_EMIS: "Referência (qualquer banco)",
  E_KWANZA: "é-Kwanza (QR)",
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

export const ETIQUETA_ESTADO_PAGAMENTO: Record<EstadoPagamento, string> = {
  AGUARDA: "A aguardar pagamento",
  PAGO: "Pago",
  FALHADO: "Pagamento falhado",
  EXPIRADO: "Referência expirada",
  ISENTO: "Coberto pelo seguro",
};

export const COR_ESTADO_PAGAMENTO: Record<EstadoPagamento, string> = {
  AGUARDA: "bg-angola-gold/20 text-angola-gold-dark",
  PAGO: "bg-green-100 text-green-700",
  FALHADO: "bg-angola-red/10 text-angola-red-dark",
  EXPIRADO: "bg-angola-red/10 text-angola-red-dark",
  ISENTO: "bg-green-100 text-green-700",
};
