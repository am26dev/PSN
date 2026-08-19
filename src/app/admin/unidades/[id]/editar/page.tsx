import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { utenteAtual } from "@/lib/auth";
import { UnidadeForm } from "@/components/admin/UnidadeForm";
import { obterUnidadeDetalhe } from "@/lib/services/unidade.service";

export default async function EditarUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const { id } = await params;
  const u = await obterUnidadeDetalhe(id);
  if (!u) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/unidades" className="text-sm font-semibold text-angola-red">← Unidades</Link>
      <h1 className="text-2xl font-bold">Editar unidade</h1>
      <UnidadeForm
        id={u.id}
        inicial={{
          nome: u.nome,
          tipo: u.tipo,
          provincia: u.provincia,
          municipio: u.municipio,
          morada: u.morada ?? "",
          telefone: u.telefone ?? "",
          horario: u.horario ?? "",
          urgencia24h: u.urgencia24h,
          logoUrl: u.logoUrl ?? "",
          bannerUrl: u.bannerUrl ?? "",
          descricao: u.descricao ?? "",
          ativo: u.ativo,
        }}
      />
    </div>
  );
}
