import "server-only";
import { prisma } from "@/lib/prisma";

// Campos de conteúdo editável do site. Cada campo tem um valor por omissão,
// usado quando a administração ainda não personalizou o texto. Para acrescentar
// um campo editável basta registá-lo aqui e usar `obterConteudos()` na página.
export interface CampoConteudo {
  chave: string;
  rotulo: string;
  grupo: string;
  multilinha?: boolean;
  padrao: string;
}

export const CAMPOS_CONTEUDO: CampoConteudo[] = [
  // Página inicial
  {
    chave: "home_funcionalidades_titulo",
    rotulo: "Título da secção de funcionalidades",
    grupo: "Página inicial",
    padrao: "Tudo o que precisa, num só lugar",
  },
  {
    chave: "home_cta_titulo",
    rotulo: "Título da chamada final",
    grupo: "Página inicial",
    padrao: "Pronto para começar?",
  },
  {
    chave: "home_cta_texto",
    rotulo: "Texto da chamada final",
    grupo: "Página inicial",
    multilinha: true,
    padrao:
      "Crie a sua conta de Utente em minutos. Os cidadãos angolanos usam o Bilhete de Identidade; os cidadãos estrangeiros usam o Passaporte.",
  },
  // Contactos
  {
    chave: "contactos_intro",
    rotulo: "Introdução",
    grupo: "Contactos",
    multilinha: true,
    padrao: "Estamos disponíveis para o ajudar a usar o Portal de Saúde Nacional.",
  },
  {
    chave: "contactos_apoio_email",
    rotulo: "Apoio ao Utente — email",
    grupo: "Contactos",
    padrao: "apoio@psn.ao",
  },
  {
    chave: "contactos_apoio_telefone",
    rotulo: "Apoio ao Utente — telefone",
    grupo: "Contactos",
    padrao: "+244 900 000 000",
  },
  {
    chave: "contactos_apoio_horario",
    rotulo: "Apoio ao Utente — horário",
    grupo: "Contactos",
    padrao: "Seg-Sex, 08h-18h",
  },
  {
    chave: "contactos_parcerias_email",
    rotulo: "Unidades e parcerias — email",
    grupo: "Contactos",
    padrao: "parcerias@psn.ao",
  },
  {
    chave: "contactos_imprensa_email",
    rotulo: "Imprensa — email",
    grupo: "Contactos",
    padrao: "comunicacao@psn.ao",
  },
  {
    chave: "contactos_sede",
    rotulo: "Sede",
    grupo: "Contactos",
    padrao: "Luanda, Angola",
  },
];

const PADROES: Record<string, string> = Object.fromEntries(
  CAMPOS_CONTEUDO.map((c) => [c.chave, c.padrao]),
);

export type Conteudos = Record<string, string>;

/**
 * Devolve todos os conteúdos do site, com os valores personalizados da
 * administração sobrepostos aos valores por omissão. Tolerante a falhas de BD.
 */
export async function obterConteudos(): Promise<Conteudos> {
  const valores: Conteudos = { ...PADROES };
  try {
    const registos = await prisma.conteudoSite.findMany();
    for (const r of registos) {
      if (r.valor != null && r.valor !== "") valores[r.chave] = r.valor;
    }
  } catch {
    /* sem BD ou tabela ainda por criar — usa os valores por omissão */
  }
  return valores;
}
