import Link from "next/link";
import { redirect } from "next/navigation";
import { utenteAtual } from "@/lib/auth";
import { PerfilForm } from "@/components/PerfilForm";

export default async function PerfilPage() {
  const utente = await utenteAtual();
  if (!utente) redirect("/entrar");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/conta" className="text-sm font-semibold text-angola-red">← A minha conta</Link>
      <div>
        <h1 className="text-2xl font-bold">Definições do perfil</h1>
        <p className="mt-1 text-gray-600">Atualize os seus dados e a sua foto.</p>
      </div>

      <PerfilForm
        temAvatar={!!utente.avatarKey}
        inicial={{
          nomeCompleto: utente.nomeCompleto,
          telefone: utente.telefone ?? "",
          email: utente.email ?? "",
          nif: utente.nif ?? "",
          morada: utente.morada ?? "",
          provincia: utente.provincia ?? "",
          municipio: utente.municipio ?? "",
        }}
      />
    </div>
  );
}
