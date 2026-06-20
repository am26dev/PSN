export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Sobre o Portal de Saúde Nacional</h1>
      <p className="text-gray-600">
        O Portal de Saúde Nacional (PSN) reúne, num só lugar, os hospitais
        públicos, as clínicas privadas e as farmácias de toda a Angola. O objetivo
        é simplificar o acesso à saúde: encontrar a unidade certa, ver as
        especialidades e os médicos disponíveis, marcar consultas e gerir a sua
        ficha de saúde e a do seu agregado familiar.
      </p>

      <section className="card p-6">
        <h2 className="text-xl font-bold">Para os Utentes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-600">
          <li>Conta criada com o Bilhete de Identidade (cidadãos angolanos) ou Passaporte (estrangeiros).</li>
          <li>Gestão do agregado familiar — filhos, cônjuge ou pais à sua responsabilidade.</li>
          <li>Ficha de saúde pessoal, acessível nas unidades onde for atendido.</li>
          <li>Pagamentos em Kwanzas por Multicaixa Express, transferência, seguro ou ao Estado.</li>
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold">Segurança e proteção de dados</h2>
        <p className="mt-3 text-gray-600">
          Os dados de saúde são dados sensíveis. O PSN trata-os ao abrigo da Lei
          n.º 22/11 de Proteção de Dados Pessoais de Angola: ligação cifrada
          (HTTPS), palavras-passe protegidas com Argon2id, sessões revogáveis e
          princípio do acesso mínimo. A ligação automática ao Serviço Integrado de
          Atendimento ao Cidadão (SIAC) e ao Multicaixa Express (EMIS) está
          preparada para entrar em funcionamento mediante protocolo institucional.
        </p>
      </section>
    </div>
  );
}
