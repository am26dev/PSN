import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { iniciarVerificacaoSchema } from "@/lib/validacao";
import { normalizarDocumento } from "@/lib/documento";

export async function POST(req: Request) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const r = iniciarVerificacaoSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  // Já existe uma verificação aprovada? Não permite duplicar.
  const aprovada = await prisma.verificacao.findFirst({
    where: { utenteId: utente.id, estado: "APROVADO" },
  });
  if (aprovada) {
    return NextResponse.json(
      { erro: "A sua identidade já está verificada." },
      { status: 409 },
    );
  }

  // Reaproveita uma verificação ainda em preenchimento, se existir.
  const pendente = await prisma.verificacao.findFirst({
    where: { utenteId: utente.id, estado: "PENDENTE" },
  });

  const dados = {
    tipoDocumento: d.tipoDocumento,
    numeroDocumento: normalizarDocumento(d.numeroDocumento),
    nomeCompleto: d.nomeCompleto,
    dataNascimento: d.dataNascimento || null,
    nacionalidade: d.nacionalidade || (d.tipoDocumento === "BI" ? "Angolana" : null),
  };

  const verificacao = pendente
    ? await prisma.verificacao.update({ where: { id: pendente.id }, data: dados })
    : await prisma.verificacao.create({
        data: {
          utenteId: utente.id,
          ...dados,
          eventos: { create: { evento: "VERIFICACAO_INICIADA" } },
        },
      });

  return NextResponse.json({ ok: true, id: verificacao.id }, { status: 201 });
}
