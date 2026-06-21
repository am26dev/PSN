import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { guardarFicheiro, lerFicheiro } from "@/lib/armazenamento";

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024; // 5 MB

/** Carregar/atualizar a foto de perfil. */
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

  const ficheiro = form.get("ficheiro");
  if (!(ficheiro instanceof File)) {
    return NextResponse.json({ erro: "Ficheiro em falta." }, { status: 422 });
  }
  if (!TIPOS.includes(ficheiro.type)) {
    return NextResponse.json({ erro: "Use JPEG, PNG ou WebP." }, { status: 422 });
  }
  if (ficheiro.size > MAX) {
    return NextResponse.json({ erro: "Imagem demasiado grande (máx. 5 MB)." }, { status: 422 });
  }

  const buffer = Buffer.from(await ficheiro.arrayBuffer());
  const key = await guardarFicheiro(buffer, ficheiro.type);

  await prisma.utente.update({ where: { id: utente.id }, data: { avatarKey: key } });
  return NextResponse.json({ ok: true });
}

/** Serve a foto de perfil do próprio utente. */
export async function GET() {
  const utente = await utenteAtual();
  if (!utente?.avatarKey) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const { buffer, contentType } = await lerFicheiro(utente.avatarKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
