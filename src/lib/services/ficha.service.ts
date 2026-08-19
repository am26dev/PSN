import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Utente } from "@prisma/client";

export const fichaSchema = z.object({
  tipoSanguineo: z.string().max(4).optional().or(z.literal("")),
  alergias: z.string().max(2000).optional().or(z.literal("")),
  doencasCronicas: z.string().max(2000).optional().or(z.literal("")),
  medicacaoAtual: z.string().max(2000).optional().or(z.literal("")),
});

export type FichaInput = z.infer<typeof fichaSchema>;

/** Grava (cria ou atualiza) a ficha clínica do próprio utente. */
export async function gravarFicha(utente: Utente, d: FichaInput): Promise<void> {
  const dados = {
    tipoSanguineo: d.tipoSanguineo || null,
    alergias: d.alergias || null,
    doencasCronicas: d.doencasCronicas || null,
    medicacaoAtual: d.medicacaoAtual || null,
  };
  await prisma.fichaSaude.upsert({
    where: { utenteId: utente.id },
    update: dados,
    create: { utenteId: utente.id, ...dados },
  });
}
