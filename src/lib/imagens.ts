import type { TipoUnidade } from "@prisma/client";

/**
 * Imagens do portal — artwork SVG local (servido do próprio servidor), que
 * carrega sempre, sem depender de serviços externos. No CMS, o administrador
 * pode definir `logoUrl`/`bannerUrl` reais, que têm prioridade.
 */

const ARTE_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "/img/u/hospital-publico.svg",
  UNIDADE_HOSPITALAR: "/img/u/hospital-publico.svg",
  CLINICA_PRIVADA: "/img/u/clinica-privada.svg",
  CENTRO_MEDICO: "/img/u/clinica-privada.svg",
  CLINICA_DENTARIA: "/img/u/clinica-privada.svg",
  LABORATORIO: "/img/u/laboratorio.svg",
  FISIOTERAPIA: "/img/u/clinica-privada.svg",
  OPTICA: "/img/u/optica.svg",
  PRESTADOR_SAUDE: "/img/u/clinica-privada.svg",
  FARMACIA: "/img/u/farmacia.svg",
};

export function fotoUnidade(
  tipo: TipoUnidade,
  _id: string,
  logoUrl?: string | null,
): string {
  return logoUrl || ARTE_TIPO[tipo] || ARTE_TIPO.CLINICA_PRIVADA;
}

export function bannerUnidade(
  tipo: TipoUnidade,
  _id: string,
  bannerUrl?: string | null,
): string {
  return bannerUrl || ARTE_TIPO[tipo] || ARTE_TIPO.CLINICA_PRIVADA;
}

export interface SlideHero {
  titulo: string;
  texto: string;
  imagem: string;
  cta: { texto: string; href: string };
}

export const SLIDES_HERO: SlideHero[] = [
  {
    titulo: "A saúde de toda a Angola num só portal",
    texto:
      "Hospitais, clínicas, laboratórios, ópticas e farmácias — encontre, marque e seja atendido.",
    imagem: "/img/hero/1.svg",
    cta: { texto: "Criar conta com o meu BI", href: "/registo" },
  },
  {
    titulo: "Marque consultas em minutos",
    texto:
      "Escolha a especialidade e o médico, e pague em Kwanzas por Multicaixa Express, referência ou é-Kwanza.",
    imagem: "/img/hero/2.svg",
    cta: { texto: "Encontrar unidade", href: "/directorio" },
  },
  {
    titulo: "Farmácias com a sua cobertura",
    texto: "Veja as farmácias perto de si e quais aceitam o seu seguro de saúde.",
    imagem: "/img/hero/3.svg",
    cta: { texto: "Ver farmácias", href: "/directorio?tipo=FARMACIA" },
  },
  {
    titulo: "A sua identidade, protegida",
    texto:
      "Conta criada com o BI ou Passaporte, ficha de saúde e agregado familiar, com segurança máxima.",
    imagem: "/img/hero/4.svg",
    cta: { texto: "Saber mais", href: "/sobre" },
  },
];
