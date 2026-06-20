import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registoSchema } from "@/lib/validacao";
import { criarHashPassword, criarSessao } from "@/lib/auth";

export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = registoSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const existe = await prisma.utente.findUnique({
    where: { numeroDocumento: d.numeroDocumento },
  });
  if (existe) {
    return NextResponse.json(
      { erro: "Já existe uma conta com este documento." },
      { status: 409 },
    );
  }

  const passwordHash = await criarHashPassword(d.password);

  // Promoção a administrador por configuração (lista de documentos em PSN_ADMIN_DOCS).
  const adminDocs = (process.env.PSN_ADMIN_DOCS ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  // O primeiro utente registado torna-se administrador (bootstrap sem
  // configuração); depois disso, só os documentos em PSN_ADMIN_DOCS.
  const ehPrimeiroUtente = (await prisma.utente.count()) === 0;
  const papel =
    ehPrimeiroUtente || adminDocs.includes(d.numeroDocumento) ? "ADMIN" : "UTENTE";

  const utente = await prisma.utente.create({
    data: {
      tipoDocumento: d.tipoDocumento,
      numeroDocumento: d.numeroDocumento,
      nomeCompleto: d.nomeCompleto,
      dataNascimento: new Date(d.dataNascimento),
      sexo: d.sexo,
      nacionalidade: d.tipoDocumento === "BI" ? "Angolana" : "Estrangeira",
      telefone: d.telefone || null,
      email: d.email || null,
      provincia: d.provincia || null,
      municipio: d.municipio || null,
      papel,
      passwordHash,
      fichaSaude: { create: {} },
    },
  });

  await criarSessao(utente.id, utente.papel, {
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true, redirect: "/conta" }, { status: 201 });
}
