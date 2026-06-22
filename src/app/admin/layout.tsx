import Link from "next/link";
import { redirect } from "next/navigation";
import { utenteAtual } from "@/lib/auth";

const NAVEGACAO = [
  ["/admin", "Visão geral"],
  ["/admin/unidades", "Unidades"],
  ["/admin/conteudo", "Conteúdo"],
  ["/admin/utentes", "Utilizadores"],
  ["/admin/verificacoes", "Verificações"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  return (
    <div className="space-y-7">
      <nav className="sticky top-16 z-30 -mx-2 overflow-x-auto rounded-2xl border border-base-line bg-white/95 p-2 shadow-card backdrop-blur" aria-label="Gestão administrativa">
        <div className="flex min-w-max gap-1">
          {NAVEGACAO.map(([href, texto]) => (
            <Link key={href} href={href} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-angola-red hover:text-white">
              {texto}
            </Link>
          ))}
          <Link href="/" className="ml-2 rounded-xl border border-base-line px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-base-muted">
            Ver portal ↗
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
