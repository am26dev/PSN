import "server-only";
import { prisma } from "@/lib/prisma";
import { criarHashPassword, criarSessao, verificarPassword } from "@/lib/auth";
import { normalizarDocumento } from "@/lib/documento";
import type { RegistoInput, LoginInput } from "@/lib/validacao";
import { ServiceError } from "./http";
import type { Papel, Utente } from "@prisma/client";

/** Regista um novo utente e inicia sessão. Devolve o utente criado. */
export async function registarUtente(
  d: RegistoInput,
  userAgent?: string,
): Promise<Utente> {
  const numeroDocumento = normalizarDocumento(d.numeroDocumento);
  const existe = await prisma.utente.findUnique({ where: { numeroDocumento } });
  if (existe) {
    throw new ServiceError(409, "Já existe uma conta com este documento.");
  }

  const adminDocs = (process.env.PSN_ADMIN_DOCS ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const papel: Papel =
    adminDocs.includes(numeroDocumento) ? "ADMIN" : "UTENTE";

  const passwordHash = await criarHashPassword(d.password);
  const utente = await prisma.utente.create({
    data: {
      tipoDocumento: d.tipoDocumento,
      numeroDocumento,
      nomeCompleto: d.nomeCompleto,
      dataNascimento: new Date(d.dataNascimento),
      sexo: d.sexo,
      nacionalidade: d.tipoDocumento === "BI" ? "Angolana" : "Estrangeira",
      telefone: d.telefone || null,
      email: d.email || null,
      nif: d.nif || null,
      morada: d.morada || null,
      provincia: d.provincia || null,
      municipio: d.municipio || null,
      papel,
      passwordHash,
      fichaSaude: { create: {} },
    },
  });
  await criarSessao(utente.id, utente.papel, { userAgent });
  return utente;
}

/** Autentica um utente (documento + palavra-passe) e inicia sessão. */
export async function autenticar(
  d: LoginInput,
  userAgent?: string,
): Promise<Utente> {
  const numeroDocumento = normalizarDocumento(d.numeroDocumento);
  const utente = await prisma.utente.findUnique({ where: { numeroDocumento } });
  if (!utente || !utente.ativo) {
    throw new ServiceError(401, "Documento ou palavra-passe incorretos.");
  }
  const ok = await verificarPassword(utente.passwordHash, d.password);
  if (!ok) {
    throw new ServiceError(401, "Documento ou palavra-passe incorretos.");
  }
  await criarSessao(utente.id, utente.papel, { userAgent });
  return utente;
}
