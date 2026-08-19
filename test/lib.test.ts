import { test } from "node:test";
import assert from "node:assert/strict";

import { formatarKz, kwanzasParaCentimos } from "@/lib/moeda";
import { precoConsulta } from "@/lib/precos";
import {
  normalizarDocumento,
  validarBI,
  validarPassaporte,
  nomeProvincia,
  provinciaDoBI,
} from "@/lib/documento";
import {
  verificarAssinaturaWebhook,
  mapearEstadoPay4all,
  estaConfigurado,
} from "@/lib/pagamentos/pay4all";
import { guardarFicheiro, lerFicheiro } from "@/lib/armazenamento";
import {
  loginSchema,
  marcacaoSchema,
  unidadeSchema,
  perfilSchema,
} from "@/lib/validacao";

// ── moeda ────────────────────────────────────────────────────────────────────
test("moeda: formatarKz formata cêntimos em Kz", () => {
  assert.match(formatarKz(12345), /^123,45.*Kz$/);
  assert.match(formatarKz(0), /^0,00.*Kz$/);
  assert.match(formatarKz(500), /^5,00.*Kz$/);
});

test("moeda: kwanzasParaCentimos arredonda para inteiro", () => {
  assert.equal(kwanzasParaCentimos(123.45), 12345);
  assert.equal(kwanzasParaCentimos(0), 0);
});

// ── precos ───────────────────────────────────────────────────────────────────
test("precos: precoConsulta devolve valor positivo para tipos conhecidos", () => {
  const valorPub = precoConsulta("HOSPITAL_PUBLICO" as never);
  const valorPriv = precoConsulta("CLINICA_PRIVADA" as never);
  assert.ok(valorPub > 0);
  assert.ok(valorPriv > 0);
});

// ── documento ─────────────────────────────────────────────────────────────────
test("documento: normalizarDocumento remove espaços e passa a maiúsculas", () => {
  assert.equal(normalizarDocumento("  abc-123  "), "ABC-123");
  assert.equal(normalizarDocumento("003.456.789LA042"), "003.456.789LA042");
});

test("documento: validarBI aceita formato válido e rejeita inválido", () => {
  assert.equal(validarBI("003456789LA042"), true);
  assert.equal(validarBI("123"), false);
  assert.equal(validarBI("003456789LA042X"), false);
});

test("documento: validarPassaporte aceita formato válido", () => {
  assert.equal(validarPassaporte("A1234567"), true);
  assert.equal(validarPassaporte("123"), false);
});

test("documento: provinciaDoBI extrai província do BI", () => {
  assert.equal(provinciaDoBI("003456789LA042"), "Luanda");
});

test("documento: nomeProvincia mapeia código/nome para nome canónico", () => {
  assert.equal(nomeProvincia("LA"), "Luanda");
  assert.equal(nomeProvincia("luanda"), "Luanda");
  assert.equal(nomeProvincia("XYZ"), "XYZ");
  assert.equal(nomeProvincia(null), undefined);
});

// ── pay4all (webhook segurança) ────────────────────────────────────────────────
test("pay4all: assinatura de webhook correta é aceite", () => {
  process.env.PAY4ALL_WEBHOOK_SECRET = "segredo-partilhado-test-32caracteres!";
  const corpo = '{"estado":"PAGO"}';
  const crypto = require("crypto");
  const assinatura = crypto
    .createHmac("sha256", process.env.PAY4ALL_WEBHOOK_SECRET)
    .update(corpo)
    .digest("hex");
  assert.equal(verificarAssinaturaWebhook(corpo, assinatura), true);
});

test("pay4all: assinatura alterada é rejeitada", () => {
  process.env.PAY4ALL_WEBHOOK_SECRET = "segredo-partilhado-test-32caracteres!";
  assert.equal(verificarAssinaturaWebhook('{"a":1}', "deadbeef"), false);
});

test("pay4all: sem secreto configurado rejeita sempre", () => {
  process.env.PAY4ALL_WEBHOOK_SECRET = "";
  assert.equal(verificarAssinaturaWebhook('{"a":1}', "x"), false);
});

test("pay4all: mapearEstadoPay4all normaliza estados", () => {
  assert.equal(mapearEstadoPay4all("PROCESSADA"), "PAGO");
  assert.equal(mapearEstadoPay4all("EXPIRADA"), "EXPIRADO");
  assert.equal(mapearEstadoPay4all("FALHADA"), "FALHADO");
  assert.equal(mapearEstadoPay4all("desconhecido"), "AGUARDA");
});

test("pay4all: estaConfigurado reflete ausência de credenciais", () => {
  process.env.PAY4ALL_API_URL = "";
  process.env.PAY4ALL_API_KEY = "";
  assert.equal(estaConfigurado(), false);
});

// ── armazenamento (cifra em repouso + ausência de path traversal) ─────────────
test("armazenamento: roundtrip cifrar/decifrar preserva conteúdo e tipo", async () => {
  process.env.STORAGE_SECRET = "chave-cifragem-test-32caracteres-minimos!";
  process.env.STORAGE_DIR = "/tmp/psn_test_uploads";
  const original = Buffer.from("dados-sensiveis-KYC");
  const key = await guardarFicheiro(original, "image/jpeg");
  assert.match(key, /^[a-f0-9-]{36}$/);
  const { buffer, contentType } = await lerFicheiro(key);
  assert.equal(buffer.toString("utf8"), "dados-sensiveis-KYC");
  assert.equal(contentType, "image/jpeg");
});

test("armazenamento: chave não-UUID é rejeitada (sem path traversal)", async () => {
  process.env.STORAGE_SECRET = "chave-cifragem-test-32caracteres-minimos!";
  process.env.STORAGE_DIR = "/tmp/psn_test_uploads";
  await assert.rejects(() => lerFicheiro("../../etc/passwd"), /inválida/);
});

// ── validacao (esquemas zod) ──────────────────────────────────────────────────
test("validacao: loginSchema valida documento e palavra-passe", () => {
  assert.ok(loginSchema.safeParse({ numeroDocumento: "003456789LA042", password: "Secreta123" }).success);
  assert.equal(loginSchema.safeParse({ numeroDocumento: "", password: "x" }).success, false);
});

test("validacao: unidadeSchema valida URL de logótipo e campos obrigatórios", () => {
  assert.ok(
    unidadeSchema.safeParse({
      nome: "Hospital de Luanda",
      tipo: "HOSPITAL_PUBLICO",
      provincia: "Luanda",
      municipio: "Luanda",
    }).success,
  );
  // URL de logótipo com protocolo estranho é rejeitada.
  assert.equal(
    unidadeSchema.safeParse({
      nome: "X",
      tipo: "FARMACIA",
      provincia: "Luanda",
      municipio: "Luanda",
      logoUrl: "javascript:alert(1)",
    }).success,
    false,
  );
});

test("validacao: perfilSchema aceita email vazio e rejeita email inválido", () => {
  assert.ok(perfilSchema.safeParse({ nomeCompleto: "Ana Silva", email: "" }).success);
  assert.equal(perfilSchema.safeParse({ email: "nao-email" }).success, false);
});

test("validacao: marcacaoSchema exige campos obrigatórios", () => {
  assert.ok(
    marcacaoSchema.safeParse({
      unidadeId: "abc",
      dataHora: "2030-01-01T10:00:00.000Z",
      metodoPagamento: "REFERENCIA_EMIS",
    }).success,
  );
  assert.equal(marcacaoSchema.safeParse({ unidadeId: "abc" }).success, false);
});
