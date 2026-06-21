import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
  scryptSync,
} from "crypto";

/**
 * Armazenamento de ficheiros sensíveis (imagens de documento e selfie da
 * verificação de identidade).
 *
 * Princípios:
 *  - O ficheiro NUNCA é guardado em claro: é cifrado com AES-256-GCM em repouso
 *    (dados biométricos são dados especialmente sensíveis — Lei n.º 22/11).
 *  - O acesso é sempre mediado por uma rota protegida (sessão + permissão); não
 *    há URL pública para os documentos.
 *  - `STORAGE_DRIVER=s3` fica preparado como encaixe para produção (S3 + URLs
 *    assinadas). Por omissão usa o sistema de ficheiros local (cifrado).
 */

const DRIVER = process.env.STORAGE_DRIVER ?? "local";
const DIR_LOCAL = process.env.STORAGE_DIR ?? join(process.cwd(), ".uploads");
// Ficheiros PÚBLICOS (ex.: logótipos/banners de unidades) — não cifrados,
// guardados à parte dos ficheiros sensíveis para nunca haver acesso cruzado.
const DIR_PUBLICO = join(DIR_LOCAL, "publico");

function chave(): Buffer {
  const segredo =
    process.env.STORAGE_SECRET || process.env.SESSION_SECRET || "";
  if (segredo.length < 32) {
    throw new Error(
      "STORAGE_SECRET/SESSION_SECRET em falta ou demasiado curto para cifrar ficheiros.",
    );
  }
  // Deriva uma chave de 32 bytes determinística a partir do segredo.
  return scryptSync(segredo, "psn-armazenamento-v1", 32);
}

function cifrar(conteudo: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", chave(), iv);
  const enc = Buffer.concat([cipher.update(conteudo), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Estrutura: [IV(12)][TAG(16)][CIFRADO]
  return Buffer.concat([iv, tag, enc]);
}

function decifrar(envelope: Buffer): Buffer {
  const iv = envelope.subarray(0, 12);
  const tag = envelope.subarray(12, 28);
  const enc = envelope.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", chave(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

export interface FicheiroGuardado {
  buffer: Buffer;
  contentType: string;
}

/** Guarda um ficheiro cifrado e devolve a sua chave de acesso. */
export async function guardarFicheiro(
  conteudo: Buffer,
  contentType: string,
): Promise<string> {
  const key = randomUUID();
  // Envelope com o tipo de conteúdo + dados, tudo cifrado em conjunto.
  const payload = Buffer.from(
    JSON.stringify({ contentType, dados: conteudo.toString("base64") }),
    "utf8",
  );
  const cifrado = cifrar(payload);

  if (DRIVER === "s3") {
    throw new Error(
      "STORAGE_DRIVER=s3 ainda não implementado — configure o encaixe S3.",
    );
  }

  await mkdir(DIR_LOCAL, { recursive: true });
  await writeFile(join(DIR_LOCAL, key), cifrado);
  return key;
}

/** Lê e decifra um ficheiro previamente guardado. */
export async function lerFicheiro(key: string): Promise<FicheiroGuardado> {
  // Impede travessia de diretórios — a chave é sempre um UUID.
  if (!/^[a-f0-9-]{36}$/.test(key)) {
    throw new Error("Chave de ficheiro inválida.");
  }

  if (DRIVER === "s3") {
    throw new Error(
      "STORAGE_DRIVER=s3 ainda não implementado — configure o encaixe S3.",
    );
  }

  const cifrado = await readFile(join(DIR_LOCAL, key));
  const payload = JSON.parse(decifrar(cifrado).toString("utf8")) as {
    contentType: string;
    dados: string;
  };
  return {
    buffer: Buffer.from(payload.dados, "base64"),
    contentType: payload.contentType,
  };
}

// ── Ficheiros públicos (imagens de unidades) ─────────────────────────────────

/** Guarda um ficheiro PÚBLICO (não cifrado) e devolve a sua chave. */
export async function guardarFicheiroPublico(
  conteudo: Buffer,
  contentType: string,
): Promise<string> {
  if (DRIVER === "s3") {
    throw new Error("STORAGE_DRIVER=s3 ainda não implementado.");
  }
  const key = randomUUID();
  await mkdir(DIR_PUBLICO, { recursive: true });
  await writeFile(join(DIR_PUBLICO, key), conteudo);
  await writeFile(join(DIR_PUBLICO, `${key}.type`), contentType, "utf8");
  return key;
}

/** Lê um ficheiro público previamente guardado. */
export async function lerFicheiroPublico(key: string): Promise<FicheiroGuardado> {
  if (!/^[a-f0-9-]{36}$/.test(key)) {
    throw new Error("Chave de ficheiro inválida.");
  }
  if (DRIVER === "s3") {
    throw new Error("STORAGE_DRIVER=s3 ainda não implementado.");
  }
  const buffer = await readFile(join(DIR_PUBLICO, key));
  let contentType = "application/octet-stream";
  try {
    contentType = (await readFile(join(DIR_PUBLICO, `${key}.type`), "utf8")).trim();
  } catch {
    /* sem sidecar — usa o tipo genérico */
  }
  return { buffer, contentType };
}
