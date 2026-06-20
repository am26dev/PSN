import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { utenteAtual } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Portal de Saúde Nacional — Angola",
  description:
    "Hospitais públicos, clínicas privadas e farmácias de toda a Angola num só portal. Marque consultas, consulte a sua ficha de saúde e faça a gestão do seu agregado familiar.",
  manifest: "/manifest.webmanifest",
  applicationName: "PSN",
  authors: [{ name: "Portal de Saúde Nacional" }],
};

export const viewport: Viewport = {
  themeColor: "#CC092F",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const utente = await utenteAtual();

  return (
    <html lang="pt-PT">
      <body>
        <Header
          autenticado={!!utente}
          nome={utente?.nomeCompleto ?? null}
        />
        <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
