import Link from "next/link";

export default function SobrePage() {
  return (
    <div className="space-y-12">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl shadow-card">
        <div className="relative h-72 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/psn-sobre-banner/1600/600"
            alt=""
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/psn-sobre-utentes/900/600"
            alt=""
            className="h-72 w-full object-cover"
          />
        </div>
      </section>

      {/* Pilares */}
      <section>
        <h2 className="text-2xl font-bold">Os nossos pilares</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Pilar titulo="Acesso" texto="Encontre unidades de saúde perto de si, em todas as províncias." />
          <Pilar titulo="Saúde" texto="Cuidado e confiança para todos os cidadãos." />
          <Pilar titulo="Conectividade" texto="Tecnologia ao serviço da saúde, simples e rápida." />
          <Pilar titulo="Confiança" texto="Segurança e proteção de dados ao abrigo da Lei n.º 22/11." />
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

function Pilar({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="card p-6">
      <div className="mb-3 h-1.5 w-10 rounded-full bg-angola-gold" />
      <h3 className="text-lg font-bold">{titulo}</h3>
      <p className="mt-2 text-sm text-gray-600">{texto}</p>
    </div>
  );
}
