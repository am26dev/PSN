import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dependenteSchema } from "@/lib/validacao";
import type { Utente } from "@prisma/client";

export type DependenteInput = z.infer<typeof dependenteSchema>;

/** Regista um dependente do agregado familiar do utente autenticado. */
export async function criarDependente(
  utente: Utente,
  d: DependenteInput,
): Promise<{ id: string }> {
  const dependente = await prisma.dependente.create({
    data: {
      responsavelId: utente.id,
      parentesco: d.parentesco,
      tipoDocumento: d.tipoDocumento,
      numeroDocumento: d.numeroDocumento || null,
      nomeCompleto: d.nomeCompleto,
      dataNascimento: new Date(d.dataNascimento),
      sexo: d.sexo,
    },
  });
  return { id: dependente.id };
}

/** Listar dependentes de um utente (formulário de marcação). */
export async function listarDependentes(utenteId: string) {
  return prisma.dependente.findMany({
    where: { responsavelId: utenteId },
    select: { id: true, nomeCompleto: true, parentesco: true },
  });
}

/** Listar dependentes completos (página "A minha conta"). */
export async function listarDependentesCompletos(utenteId: string) {
  return prisma.dependente.findMany({
    where: { responsavelId: utenteId },
    orderBy: { criadoEm: "desc" },
  });
}
