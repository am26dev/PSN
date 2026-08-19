import type { TipoUnidade } from "@prisma/client";

/**
 * Fotografias locais em WebP, comprimidas para redes móveis. No CMS, o
 * administrador pode definir `logoUrl`/`bannerUrl` reais, que têm prioridade;
 * os componentes visuais regressam a estes recursos se o URL falhar.
 */

const FOTO_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "/img/u/hospital.webp",
  UNIDADE_HOSPITALAR: "/img/u/hospital.webp",
  CLINICA_PRIVADA: "/img/u/clinica.webp",
  CENTRO_MEDICO: "/img/u/clinica.webp",
  CLINICA_DENTARIA: "/img/u/dentaria.webp",
  LABORATORIO: "/img/u/laboratorio.webp",
  FISIOTERAPIA: "/img/u/fisioterapia.webp",
  OPTICA: "/img/u/optica.webp",
  PRESTADOR_SAUDE: "/img/u/clinica.webp",
  FARMACIA: "/img/u/farmacia.webp",
};

export function imagemPadraoUnidade(tipo: TipoUnidade): string {
  return FOTO_TIPO[tipo] || FOTO_TIPO.CLINICA_PRIVADA;
}

export function fotoUnidade(
  tipo: TipoUnidade,
  _id: string,
  logoUrl?: string | null,
): string {
  return logoUrl || imagemPadraoUnidade(tipo);
}

export function bannerUnidade(
  tipo: TipoUnidade,
  _id: string,
  bannerUrl?: string | null,
): string {
  return bannerUrl || imagemPadraoUnidade(tipo);
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
    imagem: "/img/hero/1.webp",
    cta: { texto: "Criar conta com o meu BI", href: "/registo" },
  },
  {
    titulo: "Marque consultas em minutos",
    texto:
      "Escolha a especialidade e o médico, e pague em Kwanzas por Multicaixa Express, referência ou é-Kwanza.",
    imagem: "/img/hero/2.webp",
    cta: { texto: "Encontrar unidade", href: "/directorio" },
  },
  {
    titulo: "Farmácias com a sua cobertura",
    texto: "Veja as farmácias perto de si e quais aceitam o seu seguro de saúde.",
    imagem: "/img/hero/3.webp",
    cta: { texto: "Ver farmácias", href: "/directorio?tipo=FARMACIA" },
  },
  {
    titulo: "A sua identidade, protegida",
    texto:
      "Conta criada com o BI ou Passaporte, ficha de saúde e agregado familiar, com segurança máxima.",
    imagem: "/img/hero/4.webp",
    cta: { texto: "Saber mais", href: "/sobre" },
  },
];
