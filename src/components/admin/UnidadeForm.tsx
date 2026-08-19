"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROVINCIAS_ANGOLA } from "@/lib/validacao";

interface Valores {
  nome: string;
  tipo: string;
  provincia: string;
  municipio: string;
  morada: string;
  telefone: string;
  horario: string;
  urgencia24h: boolean;
  logoUrl: string;
  bannerUrl: string;
  descricao: string;
  ativo: boolean;
}

export function UnidadeForm({
  id,
  inicial,
}: {
  id?: string;
  inicial?: Partial<Valores>;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [alterado, setAlterado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [v, setV] = useState<Valores>({
    nome: inicial?.nome ?? "",
    tipo: inicial?.tipo ?? "HOSPITAL_PUBLICO",
    provincia: inicial?.provincia ?? "",
    municipio: inicial?.municipio ?? "",
    morada: inicial?.morada ?? "",
    telefone: inicial?.telefone ?? "",
    horario: inicial?.horario ?? "",
    urgencia24h: inicial?.urgencia24h ?? false,
    logoUrl: inicial?.logoUrl ?? "",
    bannerUrl: inicial?.bannerUrl ?? "",
    descricao: inicial?.descricao ?? "",
    ativo: inicial?.ativo ?? true,
  });

  function set<K extends keyof Valores>(k: K, val: Valores[K]) {
    setV((s) => ({ ...s, [k]: val }));
    setAlterado(true);
    setOk(false);
  }

  async function carregarImagem(campo: "logoUrl" | "bannerUrl", ficheiro: File) {
    setErro(null);
    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(ficheiro.type)) {
      setErro("Use uma imagem JPEG, PNG, WebP ou SVG.");
      return;
    }
    if (ficheiro.size > 5 * 1024 * 1024) {
      setErro("A imagem excede o limite de 5 MB.");
      return;
    }
    setOcupado(true);
    try {
      const fd = new FormData();
      fd.append("ficheiro", ficheiro);
      const res = await fetch("/api/admin/ficheiros", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível carregar a imagem.");
        return;
      }
      set(campo, data.url);
    } catch {
      setErro("Erro de ligação durante o carregamento da imagem.");
    } finally {
      setOcupado(false);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(false);
    setOcupado(true);
    try {
      const url = id ? `/api/admin/unidades/${id}` : "/api/admin/unidades";
      const res = await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível guardar.");
        return;
      }
      setAlterado(false);
      setOk(true);
      if (!id && data.id) {
        router.replace(`/admin/unidades/${data.id}/editar?criada=1`);
      }
      router.refresh();
    } catch {
      setErro("Erro de ligação. Confirme a internet e tente novamente.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={guardar} className="card space-y-5 p-6">
      <div>
        <label className="label">Nome da unidade</label>
        <input className="input" value={v.nome} onChange={(e) => set("nome", e.target.value)} required />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={v.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="HOSPITAL_PUBLICO">Hospital público</option>
            <option value="UNIDADE_HOSPITALAR">Hospital / unidade hospitalar</option>
            <option value="CLINICA_PRIVADA">Clínica privada</option>
            <option value="CENTRO_MEDICO">Centro médico</option>
            <option value="CLINICA_DENTARIA">Clínica dentária</option>
            <option value="LABORATORIO">Diagnóstico / laboratório</option>
            <option value="FISIOTERAPIA">Fisioterapia / reabilitação</option>
            <option value="OPTICA">Óptica</option>
            <option value="PRESTADOR_SAUDE">Prestador de saúde</option>
            <option value="FARMACIA">Farmácia</option>
          </select>
        </div>
        <div>
          <label className="label">Província</label>
          <select className="input" value={v.provincia} onChange={(e) => set("provincia", e.target.value)} required>
            <option value="">Selecione…</option>
            {PROVINCIAS_ANGOLA.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Município</label>
          <input className="input" value={v.municipio} onChange={(e) => set("municipio", e.target.value)} required />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Telefone</label>
          <input className="input" value={v.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </div>
        <div>
          <label className="label">Horário</label>
          <input className="input" value={v.horario} onChange={(e) => set("horario", e.target.value)} placeholder="Seg-Sex, 08h-18h" />
        </div>
      </div>

      <div>
        <label className="label">Morada</label>
        <input className="input" value={v.morada} onChange={(e) => set("morada", e.target.value)} />
      </div>

      <CampoImagem
        rotulo="Logótipo / foto"
        valor={v.logoUrl}
        previewClasse="h-20 w-20 rounded-xl"
        ocupado={ocupado}
        onUrl={(url) => set("logoUrl", url)}
        onFicheiro={(f) => carregarImagem("logoUrl", f)}
      />
      <CampoImagem
        rotulo="Banner"
        valor={v.bannerUrl}
        previewClasse="h-24 w-full rounded-xl"
        ocupado={ocupado}
        onUrl={(url) => set("bannerUrl", url)}
        onFicheiro={(f) => carregarImagem("bannerUrl", f)}
      />

      <div>
        <label className="label">Descrição</label>
        <textarea className="input min-h-[90px]" value={v.descricao} onChange={(e) => set("descricao", e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.urgencia24h} onChange={(e) => set("urgencia24h", e.target.checked)} />
          Urgência 24 horas
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.ativo} onChange={(e) => set("ativo", e.target.checked)} />
          Ativa (visível no portal)
        </label>
      </div>

      {erro && <p role="alert" className="rounded-lg bg-angola-red/10 px-4 py-3 text-sm text-angola-red-dark">{erro}</p>}
      {ok && <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Unidade guardada com sucesso.</p>}

      <div className="sticky bottom-3 z-20 -mx-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-line bg-white/95 p-3 shadow-xl backdrop-blur">
        <span className="px-2 text-xs text-gray-500">{alterado ? "Alterações por guardar" : id ? "Tudo guardado" : "Preencha os dados obrigatórios"}</span>
        <div className="flex gap-2">
          <Link href="/admin/unidades" className="btn-ghost">Voltar à lista</Link>
          <button type="submit" disabled={ocupado || (!!id && !alterado)} className="btn-primary">
            {ocupado ? "A guardar…" : id ? "Guardar alterações" : "Criar unidade"}
          </button>
        </div>
      </div>
    </form>
  );
}

function CampoImagem({
  rotulo,
  valor,
  previewClasse,
  ocupado,
  onUrl,
  onFicheiro,
}: {
  rotulo: string;
  valor: string;
  previewClasse: string;
  ocupado: boolean;
  onUrl: (url: string) => void;
  onFicheiro: (f: File) => void;
}) {
  return (
    <div>
      <label className="label">{rotulo}</label>
      <div className="flex items-center gap-4">
        {valor ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={valor}
            alt=""
            className={`${previewClasse} max-w-[160px] border border-base-line object-cover`}
            onError={(e) => { e.currentTarget.src = "/img/u/clinica.webp"; }}
          />
        ) : (
          <div className={`${previewClasse} max-w-[160px] bg-base-muted`} />
        )}
        <div className="flex flex-col gap-2">
          <label className="btn-ghost inline-flex cursor-pointer py-2">
            {valor ? "Mudar imagem" : "Carregar imagem"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              disabled={ocupado}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFicheiro(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
          {valor && (
            <button type="button" onClick={() => onUrl("")} className="text-xs text-angola-red">
              Remover
            </button>
          )}
        </div>
      </div>
      <input
        className="input mt-2"
        value={valor}
        onChange={(e) => onUrl(e.target.value)}
        placeholder="ou cole um URL (https://…)"
      />
    </div>
  );
}
