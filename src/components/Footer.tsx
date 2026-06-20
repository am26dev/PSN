import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-base-line bg-angola-black text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold">
            <span className="text-white">Portal de Saúde Nacional</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            A saúde de Angola num só lugar — hospitais públicos, clínicas
            privadas e farmácias.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-angola-gold">Navegação</p>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/directorio" className="hover:text-angola-gold">Encontrar unidade</Link></li>
            <li><Link href="/registo" className="hover:text-angola-gold">Criar conta de Utente</Link></li>
            <li><Link href="/sobre" className="hover:text-angola-gold">Sobre o PSN</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-angola-gold">Segurança e dados</p>
          <p className="text-white/70">
            Os seus dados são tratados ao abrigo da Lei n.º 22/11 de Proteção de
            Dados Pessoais de Angola. Ligação cifrada e palavras-passe protegidas
            com Argon2.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-white/50">
          © {new Date().getFullYear()} Portal de Saúde Nacional. Valores em
          Kwanza (Kz).
        </p>
      </div>
    </footer>
  );
}
