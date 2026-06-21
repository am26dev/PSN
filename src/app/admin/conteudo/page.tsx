import Link from "next/link";
import { redirect } from "next/navigation";
import { utenteAtual } from "@/lib/auth";
import { CAMPOS_CONTEUDO, obterConteudos } from "@/lib/conteudo";
import { ConteudoForm } from "@/components/admin/ConteudoForm";

export const metadata = { title: "Conteúdo do site — PSN" };

export default async function AdminConteudoPage() {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const valores = await obterConteudos();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin" className="text-sm font-semibold text-angola-red">← Painel</Link>
        <h1 className="text-2xl font-bold">Conteúdo do site</h1>
        <p className="text-gray-600">
          Edite os textos das páginas públicas do portal. As alterações são
          aplicadas de imediato.
        </p>
      </div>

      <ConteudoForm campos={CAMPOS_CONTEUDO} valores={valores} />
    </div>
  );
}
