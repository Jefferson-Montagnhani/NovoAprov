import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Usuario = {
  id: string;
  email: string | undefined;
  perfil: Tables<"perfis"> | null;
};

/**
 * Retorna o usuário autenticado e seu perfil. Retorna null se não houver sessão.
 */
export async function getUsuario(): Promise<Usuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, email: user.email, perfil };
}
