import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/Hero";
import { SLIDES_HERO } from "@/lib/imagens";
import { LogoSeguradora } from "@/components/LogoSeguradora";
import { obterConteudos } from "@/lib/conteudo";
import {
  IconeRede,
  IconeCalendario,
  IconeFamilia,
  IconeSeguro,
  IconeUrgencia,
  IconeEscudo,
} from "@/components/Icones";
import type { ComponentType } from "react";

export default async function HomePage() {
  const [hospitais, prestadores, farmacias] = await Promise.all([
    prisma.unidade.count({ where: { tipo: "HOSPITAL_PUBLICO", ativo: true } }),
    prisma.unidade.count({
      where: { tipo: { notIn: ["HOSPITAL_PUBLICO", "FARMACIA"] }, ativo: true },
    }),
    prisma.unidade.count({ where: { tipo: "FARMACIA", ativo: true } }),
  ]).catch(() => [0, 0, 0]);

  const seguradoras = await prisma.seguradora
    .findMany({ where: { ativo: true }, orderBy: { nome: "asc" } })
    .catch(() => []);

  const c = await obterConteudos();

  return (
    <div className="space-y-16">
      {/* Hero com 4 slides */}
      <Hero slides={SLIDES_HERO} />

      {/* Estatísticas da rede */}
      <section className="grid grid-cols-3 gap-4">
        <Estatistica numero={hospitais} rotulo="Hospitais públicos" />
        <Estatistica numero={prestadores} rotulo="Clínicas e prestadores" />
        <Estatistica numero={farmacias} rotulo="Farmácias" />
      </section>

      {/* Seguradoras parceiras */}
      {seguradoras.length > 0 && (
        <section>
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-gray-400">
            Seguradoras e redes de saúde
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {seguradoras.map((s) => (
              <LogoSeguradora key={s.id} nome={s.nome} logoUrl={s.logoUrl} />
            ))}
          </div>
        </section>
      )}

      {/* Funcionalidades */}
      <section>
        <h2 className="text-2xl font-bold">{c.home_funcionalidades_titulo}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Funcionalidade
            Icone={IconeRede}
            titulo="Rede nacional"
            texto="Hospitais públicos, clínicas privadas e farmácias de todas as províncias, com pesquisa por proximidade e especialidade."
          />
          <Funcionalidade
            Icone={IconeCalendario}
            titulo="Marcação de consultas"
            texto="Escolha a unidade, a especialidade e o médico disponível. Pague em Kwanzas por Multicaixa Express, transferência, seguro ou ao Estado."
          />
          <Funcionalidade
            Icone={IconeFamilia}
            titulo="Ficha de saúde e família"
            texto="Crie a conta com o seu BI ou Passaporte e adicione o seu agregado familiar — filhos, cônjuge ou pais à sua responsabilidade."
          />
          <Funcionalidade
            Icone={IconeSeguro}
            titulo="Cobertura de seguros"
            texto="Veja quais as clínicas e farmácias que aceitam o seu seguro de saúde, e quais atendem sem seguro."
          />
          <Funcionalidade
            Icone={IconeUrgencia}
            titulo="Urgências 24 horas"
            texto="Identifique rapidamente as unidades com atendimento de urgência permanente perto de si."
          />
          <Funcionalidade
            Icone={IconeEscudo}
            titulo="Segurança máxima"
            texto="Ligação cifrada, palavras-passe protegidas com Argon2 e tratamento de dados conforme a Lei de Proteção de Dados de Angola."
          />
        </div>
      </section>

      {/* Chamada final — banner */}
      <section className="relative overflow-hidden rounded-2xl shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/hero/2.svg"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-angola-black/90 via-angola-red/75 to-angola-red/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-extrabold md:text-3xl">{c.home_cta_titulo}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">{c.home_cta_texto}</p>
          <Link href="/registo" className="btn-gold mt-6">
            Criar a minha conta
          </Link>
        </div>
      </section>
    </div>
  );
}

function Estatistica({ numero, rotulo }: { numero: number; rotulo: string }) {
  return (
    <div className="card p-5 text-center">
      <p className="text-3xl font-extrabold text-angola-red">{numero}</p>
      <p className="mt-1 text-xs text-gray-500">{rotulo}</p>
    </div>
  );
}

function Funcionalidade({
  Icone,
  titulo,
  texto,
}: {
  Icone: ComponentType<{ className?: string }>;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-angola-red/10 text-angola-red">
        <Icone className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold">{titulo}</h3>
      <p className="mt-2 text-sm text-gray-600">{texto}</p>
    </div>
  );
}
