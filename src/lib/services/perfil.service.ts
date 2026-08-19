import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { perfilSchema } from "@/lib/validacao";
import { guardarFicheiro } from "@/lib/armazenamento";
import { ServiceError } from "./http";
import type { Utente } from "@prisma/client";

export type PerfilInput = z.infer<typeof perfilSchema>;

/** Atualiza os dados de perfil do próprio utente. */
export async function atualizarPerfil(utente: Utente, d: PerfilInput): Promise<void> {
  await prisma.utente.update({
    where: { id: utente.id },
    data: {
      ...(d.nomeCompleto !== undefined && { nomeCompleto: d.nomeCompleto }),
      ...(d.telefone !== undefined && { telefone: d.telefone || null }),
      ...(d.email !== undefined && { email: d.email || null }),
      ...(d.nif !== undefined && { nif: d.nif || null }),
      ...(d.morada !== undefined && { morada: d.morada || null }),
      ...(d.provincia !== undefined && { provincia: d.provincia || null }),
      ...(d.municipio !== undefined && { municipio: d.municipio || null }),
    },
  });
}

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024; // 5 MB

/** Carrega/atualiza a foto de perfil do utente (imagem cifrada). */
export async function uploadFoto(utente: Utente, ficheiro: File): Promise<void> {
  if (!TIPOS.includes(ficheiro.type)) {
    throw new ServiceError(422, "Use JPEG, PNG ou WebP.");
  }
  if (ficheiro.size > MAX) {
    throw new ServiceError(422, "Imagem demasiado grande (máx. 5 MB).");
  }
  const buffer = Buffer.from(await ficheiro.arrayBuffer());
  const key = await guardarFicheiro(buffer, ficheiro.type);
  await prisma.utente.update({ where: { id: utente.id }, data: { avatarKey: key } });
}
