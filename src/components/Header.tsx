import Link from "next/link";
import { Logo } from "./Logo";

export function Header({
  autenticado,
  nome,
}: {
  autenticado: boolean;
  nome: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Início">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-angola-black md:flex">
          <Link href="/directorio" className="hover:text-angola-red">
            Encontrar unidade
          </Link>
          <Link href="/directorio?tipo=FARMACIA" className="hover:text-angola-red">
            Farmácias
          </Link>
          <Link href="/sobre" className="hover:text-angola-red">
            Sobre
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {autenticado ? (
            <>
              <Link href="/conta" className="btn-ghost py-2">
                {nome?.split(" ")[0] ?? "A minha conta"}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn-ghost py-2">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn-ghost py-2">
                Entrar
              </Link>
              <Link href="/registo" className="btn-primary py-2">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
