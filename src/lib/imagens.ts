import type { TipoUnidade } from "@prisma/client";

/**
 * Imagens do portal.
 *
 * As predefinições usam fotografias reais via picsum.photos (carregadas pelo
 * browser do utilizador e sempre disponíveis — garantem que os banners
 * preenchem). No CMS, o administrador substitui por `logoUrl`/`bannerUrl` reais
 * de cada unidade, que têm sempre prioridade.
 */

function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

const SEED_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO: "hospital",
  CLINICA_PRIVADA: "clinica",
  FARMACIA: "farmacia",
};

export function fotoUnidade(
  tipo: TipoUnidade,
  id: string,
  logoUrl?: string | null,
): string {
  return logoUrl || picsum(`psn-${SEED_TIPO[tipo]}-${id}`, 800, 500);
}

export function bannerUnidade(
  tipo: TipoUnidade,
  id: string,
  bannerUrl?: string | null,
): string {
  return bannerUrl || picsum(`psn-banner-${SEED_TIPO[tipo]}-${id}`, 1600, 480);
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
      "Hospitais públicos, clínicas privadas e farmácias — encontre, marque e seja atendido.",
    imagem: picsum("psn-hero-1", 1600, 600),
    cta: { texto: "Criar conta com o meu BI", href: "/registo" },
  },
  {
    titulo: "Marque consultas em minutos",
    texto:
      "Escolha a especialidade e o médico, e pague em Kwanzas por Multicaixa Express, referência ou é-Kwanza.",
    imagem: picsum("psn-hero-2", 1600, 600),
    cta: { texto: "Encontrar unidade", href: "/directorio" },
  },
  {
    titulo: "Farmácias com a sua cobertura",
    texto: "Veja as farmácias perto de si e quais aceitam o seu seguro de saúde.",
    imagem: picsum("psn-hero-3", 1600, 600),
    cta: { texto: "Ver farmácias", href: "/directorio?tipo=FARMACIA" },
  },
  {
    titulo: "A sua identidade, protegida",
    texto:
      "Conta criada com o BI ou Passaporte, ficha de saúde e agregado familiar, com segurança máxima.",
    imagem: picsum("psn-hero-4", 1600, 600),
    cta: { texto: "Saber mais", href: "/sobre" },
  },
];
