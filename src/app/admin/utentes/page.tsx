import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { utenteAtual } from "@/lib/auth";
import { UtenteAdminControls } from "@/components/admin/UtenteAdminControls";

export default async function AdminUtentesPage() {
  const admin = await utenteAtual();
  if (!admin) redirect("/entrar");
  if (admin.papel !== "ADMIN") redirect("/conta");

  const utentes = await prisma.utente.findMany({
    orderBy: { criadoEm: "desc" },
    take: 200,
    select: {
      id: true,
      nomeCompleto: true,
      numeroDocumento: true,
      papel: true,
      verificado: true,
      ativo: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm font-semibold text-angola-red">← Painel</Link>
        <h1 className="text-2xl font-bold">Gestão de utilizadores</h1>
        <p className="text-gray-600">Defina os níveis de acesso ao portal.</p>
      </div>

      <div className="card divide-y divide-base-line">
        {utentes.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {u.nomeCompleto}{" "}
                {!u.ativo && <span className="badge bg-angola-red/10 text-angola-red-dark">Inativo</span>}
              </p>
              <p className="text-sm text-gray-500">{u.numeroDocumento}</p>
            </div>
            <UtenteAdminControls id={u.id} papel={u.papel} verificado={u.verificado} />
          </div>
        ))}
      </div>
    </div>
  );
}
