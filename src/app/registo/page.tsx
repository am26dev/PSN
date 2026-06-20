"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROVINCIAS_ANGOLA } from "@/lib/validacao";

type Tipo = "BI" | "PASSAPORTE";

export default function RegistoPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("BI");
  const [aCarregarSiac, setACarregarSiac] = useState(false);
  const [avisoSiac, setAvisoSiac] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aSubmeter, setASubmeter] = useState(false);
  const [form, setForm] = useState({
    numeroDocumento: "",
    nomeCompleto: "",
    dataNascimento: "",
    sexo: "MASCULINO",
    telefone: "",
    email: "",
    provincia: "",
    municipio: "",
    password: "",
  });

  function atualizar(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function buscarNoSiac() {
    setAvisoSiac(null);
    setErro(null);
    if (tipo !== "BI") return;
    setACarregarSiac(true);
    try {
      const res = await fetch(
        `/api/identidade/consultar?numero=${encodeURIComponent(form.numeroDocumento)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível validar o BI.");
        return;
      }
      if (data.dados?.provincia) {
        setForm((f) => ({ ...f, provincia: data.dados.provincia }));
      }
      if (data.dados?.municipio) {
        setForm((f) => ({ ...f, municipio: data.dados.municipio }));
      }
      if (data.disponivel && data.dados?.nomeCompleto) {
        setForm((f) => ({ ...f, nomeCompleto: data.dados.nomeCompleto }));
      }
      if (data.aviso) setAvisoSiac(data.aviso);
    } catch {
      setErro("Falha de ligação ao validar o BI.");
    } finally {
      setACarregarSiac(false);
    }
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setASubmeter(true);
    try {
      const res = await fetch("/api/auth/registo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoDocumento: tipo, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível criar a conta.");
        return;
      }
      router.push(data.redirect ?? "/conta");
      router.refresh();
    } catch {
      setErro("Falha de ligação. Tente novamente.");
    } finally {
      setASubmeter(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Criar conta de Utente</h1>
      <p className="mt-2 text-gray-600">
        Cidadãos angolanos usam o Bilhete de Identidade. Cidadãos estrangeiros
        usam o Passaporte.
      </p>

      <div className="mt-6 inline-flex rounded-xl border border-base-line bg-white p-1">
        {(["BI", "PASSAPORTE"] as Tipo[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tipo === t
                ? "bg-angola-red text-white"
                : "text-angola-black hover:bg-base-muted"
            }`}
          >
            {t === "BI" ? "Bilhete de Identidade" : "Passaporte"}
          </button>
        ))}
      </div>

      <form onSubmit={submeter} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label">
            {tipo === "BI" ? "Número do Bilhete de Identidade" : "Número do Passaporte"}
          </label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder={tipo === "BI" ? "003456789LA042" : "N1234567"}
              value={form.numeroDocumento}
              onChange={(e) => atualizar("numeroDocumento", e.target.value.toUpperCase())}
              required
            />
            {tipo === "BI" && (
              <button
                type="button"
                onClick={buscarNoSiac}
                disabled={aCarregarSiac || form.numeroDocumento.length < 14}
                className="btn-ghost whitespace-nowrap py-3"
              >
                {aCarregarSiac ? "A validar…" : "Carregar dados"}
              </button>
            )}
          </div>
          {avisoSiac && (
            <p className="mt-2 text-xs text-angola-red-dark">{avisoSiac}</p>
          )}
        </div>

        <div>
          <label className="label">Nome completo</label>
          <input
            className="input"
            value={form.nomeCompleto}
            onChange={(e) => atualizar("nomeCompleto", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Data de nascimento</label>
            <input
              type="date"
              className="input"
              value={form.dataNascimento}
              onChange={(e) => atualizar("dataNascimento", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Sexo</label>
            <select
              className="input"
              value={form.sexo}
              onChange={(e) => atualizar("sexo", e.target.value)}
            >
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Telefone</label>
            <input
              className="input"
              placeholder="+244 9XX XXX XXX"
              value={form.telefone}
              onChange={(e) => atualizar("telefone", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email (opcional)</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => atualizar("email", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Província</label>
            <select
              className="input"
              value={form.provincia}
              onChange={(e) => atualizar("provincia", e.target.value)}
            >
              <option value="">Selecione…</option>
              {PROVINCIAS_ANGOLA.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Município</label>
            <input
              className="input"
              value={form.municipio}
              onChange={(e) => atualizar("municipio", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Palavra-passe</label>
          <input
            type="password"
            className="input"
            placeholder="Mínimo 8 caracteres, com maiúscula, minúscula e número"
            value={form.password}
            onChange={(e) => atualizar("password", e.target.value)}
            required
          />
        </div>

        {erro && (
          <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
            {erro}
          </p>
        )}

        <button type="submit" disabled={aSubmeter} className="btn-primary w-full">
          {aSubmeter ? "A criar conta…" : "Criar conta"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-semibold text-angola-red">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
