import { z } from "zod";
import { validarBI, validarPassaporte, normalizarDocumento } from "@/lib/documento";

const PROVINCIAS = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte",
  "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire",
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

export type RegistoInput = z.infer<typeof registoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
