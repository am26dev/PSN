import Link from "next/link";
import { ImagemSegura } from "@/components/ImagemSegura";

export default function SobrePage() {
  return (
    <div className="space-y-12">
      {/* Banner */}
      <section className="full-bleed relative -mt-8 overflow-hidden shadow-2xl">
        <div className="relative h-[500px] w-full">
          <ImagemSegura
            src="/img/about/equipa.webp"
            fallback="/img/hero/1.webp"
            alt="Equipa de saúde a atender utentes"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-angola-black/85 via-angola-red/75 to-angola-red/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
              <div className="max-w-2xl text-white">
                <span className="badge bg-angola-gold text-angola-black">Sobre o PSN</span>
                <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
                  A saúde de Angola, unida e digital.
                </h1>
                <p className="mt-3 text-white/90">
                  O Portal de Saúde Nacional reúne hospitais públicos, clínicas
                  privadas e farmácias de todo o país num só lugar — para que
                  encontrar, marcar e ser atendido seja simples para todos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para os Utentes — com imagem */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Para os Utentes</h2>
          <ul className="mt-4 space-y-3 text-gray-600">
            <Item texto="Conta criada com o Bilhete de Identidade (angolanos) ou Passaporte (estrangeiros)." />
            <Item texto="Gestão do agregado familiar — filhos, cônjuge ou pais à sua responsabilidade." />
            <Item texto="Ficha de saúde pessoal, acessível nas unidades onde for atendido." />
            <Item texto="Pagamentos em Kwanzas por Multicaixa Express, referência, é-Kwanza ou seguro." />
          </ul>
          <Link href="/registo" className="btn-primary mt-6">Criar a minha conta</Link>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-card">
          <ImagemSegura
            src="/img/about/utentes.webp"
            fallback="/img/u/clinica.webp"
            alt="Utentes angolanos numa consulta"
            className="h-72 w-full object-cover"
          />
        </div>
      </section>

      {/* Pilares */}
      <section>
        <h2 className="text-2xl font-bold">Os nossos pilares</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Pilar icone="/pilares/acesso.png" titulo="Acesso" texto="Encontre unidades de saúde perto de si, em todas as províncias." />
          <Pilar icone="/pilares/saude-coracao.png" titulo="Saúde" texto="Cuidado e confiança para todos os cidadãos." />
          <Pilar icone="/pilares/conectividade-1.png" titulo="Conectividade" texto="Tecnologia ao serviço da saúde, simples e rápida." />
          <Pilar icone="/pilares/confianca.png" titulo="Confiança" texto="Segurança e proteção de dados ao abrigo da Lei n.º 22/11." />
        </div>
      </section>

      {/* Segurança */}
      <section className="card p-8">
        <h2 className="text-xl font-bold">Segurança e proteção de dados</h2>
        <p className="mt-3 text-gray-600">
          Os dados de saúde são dados sensíveis. O PSN trata-os ao abrigo da Lei
          n.º 22/11 de Proteção de Dados Pessoais de Angola: ligação cifrada
          (HTTPS), palavras-passe protegidas com Argon2id, imagens de documentos
          cifradas em repouso, sessões revogáveis e princípio do acesso mínimo.
        </p>
      </section>
    </div>
  );
}

function Item({ texto }: { texto: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 text-angola-red">✓</span>
      <span>{texto}</span>
    </li>
  );
}

function Pilar({ icone, titulo, texto }: { icone: string; titulo: string; texto: string }) {
  return (
    <div className="group rounded-2xl border border-base-line bg-gradient-to-br from-white via-white to-angola-gold/[0.08] p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-base-line">
        <ImagemSegura src={icone} fallback="/pilares/utente.png" alt="" className="h-14 w-14 object-contain" />
      </div>
      <h3 className="text-lg font-bold">{titulo}</h3>
      <p className="mt-2 text-sm text-gray-600">{texto}</p>
    </div>
  );
}
