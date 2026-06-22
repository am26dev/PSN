import { NextResponse } from "next/server";
import { utenteAtual } from "@/lib/auth";
import { guardarFicheiroPublico } from "@/lib/armazenamento";

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX = 5 * 1024 * 1024; // 5 MB

/** Upload de imagem pública (logótipos/banners de unidades). Admin. */
export async function POST(req: Request) {
  const admin = await utenteAtual();
  if (!admin || admin.papel !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso reservado à administração." }, { status: 403 });
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
    return NextResponse.json({ erro: "Use JPEG, PNG, WebP ou SVG." }, { status: 422 });
  }
  if (ficheiro.size > MAX) {
    return NextResponse.json({ erro: "Imagem demasiado grande (máx. 5 MB)." }, { status: 422 });
  }

  const buffer = Buffer.from(await ficheiro.arrayBuffer());
  const key = await guardarFicheiroPublico(buffer, ficheiro.type);

  return NextResponse.json({ ok: true, url: `/api/ficheiros/${key}` });
}
