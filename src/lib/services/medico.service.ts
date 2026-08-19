import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  consultaSchema,
  exameSchema,
  patologiaSchema,
} from "@/lib/validacao";
import { ServiceError } from "./http";
import type { Utente } from "@prisma/client";

export type ConsultaInput = z.infer<typeof consultaSchema>;
export type ExameInput = z.infer<typeof exameSchema>;
export type PatologiaInput = z.infer<typeof patologiaSchema>;

async function exigirPaciente(pacienteId: string): Promise<void> {
  const paciente = await prisma.utente.findUnique({ where: { id: pacienteId } });
  if (!paciente) throw new ServiceError(404, "Paciente não encontrado.");
}

/** Regista uma consulta realizada por um profissional de saúde. */
export async function registarConsulta(medico: Utente, d: ConsultaInput): Promise<void> {
  await exigirPaciente(d.pacienteId);
  await prisma.consulta.create({
    data: {
      pacienteId: d.pacienteId,
      profissionalId: medico.id,
      profissionalNome: medico.nomeCompleto,
      unidadeNome: d.unidadeNome || null,
      motivo: d.motivo || null,
      diagnostico: d.diagnostico || null,
      notas: d.notas || null,
    },
  });
}

/** Regista um exame clínico de um paciente. */
export async function registarExame(medico: Utente, d: ExameInput): Promise<void> {
  await exigirPaciente(d.pacienteId);
  await prisma.exame.create({
    data: {
      pacienteId: d.pacienteId,
      profissionalId: medico.id,
      profissionalNome: medico.nomeCompleto,
      nome: d.nome,
      resultado: d.resultado || null,
      notas: d.notas || null,
    },
  });
}

/** Regista uma patologia de um paciente. */
export async function registarPatologia(medico: Utente, d: PatologiaInput): Promise<void> {
  await exigirPaciente(d.pacienteId);
  await prisma.patologia.create({
    data: {
      pacienteId: d.pacienteId,
      profissionalId: medico.id,
      nome: d.nome,
      estado: d.estado ?? "ATIVA",
      desde: d.desde || null,
      notas: d.notas || null,
    },
  });
}

// ── Leituras de histórico ────────────────────────────────────────────────────

/** Consultas registadas para um paciente. */
export async function listarConsultasDoUtente(pacienteId: string) {
  return prisma.consulta.findMany({
    where: { pacienteId },
    orderBy: { data: "desc" },
  });
}

/** Exames registados para um paciente. */
export async function listarExamesDoUtente(pacienteId: string) {
  return prisma.exame.findMany({
    where: { pacienteId },
    orderBy: { data: "desc" },
  });
}

/** Patologias registadas para um paciente. */
export async function listarPatologiasDoUtente(pacienteId: string) {
  return prisma.patologia.findMany({
    where: { pacienteId },
    orderBy: { criadoEm: "desc" },
  });
}
