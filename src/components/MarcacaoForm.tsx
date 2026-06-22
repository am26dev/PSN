"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatarKz } from "@/lib/moeda";

interface Opcao {
  id: string;
  nome: string;
}

const PARENTESCO_ROTULO: Record<string, string> = {
  FILHO: "Filho(a)",
  CONJUGE: "Cônjuge",
  PAI: "Pai",
  MAE: "Mãe",
  OUTRO: "Parente",
};

interface PagamentoResultado {
  metodo: string;
  valorCentimos: number;
  estado: string;
  entidade?: string | null;
  referenciaEmis?: string | null;
  qrCode?: string | null;
  expiraEm?: string | null;
  modoSimulado?: boolean;
}

export function MarcacaoForm({
  unidadeId,
  especialidades,
  medicos,
  dependentes,
  temSeguro,
  telefoneUtente,
  valorCentimos,
  especialidadePre = null,
  remarcarId = null,
}: {
  unidadeId: string;
  especialidades: Opcao[];
  medicos: { id: string; nome: string; especialidadeId: string }[];
  dependentes: { id: string; nomeCompleto: string; parentesco: string }[];
  temSeguro: boolean;
  telefoneUtente: string | null;
  valorCentimos: number;
  especialidadePre?: string | null;
  remarcarId?: string | null;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aSubmeter, setASubmeter] = useState(false);
  const [resultado, setResultado] = useState<PagamentoResultado | null>(null);
  const [especialidadeId, setEspecialidadeId] = useState(especialidadePre ?? "");
  // "EU" ou o id de um dependente do agregado.
  const [alvo, setAlvo] = useState("EU");
  const [form, setForm] = useState({
    medicoId: "",
    dataHora: "",
    motivo: "",
    referenciaMedica: "",
    metodoPagamento: "MULTICAIXA_EXPRESS",
    telefone: telefoneUtente ?? "",
  });

  const medicosFiltrados = especialidadeId
    ? medicos.filter((m) => m.especialidadeId === especialidadeId)
    : medicos;

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setASubmeter(true);
    try {
      // Modo remarcação: atualiza a marcação existente (nova data/especialidade).
      if (remarcarId) {
        const res = await fetch(`/api/marcacoes/${remarcarId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            especialidadeId: especialidadeId || undefined,
            medicoId: form.medicoId || undefined,
            dataHora: form.dataHora,
            motivo: form.motivo || undefined,
            referenciaMedica: form.referenciaMedica || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErro(data.erro ?? "Não foi possível remarcar a consulta.");
          return;
        }
        router.push("/conta?remarcacao=ok");
        router.refresh();
        return;
      }

      const res = await fetch("/api/marcacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadeId,
          especialidadeId: especialidadeId || undefined,
          medicoId: form.medicoId || undefined,
          dependenteId: alvo === "EU" ? undefined : alvo,
          dataHora: form.dataHora,
          motivo: form.motivo || undefined,
          referenciaMedica: form.referenciaMedica || undefined,
          metodoPagamento: form.metodoPagamento,
          telefone: form.telefone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível marcar a consulta.");
        return;
      }
      setResultado(data.pagamento as PagamentoResultado);
      router.refresh();
    } catch {
      setErro("Falha de ligação. Tente novamente.");
    } finally {
      setASubmeter(false);
    }
  }

  if (resultado) {
    return <PainelPagamento resultado={resultado} />;
  }

  return (
    <form onSubmit={submeter} className="card space-y-5 p-6">
      {/* Para quem */}
      <div>
        <label className="label">Para quem é a consulta?</label>
        <select className="input" value={alvo} onChange={(e) => setAlvo(e.target.value)}>
          <option value="EU">Para mim</option>
          {dependentes.map((d) => (
            <option key={d.id} value={d.id}>
              {PARENTESCO_ROTULO[d.parentesco] ?? "Parente"}: {d.nomeCompleto}
            </option>
          ))}
        </select>
        {dependentes.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">
            Para marcar para um cônjuge, filho(a) ou parente, adicione-o primeiro
            em “O meu agregado familiar”.
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Especialidade</label>
          <select
            className="input"
            value={especialidadeId}
            onChange={(e) => {
              setEspecialidadeId(e.target.value);
              setForm((f) => ({ ...f, medicoId: "" }));
            }}
          >
            <option value="">Qualquer especialidade</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Médico (opcional)</label>
          <select
            className="input"
            value={form.medicoId}
            onChange={(e) => setForm((f) => ({ ...f, medicoId: e.target.value }))}
          >
            <option value="">Sem preferência</option>
            {medicosFiltrados.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Data e hora pretendidas</label>
        <input
          type="datetime-local"
          className="input"
          value={form.dataHora}
          onChange={(e) => setForm((f) => ({ ...f, dataHora: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="label">Motivo (opcional)</label>
        <textarea
          className="input min-h-[80px]"
          value={form.motivo}
          onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
        />
      </div>

      <div>
        <label className="label">Referência médica (opcional)</label>
        <input
          className="input"
          placeholder="Nº da credencial / referência do médico que o encaminhou"
          value={form.referenciaMedica}
          onChange={(e) => setForm((f) => ({ ...f, referenciaMedica: e.target.value }))}
        />
      </div>

      {/* Pagamento — não se aplica na remarcação (já pago) */}
      {!remarcarId && (
        <>
          <div>
            <label className="label">Método de pagamento</label>
            <select
              className="input"
              value={form.metodoPagamento}
              onChange={(e) => setForm((f) => ({ ...f, metodoPagamento: e.target.value }))}
            >
              <option value="MULTICAIXA_EXPRESS">Multicaixa Express</option>
              <option value="REFERENCIA_EMIS">Referência (pagar em qualquer banco/ATM)</option>
              <option value="E_KWANZA">é-Kwanza (código QR)</option>
              {temSeguro && <option value="SEGURO_SAUDE">Seguro de saúde</option>}
              <option value="PAGAMENTO_ESTADO">Pagamento ao Estado (RUPE)</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Pagamentos processados pela Pay4all (é+). Seguro e RUPE são tratados à parte.
            </p>
          </div>

          {form.metodoPagamento === "MULTICAIXA_EXPRESS" && (
            <div>
              <label className="label">Telemóvel para a cobrança</label>
              <input
                className="input"
                placeholder="+244 9XX XXX XXX"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Vai receber a cobrança na app Multicaixa Express para confirmar.
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between rounded-xl bg-base-soft px-4 py-3">
        <span className="text-sm text-gray-600">Valor da consulta</span>
        <span className="text-lg font-bold text-angola-red">
          {formatarKz(valorCentimos)}
        </span>
      </div>

      {erro && (
        <p className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">
          {erro}
        </p>
      )}

      <button type="submit" disabled={aSubmeter} className="btn-primary w-full">
        {aSubmeter
          ? "A processar…"
          : remarcarId
            ? "Confirmar remarcação"
            : "Confirmar marcação"}
      </button>
    </form>
  );
}

function PainelPagamento({ resultado }: { resultado: PagamentoResultado }) {
  return (
    <div className="card space-y-5 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
          ✓
        </span>
        <div>
          <h2 className="text-lg font-bold">Marcação registada</h2>
          <p className="text-sm text-gray-500">
            Conclua o pagamento de{" "}
            <strong>{formatarKz(resultado.valorCentimos)}</strong>.
          </p>
        </div>
      </div>

      {resultado.modoSimulado && (
        <p className="rounded-lg bg-angola-gold/15 px-4 py-2 text-xs text-angola-gold-dark">
          Modo de demonstração: a ligação real à Pay4all será ativada com as
          credenciais do parceiro.
        </p>
      )}

      {/* Referência EMIS */}
      {resultado.metodo === "REFERENCIA_EMIS" && resultado.referenciaEmis && (
        <div className="rounded-xl border border-base-line p-4">
          <p className="text-sm text-gray-500">
            Pague em qualquer Multicaixa, ATM ou app bancária, na opção
            «Pagamentos por Referência»:
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Cartao rotulo="Entidade" valor={resultado.entidade ?? "—"} />
            <Cartao rotulo="Referência" valor={resultado.referenciaEmis} />
            <Cartao rotulo="Montante" valor={formatarKz(resultado.valorCentimos)} />
          </dl>
          {resultado.expiraEm && (
            <p className="mt-3 text-xs text-gray-400">
              Válida até{" "}
              {new Intl.DateTimeFormat("pt-PT", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(resultado.expiraEm))}
              .
            </p>
          )}
        </div>
      )}

      {/* é-Kwanza QR */}
      {resultado.metodo === "E_KWANZA" && resultado.qrCode && (
        <div className="rounded-xl border border-base-line p-4 text-center">
          <p className="text-sm text-gray-500">
            Abra a app é-Kwanza e leia o código QR para pagar:
          </p>
          <code className="mt-3 block break-all rounded-lg bg-base-muted px-3 py-2 text-xs">
            {resultado.qrCode}
          </code>
        </div>
      )}

      {/* Multicaixa Express push */}
      {resultado.metodo === "MULTICAIXA_EXPRESS" && (
        <p className="rounded-xl border border-base-line p-4 text-sm text-gray-600">
          Enviámos a cobrança para a sua app <strong>Multicaixa Express</strong>.
          Abra a aplicação, escolha o cartão e confirme o pagamento.
        </p>
      )}

      {/* RUPE */}
      {resultado.metodo === "PAGAMENTO_ESTADO" && (
        <p className="rounded-xl border border-base-line p-4 text-sm text-gray-600">
          Será gerada uma referência RUPE para pagamento ao Estado. Esta
          integração é ativada na fase seguinte.
        </p>
      )}

      <Link href="/conta" className="btn-primary w-full">
        Ver as minhas marcações
      </Link>
    </div>
  );
}

function Cartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-base-soft px-2 py-3">
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{rotulo}</p>
      <p className="mt-1 text-sm font-bold">{valor}</p>
    </div>
  );
}
