import type { TipoUnidade } from "@prisma/client";

/**
 * Imagens do portal.
 *
 * Usamos fotografias reais (carregadas pelo browser do utilizador) como
 * predefinição, para o portal ter um aspeto profissional desde já. No CMS, o
 * administrador pode substituir por `logoUrl`/`bannerUrl` reais de cada unidade,
 * que têm sempre prioridade sobre estas predefinições.
 */

function picsum(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

// Banners temáticos por tipo (Unsplash — fotografias de saúde).
const BANNER_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO:
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1600&q=70",
  CLINICA_PRIVADA:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=70",
  FARMACIA:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1600&q=70",
};

const FOTO_TIPO: Record<TipoUnidade, string> = {
  HOSPITAL_PUBLICO:
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=70",
  CLINICA_PRIVADA:
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=70",
  FARMACIA:
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=70",
};

export function fotoUnidade(
  tipo: TipoUnidade,
  id: string,
  logoUrl?: string | null,
): string {
  return logoUrl || FOTO_TIPO[tipo] || picsum(`psn-${id}`, 800, 500);
}

export function bannerUnidade(
  tipo: TipoUnidade,
  id: string,
  bannerUrl?: string | null,
): string {
  return bannerUrl || BANNER_TIPO[tipo] || picsum(`psn-b-${id}`, 1600, 500);
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
    imagem:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1600&q=70",
    cta: { texto: "Criar conta com o meu BI", href: "/registo" },
  },
  {
    titulo: "Marque consultas em minutos",
    texto:
      "Escolha a especialidade e o médico, e pague em Kwanzas por Multicaixa Express, referência ou é-Kwanza.",
    imagem:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=70",
    cta: { texto: "Encontrar unidade", href: "/directorio" },
  },
  {
    titulo: "Farmácias com a sua cobertura",
    texto:
      "Veja as farmácias perto de si e quais aceitam o seu seguro de saúde.",
    imagem:
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1600&q=70",
    cta: { texto: "Ver farmácias", href: "/directorio?tipo=FARMACIA" },
  },
  {
    titulo: "A sua identidade, protegida",
    texto:
      "Conta criada com o BI ou Passaporte, ficha de saúde e agregado familiar, com segurança máxima.",
    imagem:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1600&q=70",
    cta: { texto: "Saber mais", href: "/sobre" },
  },
];
