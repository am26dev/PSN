export const metadata = { title: "Contactos — PSN" };

export default function ContactosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Contactos</h1>
        <p className="mt-2 text-gray-600">
          Estamos disponíveis para o ajudar a usar o Portal de Saúde Nacional.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Cartao titulo="Apoio ao Utente" linhas={["apoio@psn.ao", "+244 900 000 000", "Seg-Sex, 08h-18h"]} />
        <Cartao titulo="Unidades e parcerias" linhas={["parcerias@psn.ao", "Adesão de hospitais, clínicas e farmácias"]} />
        <Cartao titulo="Imprensa" linhas={["comunicacao@psn.ao"]} />
        <Cartao titulo="Sede" linhas={["Luanda, Angola"]} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold">Emergências</h2>
        <p className="mt-2 text-sm text-gray-600">
          Em caso de emergência médica, dirija-se à unidade de urgência mais
          próxima (filtre por “Urgência 24 horas” no diretório) ou contacte os
          serviços de emergência nacionais.
        </p>
      </div>
    </div>
  );
}

function Cartao({ titulo, linhas }: { titulo: string; linhas: string[] }) {
  return (
    <div className="card p-6">
      <h2 className="font-bold">{titulo}</h2>
      <ul className="mt-2 space-y-1 text-sm text-gray-600">
        {linhas.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
