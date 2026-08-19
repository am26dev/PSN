import Link from "next/link";
import { redirect } from "next/navigation";
import { utenteAtual } from "@/lib/auth";
import { UnidadeForm } from "@/components/admin/UnidadeForm";

export default async function NovaUnidadePage() {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/unidades" className="text-sm font-semibold text-angola-red">← Unidades</Link>
      <h1 className="text-2xl font-bold">Nova unidade</h1>
      <UnidadeForm />
    </div>
  );
}
