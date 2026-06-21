import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/Hero";
import { SLIDES_HERO } from "@/lib/imagens";
import { LogoSeguradora } from "@/components/LogoSeguradora";
import { obterConteudos } from "@/lib/conteudo";

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
            titulo="Rede nacional"
            texto="Hospitais públicos, clínicas privadas e farmácias de todas as províncias, com pesquisa por proximidade e especialidade."
          />
          <Funcionalidade
            titulo="Marcação de consultas"
            texto="Escolha a unidade, a especialidade e o médico disponível. Pague em Kwanzas por Multicaixa Express, transferência, seguro ou ao Estado."
          />
          <Funcionalidade
            titulo="Ficha de saúde e família"
            texto="Crie a conta com o seu BI ou Passaporte e adicione o seu agregado familiar — filhos, cônjuge ou pais à sua responsabilidade."
          />
          <Funcionalidade
            titulo="Cobertura de seguros"
            texto="Veja quais as clínicas e farmácias que aceitam o seu seguro de saúde, e quais atendem sem seguro."
          />
          <Funcionalidade
            titulo="Urgências 24 horas"
            texto="Identifique rapidamente as unidades com atendimento de urgência permanente perto de si."
          />
          <Funcionalidade
            titulo="Segurança máxima"
            texto="Ligação cifrada, palavras-passe protegidas com Argon2 e tratamento de dados conforme a Lei de Proteção de Dados de Angola."
          />
        </div>
      </section>

      {/* Chamada final */}
      <section className="rounded-2xl border border-base-line bg-white p-8 text-center shadow-card">
        <h2 className="text-2xl font-bold">{c.home_cta_titulo}</h2>
        <p className="mx-auto mt-2 max-w-xl text-gray-600">{c.home_cta_texto}</p>
        <Link href="/registo" className="btn-primary mt-6">
          Criar a minha conta
        </Link>
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

function Funcionalidade({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="card p-6">
      <div className="mb-3 h-1.5 w-10 rounded-full bg-angola-gold" />
      <h3 className="text-lg font-bold">{titulo}</h3>
      <p className="mt-2 text-sm text-gray-600">{texto}</p>
    </div>
  );
}
