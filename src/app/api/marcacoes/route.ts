import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { marcacaoSchema } from "@/lib/validacao";
import { precoConsulta } from "@/lib/precos";
import { iniciarCobranca, dadosPagamentoDaCobranca } from "@/lib/pagamentos/cobranca";

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

  const r = marcacaoSchema.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json(
      { erro: r.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 422 },
    );
  }
  const d = r.data;

  const unidade = await prisma.unidade.findUnique({ where: { id: d.unidadeId } });
  if (!unidade || !unidade.ativo) {
    return NextResponse.json({ erro: "Unidade não encontrada." }, { status: 404 });
  }

  // Se for para um dependente, confirma que pertence ao agregado deste utente.
  if (d.dependenteId) {
    const dep = await prisma.dependente.findFirst({
      where: { id: d.dependenteId, responsavelId: utente.id },
    });
    if (!dep) {
      return NextResponse.json({ erro: "Dependente inválido." }, { status: 403 });
    }
  }

  const data = new Date(d.dataHora);
  if (data.getTime() < Date.now()) {
    return NextResponse.json(
      { erro: "A data da consulta tem de ser no futuro." },
      { status: 422 },
    );
  }

  // O seguro só é aceite se o utente tiver seguradora associada.
  if (d.metodoPagamento === "SEGURO_SAUDE" && !utente.seguradoraId) {
    return NextResponse.json(
      { erro: "Não tem um seguro de saúde associado à sua conta." },
      { status: 422 },
    );
  }

  // A cobrança Multicaixa Express precisa de um telemóvel.
  const telefone = d.telefone || utente.telefone || undefined;
  if (d.metodoPagamento === "MULTICAIXA_EXPRESS" && !telefone) {
    return NextResponse.json(
      { erro: "Indique o telemóvel para a cobrança Multicaixa Express." },
      { status: 422 },
    );
  }

  const valor = precoConsulta(unidade.tipo);
  const isento = d.metodoPagamento === "SEGURO_SAUDE";

  // 1) Cria a marcação e o pagamento (a aguardar / isento).
  const marcacao = await prisma.marcacao.create({
    data: {
      utenteId: utente.id,
      dependenteId: d.dependenteId ?? null,
      unidadeId: d.unidadeId,
      especialidadeId: d.especialidadeId ?? null,
      medicoId: d.medicoId ?? null,
      dataHora: data,
      motivo: d.motivo ?? null,
      referenciaMedica: d.referenciaMedica ?? null,
      estado: "PENDENTE",
      pagamento: {
        create: {
          metodo: d.metodoPagamento,
          valorCentimos: valor,
          estado: isento ? "ISENTO" : "AGUARDA",
        },
      },
    },
    include: { pagamento: true },
  });

  // 2) Para os canais Pay4all, inicia a cobrança e guarda a referência/QR.
  let pagamentoInfo: Record<string, unknown> = {
    metodo: d.metodoPagamento,
    valorCentimos: valor,
    estado: marcacao.pagamento?.estado,
  };

  if (!isento && marcacao.pagamento) {
    try {
      const resultado = await iniciarCobranca(d.metodoPagamento, {
        valorCentimos: valor,
        referenciaInterna: marcacao.pagamento.id,
        telefone,
        descricao: `Consulta — ${unidade.nome}`,
      });
      if (resultado) {
        const pagamento = await prisma.pagamento.update({
          where: { id: marcacao.pagamento.id },
          data: dadosPagamentoDaCobranca(resultado),
        });
        pagamentoInfo = {
          metodo: pagamento.metodo,
          valorCentimos: pagamento.valorCentimos,
          estado: pagamento.estado,
          entidade: pagamento.entidade,
          referenciaEmis: pagamento.referenciaEmis,
          qrCode: pagamento.qrCode,
          expiraEm: pagamento.expiraEm,
          modoSimulado: !resultado.configurado,
        };
      }
    } catch (e) {
      // A marcação fica criada; o pagamento continua a aguardar e pode ser
      // reiniciado. Não falha a marcação por causa do gateway.
      console.error("Falha ao iniciar cobrança Pay4all:", e);
    }
  }

  return NextResponse.json(
    { ok: true, id: marcacao.id, pagamento: pagamentoInfo },
    { status: 201 },
  );
}
