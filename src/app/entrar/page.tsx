"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EntrarPage() {
  const router = useRouter();
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aSubmeter, setASubmeter] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setASubmeter(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroDocumento, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível entrar.");
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
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <p className="mt-2 text-gray-600">
        Use o número do seu BI ou Passaporte e a sua palavra-passe.
      </p>

      <form onSubmit={submeter} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label">Número de BI / Passaporte</label>
          <input
            className="input"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div>
          <label className="label">Palavra-passe</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {erro && (
          <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
            {erro}
          </p>
        )}

        <button type="submit" disabled={aSubmeter} className="btn-primary w-full">
          {aSubmeter ? "A entrar…" : "Entrar"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <Link href="/registo" className="font-semibold text-angola-red">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
