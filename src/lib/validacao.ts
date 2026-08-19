import { z } from "zod";
import { validarBI, validarPassaporte, normalizarDocumento } from "@/lib/documento";

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cubango", "Cuando",
  "Cuando Cubango", "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo",
  "Huíla", "Icolo e Bengo", "Luanda", "Lunda Norte", "Lunda Sul",
  "Malanje", "Moxico", "Moxico Leste", "Namibe", "Uíge", "Zaire",
  "Não identificado",
] as const;

export const PROVINCIAS_ANGOLA = PROVINCIAS;

const passwordSchema = z
  .string()
  .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "Deve conter pelo menos um número.");

export const registoSchema = z
  .object({
    tipoDocumento: z.enum(["BI", "PASSAPORTE"]),
    numeroDocumento: z.string().min(5, "Documento inválido."),
    nomeCompleto: z.string().min(3, "Indique o nome completo."),
    dataNascimento: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Data de nascimento inválida.",
    }),
    sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
    telefone: z.string().optional(),
    email: z.string().email("Email inválido.").optional().or(z.literal("")),
    nif: z.string().optional(),
    morada: z.string().optional(),
    provincia: z.string().optional(),
    municipio: z.string().optional(),
    password: passwordSchema,
  })
  .refine(
    (d) =>
      d.tipoDocumento === "BI"
        ? validarBI(d.numeroDocumento)
        : validarPassaporte(d.numeroDocumento),
    {
      message:
        "Número de documento com formato inválido para o tipo selecionado.",
      path: ["numeroDocumento"],
    },
  )
  .transform((d) => ({ ...d, numeroDocumento: normalizarDocumento(d.numeroDocumento) }));

export const loginSchema = z.object({
  numeroDocumento: z.string().min(5),
  password: z.string().min(1, "Indique a palavra-passe."),
});

export const dependenteSchema = z.object({
  parentesco: z.enum(["FILHO", "CONJUGE", "PAI", "MAE", "OUTRO"]),
  tipoDocumento: z.enum(["BI", "PASSAPORTE"]),
  numeroDocumento: z.string().optional(),
  nomeCompleto: z.string().min(3, "Indique o nome completo do dependente."),
  dataNascimento: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
  sexo: z.enum(["MASCULINO", "FEMININO", "OUTRO"]),
});

export const marcacaoSchema = z.object({
  unidadeId: z.string().min(1),
  especialidadeId: z.string().optional(),
  medicoId: z.string().optional(),
  dependenteId: z.string().optional(),
  dataHora: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Data/hora inválida.",
  }),
  motivo: z.string().optional(),
  referenciaMedica: z.string().optional(),
  telefone: z.string().optional(),
  metodoPagamento: z.enum([
    "MULTICAIXA_EXPRESS",
    "REFERENCIA_EMIS",
    "E_KWANZA",
    "SEGURO_SAUDE",
    "PAGAMENTO_ESTADO",
  ]),
});

export const iniciarVerificacaoSchema = z.object({
  tipoDocumento: z.enum(["BI", "PASSAPORTE", "AUTORIZACAO_RESIDENCIA"]),
  numeroDocumento: z.string().min(5, "Documento inválido."),
  nomeCompleto: z.string().min(3, "Indique o nome completo."),
  dataNascimento: z.string().optional(),
  nacionalidade: z.string().optional(),
});

export const revisaoVerificacaoSchema = z.object({
  acao: z.enum(["APROVAR", "REJEITAR"]),
  motivo: z.string().max(500).optional(),
});

export const unidadeSchema = z.object({
  nome: z.string().min(2, "Indique o nome da unidade."),
  tipo: z.enum([
    "HOSPITAL_PUBLICO",
    "UNIDADE_HOSPITALAR",
    "CLINICA_PRIVADA",
    "CENTRO_MEDICO",
    "CLINICA_DENTARIA",
    "LABORATORIO",
    "FISIOTERAPIA",
    "OPTICA",
    "PRESTADOR_SAUDE",
    "FARMACIA",
  ]),
  provincia: z.string().min(2, "Indique a província."),
  municipio: z.string().min(2, "Indique o município."),
  morada: z.string().optional(),
  telefone: z.string().optional(),
  horario: z.string().optional(),
  urgencia24h: z.boolean().optional(),
  logoUrl: z.string().max(2048).refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "URL inválido.",
  ).optional(),
  bannerUrl: z.string().max(2048).refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "URL inválido.",
  ).optional(),
  descricao: z.string().max(2000).optional(),
  ativo: z.boolean().optional(),
});

export const utenteAdminSchema = z.object({
  papel: z.enum(["UTENTE", "PROFISSIONAL", "ADMIN"]).optional(),
  verificado: z.boolean().optional(),
  ativo: z.boolean().optional(),
});

export const perfilSchema = z.object({
  nomeCompleto: z.string().min(3).optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  nif: z.string().optional(),
  morada: z.string().optional(),
  provincia: z.string().optional(),
  municipio: z.string().optional(),
});

// ── Histórico clínico (registos feitos pelo médico) ─────────────────────────
export const consultaSchema = z.object({
  pacienteId: z.string().min(1),
  unidadeNome: z.string().optional(),
  motivo: z.string().optional(),
  diagnostico: z.string().optional(),
  notas: z.string().max(4000).optional(),
});

export const exameSchema = z.object({
  pacienteId: z.string().min(1),
  nome: z.string().min(2, "Indique o nome do exame."),
  resultado: z.string().max(4000).optional(),
  notas: z.string().max(4000).optional(),
});

export const patologiaSchema = z.object({
  pacienteId: z.string().min(1),
  nome: z.string().min(2, "Indique a patologia."),
  estado: z.enum(["ATIVA", "CRONICA", "RESOLVIDA"]).optional(),
  desde: z.string().optional(),
  notas: z.string().max(2000).optional(),
});

export type RegistoInput = z.infer<typeof registoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
