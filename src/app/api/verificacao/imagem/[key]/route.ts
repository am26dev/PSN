import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { lerFicheiro } from "@/lib/armazenamento";

/**
 * Serve uma imagem de verificação de forma protegida.
 * Apenas o dono da verificação ou um administrador podem aceder. Os documentos
 * nunca têm URL pública.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const utente = await utenteAtual();
  if (!utente) {
    return NextResponse.json({ erro: "Sessão necessária." }, { status: 401 });
  }

  const { key } = await params;

  // A chave tem de pertencer a alguma verificação.
  const verificacao = await prisma.verificacao.findFirst({
    where: {
      OR: [
        { imagemFrenteKey: key },
        { imagemVersoKey: key },
        { selfieKey: key },
      ],
    },
    select: { utenteId: true },
  });

  if (!verificacao) {
    return NextResponse.json({ erro: "Imagem não encontrada." }, { status: 404 });
  }

  const ehDono = verificacao.utenteId === utente.id;
  const ehAdmin = utente.papel === "ADMIN";
  if (!ehDono && !ehAdmin) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  try {
    const { buffer, contentType } = await lerFicheiro(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ erro: "Falha ao ler a imagem." }, { status: 500 });
  }
}
