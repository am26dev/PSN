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
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * Armazenamento de ficheiros sensíveis (imagens de documento e selfie da
 * verificação de identidade).
 *
 * Princípios:
 *  - O ficheiro NUNCA é guardado em claro: é cifrado com AES-256-GCM em repouso
 *    (dados biométricos são dados especialmente sensíveis — Lei n.º 22/11).
 *  - O acesso é sempre mediado por uma rota protegida (sessão + permissão); não
 *    há URL pública para os documentos.
 *  - `STORAGE_DRIVER=s3` usa AWS S3 / Cloudflare R2 / MinIO (S3-compatible).
 *    Por omissão usa o sistema de ficheiros local (cifrado).
 */

const DRIVER = process.env.STORAGE_DRIVER ?? "local";
const DIR_LOCAL = process.env.STORAGE_DIR ?? join(process.cwd(), ".uploads");
const DIR_PUBLICO = join(DIR_LOCAL, "publico");

// ── S3 Configuration ────────────────────────────────────────────────────────

const S3_BUCKET = process.env.STORAGE_S3_BUCKET ?? "";
const S3_REGION = process.env.STORAGE_S3_REGION ?? "auto";
const S3_ENDPOINT = process.env.STORAGE_S3_ENDPOINT ?? undefined;
const S3_ACCESS_KEY = process.env.STORAGE_S3_ACCESS_KEY_ID ?? "";
const S3_SECRET_KEY = process.env.STORAGE_S3_SECRET_ACCESS_KEY ?? "";

let _s3: S3Client | null = null;

function s3Client(): S3Client {
  if (!_s3) {
    if (!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
      throw new Error(
        "STORAGE_S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY em falta.",
      );
    }
    _s3 = new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    });
  }
  return _s3;
}

// ── Cifragem local (sensível) ───────────────────────────────────────────────

function chave(): Buffer {
  const segredo =
    process.env.STORAGE_SECRET || process.env.SESSION_SECRET || "";
  if (segredo.length < 32) {
    throw new Error(
      "STORAGE_SECRET/SESSION_SECRET em falta ou demasiado curto para cifrar ficheiros.",
    );
  }
  return scryptSync(segredo, "psn-armazenamento-v1", 32);
}

function cifrar(conteudo: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", chave(), iv);
  const enc = Buffer.concat([cipher.update(conteudo), cipher.final()]);
  const tag = cipher.getAuthTag();
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

// ── Helpers S3 ──────────────────────────────────────────────────────────────

async function s3Upload(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3Client().send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function s3Download(key: string): Promise<Buffer> {
  const res = await s3Client().send(
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
  );
  const stream = res.Body;
  if (!stream) throw new Error("Ficheiro vazio no S3.");
  const chunks: Uint8Array[] = [];
  const reader = stream.transformToWebStream().getReader();
  let done = false;
  while (!done) {
    const result = await reader.read();
    done = result.done;
    if (result.value) chunks.push(result.value);
  }
  return Buffer.concat(chunks);
}

// ── API pública ─────────────────────────────────────────────────────────────

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
  const payload = Buffer.from(
    JSON.stringify({ contentType, dados: conteudo.toString("base64") }),
    "utf8",
  );
  const cifrado = cifrar(payload);

  if (DRIVER === "s3") {
    await s3Upload(`sensivel/${key}`, cifrado, "application/octet-stream");
  } else {
    await mkdir(DIR_LOCAL, { recursive: true });
    await writeFile(join(DIR_LOCAL, key), cifrado);
  }
  return key;
}

/** Lê e decifra um ficheiro previamente guardado. */
export async function lerFicheiro(key: string): Promise<FicheiroGuardado> {
  if (!/^[a-f0-9-]{36}$/.test(key)) {
    throw new Error("Chave de ficheiro inválida.");
  }

  let cifrado: Buffer;
  if (DRIVER === "s3") {
    cifrado = await s3Download(`sensivel/${key}`);
  } else {
    cifrado = await readFile(join(DIR_LOCAL, key));
  }

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
  const key = randomUUID();

  if (DRIVER === "s3") {
    await s3Upload(`publico/${key}`, conteudo, contentType);
  } else {
    await mkdir(DIR_PUBLICO, { recursive: true });
    await writeFile(join(DIR_PUBLICO, key), conteudo);
    await writeFile(join(DIR_PUBLICO, `${key}.type`), contentType, "utf8");
  }
  return key;
}

/** Lê um ficheiro público previamente guardado. */
export async function lerFicheiroPublico(key: string): Promise<FicheiroGuardado> {
  if (!/^[a-f0-9-]{36}$/.test(key)) {
    throw new Error("Chave de ficheiro inválida.");
  }

  if (DRIVER === "s3") {
    const buffer = await s3Download(`publico/${key}`);
    return { buffer, contentType: "application/octet-stream" };
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
