"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TipoDoc = "BI" | "PASSAPORTE" | "AUTORIZACAO_RESIDENCIA";

const ROTULO_DOC: Record<TipoDoc, string> = {
  BI: "Bilhete de Identidade",
  PASSAPORTE: "Passaporte",
  AUTORIZACAO_RESIDENCIA: "Autorização de Residência",
};

export function VerificacaoFlow({
  nomePadrao,
  tipoPadrao,
  numeroPadrao,
}: {
  nomePadrao: string;
  tipoPadrao: TipoDoc;
  numeroPadrao: string;
}) {
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [verificacaoId, setVerificacaoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [dados, setDados] = useState({
    tipoDocumento: tipoPadrao,
    numeroDocumento: numeroPadrao,
    nomeCompleto: nomePadrao,
    dataNascimento: "",
    nacionalidade: tipoPadrao === "BI" ? "Angolana" : "",
  });
  const [enviadas, setEnviadas] = useState({ FRENTE: false, VERSO: false, SELFIE: false });

  const exigeVerso = dados.tipoDocumento !== "PASSAPORTE";

  async function iniciar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);
    try {
      const res = await fetch("/api/verificacao/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const j = await res.json();
      if (!res.ok) {
        setErro(j.erro ?? "Não foi possível iniciar.");
        return;
      }
      setVerificacaoId(j.id);
      setPasso(2);
    } finally {
      setOcupado(false);
    }
  }

  async function enviarImagem(tipo: "FRENTE" | "VERSO" | "SELFIE", ficheiro: File) {
    if (!verificacaoId) return;
    setErro(null);
    setOcupado(true);
    try {
      const fd = new FormData();
      fd.append("verificacaoId", verificacaoId);
      fd.append("tipo", tipo);
      fd.append("ficheiro", ficheiro);
      const res = await fetch("/api/verificacao/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) {
        setErro(j.erro ?? "Falha no envio da imagem.");
        return;
      }
      setEnviadas((s) => ({ ...s, [tipo]: true }));
    } finally {
      setOcupado(false);
    }
  }

  async function submeter() {
    if (!verificacaoId) return;
    setErro(null);
    setOcupado(true);
    try {
      const res = await fetch("/api/verificacao/submeter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificacaoId }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErro(j.erro ?? "Não foi possível submeter.");
        return;
      }
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  const totalPassos = exigeVerso ? 5 : 4;

  return (
    <div className="space-y-5">
      <Progresso passo={passo} total={totalPassos} />

      {erro && (
        <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
          {erro}
        </p>
      )}

      {/* Passo 1 — Dados */}
      {passo === 1 && (
        <form onSubmit={iniciar} className="space-y-4">
          <div>
            <label className="label">Tipo de documento</label>
            <select
              className="input"
              value={dados.tipoDocumento}
              onChange={(e) =>
                setDados((d) => ({ ...d, tipoDocumento: e.target.value as TipoDoc }))
              }
            >
              {(Object.keys(ROTULO_DOC) as TipoDoc[]).map((t) => (
                <option key={t} value={t}>{ROTULO_DOC[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Número do documento</label>
            <input
              className="input"
              value={dados.numeroDocumento}
              onChange={(e) =>
                setDados((d) => ({ ...d, numeroDocumento: e.target.value.toUpperCase() }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Nome completo</label>
            <input
              className="input"
              value={dados.nomeCompleto}
              onChange={(e) => setDados((d) => ({ ...d, nomeCompleto: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Data de nascimento</label>
              <input
                type="date"
                className="input"
                value={dados.dataNascimento}
                onChange={(e) => setDados((d) => ({ ...d, dataNascimento: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Nacionalidade</label>
              <input
                className="input"
                value={dados.nacionalidade}
                onChange={(e) => setDados((d) => ({ ...d, nacionalidade: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" disabled={ocupado} className="btn-primary w-full">
            {ocupado ? "A iniciar…" : "Continuar"}
          </button>
        </form>
      )}

      {/* Passo 2 — Frente do documento */}
      {passo === 2 && (
        <PassoImagem
          titulo={`Frente do ${ROTULO_DOC[dados.tipoDocumento]}`}
          descricao="Fotografe ou carregue a frente do documento, bem legível."
          enviada={enviadas.FRENTE}
          ocupado={ocupado}
          onFicheiro={(f) => enviarImagem("FRENTE", f)}
          onContinuar={() => setPasso(exigeVerso ? 3 : 4)}
        />
      )}

      {/* Passo 3 — Verso (se aplicável) */}
      {passo === 3 && exigeVerso && (
        <PassoImagem
          titulo="Verso do documento"
          descricao="Carregue o verso do documento."
          enviada={enviadas.VERSO}
          ocupado={ocupado}
          onFicheiro={(f) => enviarImagem("VERSO", f)}
          onContinuar={() => setPasso(4)}
        />
      )}

      {/* Passo 4 — Selfie */}
      {passo === 4 && (
        <PassoImagem
          titulo="Selfie"
          descricao="Tire uma fotografia do seu rosto, de frente e com boa iluminação."
          enviada={enviadas.SELFIE}
          ocupado={ocupado}
          aceitarCamera
          onFicheiro={(f) => enviarImagem("SELFIE", f)}
          onContinuar={() => setPasso(5)}
        />
      )}

      {/* Passo 5 — Revisão */}
      {passo === 5 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-base-line p-4 text-sm">
            <p><strong>Documento:</strong> {ROTULO_DOC[dados.tipoDocumento]} — {dados.numeroDocumento}</p>
            <p className="mt-1"><strong>Nome:</strong> {dados.nomeCompleto}</p>
            <ul className="mt-3 space-y-1 text-gray-600">
              <li>{enviadas.FRENTE ? "✓" : "—"} Frente do documento</li>
              {exigeVerso && <li>{enviadas.VERSO ? "✓" : "—"} Verso do documento</li>}
              <li>{enviadas.SELFIE ? "✓" : "—"} Selfie</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500">
            Ao submeter, confirma que as imagens são suas e autênticas. Os dados
            são tratados ao abrigo da Lei n.º 22/11 e guardados de forma cifrada.
          </p>
          <button onClick={submeter} disabled={ocupado} className="btn-primary w-full">
            {ocupado ? "A submeter…" : "Submeter para verificação"}
          </button>
        </div>
      )}
    </div>
  );
}

function Progresso({ passo, total }: { passo: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < passo ? "bg-angola-red" : "bg-base-muted"
          }`}
        />
      ))}
    </div>
  );
}

function PassoImagem({
  titulo,
  descricao,
  enviada,
  ocupado,
  aceitarCamera,
  onFicheiro,
  onContinuar,
}: {
  titulo: string;
  descricao: string;
  enviada: boolean;
  ocupado: boolean;
  aceitarCamera?: boolean;
  onFicheiro: (f: File) => void;
  onContinuar: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold">{titulo}</h3>
        <p className="text-sm text-gray-500">{descricao}</p>
      </div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-line bg-base-soft px-4 py-10 text-center hover:bg-base-muted">
        <span className="text-sm font-medium text-angola-red">
          {enviada ? "Imagem enviada ✓ — toque para substituir" : "Toque para carregar"}
        </span>
        <span className="text-xs text-gray-400">JPEG, PNG ou WebP (máx. 8 MB)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture={aceitarCamera ? "user" : undefined}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFicheiro(f);
          }}
        />
      </label>
      <button
        onClick={onContinuar}
        disabled={!enviada || ocupado}
        className="btn-primary w-full"
      >
        Continuar
      </button>
    </div>
  );
}
