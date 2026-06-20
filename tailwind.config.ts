import type { Config } from "tailwindcss";

/**
 * Paleta cromática do PSN — cores da Bandeira de Angola, regra 60/30/10:
 *  - 60% Base neutra (branco/cinza claro + texto PRETO da bandeira) → legibilidade e acessibilidade.
 *  - 30% Vermelho de Angola → cabeçalhos, navegação e superfícies de marca.
 *  - 10% Amarelo/Dourado do emblema → destaques, botões de ação e ênfases.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vermelho oficial da bandeira de Angola
        angola: {
          red: "#CC092F",
          "red-dark": "#A30724",
          "red-light": "#E63957",
          black: "#0A0A0A",
          gold: "#FFCB00",
          "gold-dark": "#E0B200",
          "gold-light": "#FFE066",
        },
        base: {
          DEFAULT: "#FFFFFF",
          soft: "#F7F7F8",
          muted: "#EDEDF0",
          line: "#E2E2E7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(10,10,10,0.06), 0 8px 24px rgba(10,10,10,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
