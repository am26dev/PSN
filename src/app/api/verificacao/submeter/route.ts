import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { analisarVerificacao } from "@/lib/verificacao/analise";

export async function POST(req: Request) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  let corpo: { verificacaoId?: string };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const verificacao = await prisma.verificacao.findFirst({
    where: { id: corpo.verificacaoId, utenteId: utente.id },
  });
  if (!verificacao) {
    return NextResponse.json({ erro: "Verificação não encontrada." }, { status: 404 });
  }
  if (verificacao.estado !== "PENDENTE") {
    return NextResponse.json({ erro: "Já submetida." }, { status: 409 });
  }

  // Documento (frente) e selfie são obrigatórios; o verso depende do tipo.
  const exigeVerso = verificacao.tipoDocumento !== "PASSAPORTE";
  if (!verificacao.imagemFrenteKey || !verificacao.selfieKey) {
    return NextResponse.json(
      { erro: "Falta a imagem do documento ou a selfie." },
      { status: 422 },
    );
  }
  if (exigeVerso && !verificacao.imagemVersoKey) {
    return NextResponse.json(
      { erro: "Falta a imagem do verso do documento." },
      { status: 422 },
    );
  }

  const analise = await analisarVerificacao({
    tipoDocumento: verificacao.tipoDocumento,
    numeroDocumento: verificacao.numeroDocumento,
    temFrente: !!verificacao.imagemFrenteKey,
    temVerso: !!verificacao.imagemVersoKey,
    temSelfie: !!verificacao.selfieKey,
  });

  const atualizada = await prisma.verificacao.update({
    where: { id: verificacao.id },
    data: {
      estado: analise.estadoSugerido,
      ocrDados: analise.ocrDados,
      resultadoBiometria: analise.resultadoBiometria,
      pontuacaoRisco: analise.pontuacaoRisco,
      eventos: {
        create: {
          evento: "VERIFICACAO_SUBMETIDA",
          metadata: {
            automatica: analise.automatica,
            pontuacaoRisco: analise.pontuacaoRisco,
          },
        },
      },
    },
  });

  // TODO (encaixe): notificar a administração de que há nova verificação a rever.

  return NextResponse.json({ ok: true, estado: atualizada.estado });
}
