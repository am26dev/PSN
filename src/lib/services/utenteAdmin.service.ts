import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { utenteAdminSchema } from "@/lib/validacao";
import { ServiceError } from "./http";
import type { Utente } from "@prisma/client";

export type UtenteAdminInput = z.infer<typeof utenteAdminSchema>;

/** Altera nível de acesso / estado de um utente (administração). */
export async function alterarAcesso(
  admin: Utente,
  id: string,
  d: UtenteAdminInput,
): Promise<void> {
  // Salvaguarda: o admin não se pode despromover/desativar a si próprio.
  if (id === admin.id && (d.papel === "UTENTE" || d.ativo === false)) {
    throw new ServiceError(422, "Não pode remover o seu próprio acesso de administrador.");
  }

  const existe = await prisma.utente.findUnique({ where: { id } });
  if (!existe) throw new ServiceError(404, "Utente não encontrado.");

  await prisma.utente.update({
    where: { id },
    data: {
      ...(d.papel !== undefined && { papel: d.papel }),
      ...(d.verificado !== undefined && { verificado: d.verificado }),
      ...(d.ativo !== undefined && { ativo: d.ativo }),
    },
  });
}
