import { NextResponse } from "next/server";
import { lerFicheiroPublico } from "@/lib/armazenamento";

/**
 * Serve um ficheiro PÚBLICO (logótipo/banner de unidade).
 * Sem autenticação — são imagens públicas. Lê apenas do armazenamento público,
 * pelo que nunca acede a ficheiros sensíveis (cifrados).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  try {
    const { buffer, contentType } = await lerFicheiroPublico(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
