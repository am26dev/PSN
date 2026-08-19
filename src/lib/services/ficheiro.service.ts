import "server-only";
import { guardarFicheiroPublico } from "@/lib/armazenamento";
import { ServiceError } from "./http";

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX = 5 * 1024 * 1024; // 5 MB

/** Guarda uma imagem pública (logótipos/banners). Apenas administração. */
export async function guardarPublico(ficheiro: File): Promise<{ url: string }> {
  if (!(ficheiro instanceof File)) throw new ServiceError(422, "Ficheiro em falta.");
  if (!TIPOS.includes(ficheiro.type)) {
    throw new ServiceError(422, "Use JPEG, PNG, WebP ou SVG.");
  }
  if (ficheiro.size > MAX) {
    throw new ServiceError(422, "Imagem demasiado grande (máx. 5 MB).");
  }
  const buffer = Buffer.from(await ficheiro.arrayBuffer());
  const key = await guardarFicheiroPublico(buffer, ficheiro.type);
  return { url: `/api/ficheiros/${key}` };
}
