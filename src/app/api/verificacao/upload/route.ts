import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { guardarFicheiro } from "@/lib/armazenamento";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAX = 8 * 1024 * 1024; // 8 MB

const CAMPO_POR_TIPO: Record<string, "imagemFrenteKey" | "imagemVersoKey" | "selfieKey"> = {
  FRENTE: "imagemFrenteKey",
  VERSO: "imagemVersoKey",
  SELFIE: "selfieKey",
};

export async function POST(req: Request) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }

  const verificacaoId = String(form.get("verificacaoId") ?? "");
  const tipo = String(form.get("tipo") ?? "").toUpperCase();
  const ficheiro = form.get("ficheiro");

  const campo = CAMPO_POR_TIPO[tipo];
  if (!campo) {
    return NextResponse.json({ erro: "Tipo de imagem inválido." }, { status: 422 });
  }
  if (!(ficheiro instanceof File)) {
    return NextResponse.json({ erro: "Ficheiro em falta." }, { status: 422 });
  }
  if (!TIPOS_PERMITIDOS.includes(ficheiro.type)) {
    return NextResponse.json(
      { erro: "Formato não suportado. Use JPEG, PNG ou WebP." },
      { status: 422 },
    );
  }
  if (ficheiro.size > TAMANHO_MAX) {
    return NextResponse.json(
      { erro: "Imagem demasiado grande (máx. 8 MB)." },
      { status: 422 },
    );
  }

  // A verificação tem de pertencer ao utente e estar ainda editável.
  const verificacao = await prisma.verificacao.findFirst({
    where: { id: verificacaoId, utenteId: utente.id },
  });
  if (!verificacao) {
    return NextResponse.json({ erro: "Verificação não encontrada." }, { status: 404 });
  }
  if (verificacao.estado !== "PENDENTE") {
    return NextResponse.json(
      { erro: "Esta verificação já foi submetida." },
      { status: 409 },
    );
  }

  const buffer = Buffer.from(await ficheiro.arrayBuffer());
  const key = await guardarFicheiro(buffer, ficheiro.type);

  await prisma.verificacao.update({
    where: { id: verificacao.id },
    data: { [campo]: key },
  });

  return NextResponse.json({ ok: true, key });
}
