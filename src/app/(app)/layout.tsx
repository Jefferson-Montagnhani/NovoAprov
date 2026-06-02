import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuario();
  if (!usuario) redirect("/login");

  const nome = usuario.perfil?.nome || usuario.email || "Usuário";

  return (
    <div className="flex flex-1 flex-col">
      <Nav nome={nome} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
