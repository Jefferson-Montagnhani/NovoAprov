"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuario } from "@/lib/auth";

export async function registrarEntrega(ordemId: string, formData: FormData) {
  const supabase = await createClient();
  const usuario = await getUsuario();

  const qtdRaw = formData.get("quantidade")?.toString();
  const { error } = await supabase.from("entregas").insert({
    ordem_servico_id: ordemId,
    material_descricao: formData.get("material_descricao")?.toString().trim() ?? "",
    quantidade: qtdRaw ? Number(qtdRaw) : 1,
    retirado_por_nome: formData.get("retirado_por_nome")?.toString().trim() ?? "",
    retirado_por_matricula:
      formData.get("retirado_por_matricula")?.toString().trim() || null,
    observacao: formData.get("observacao")?.toString().trim() || null,
    entregue_por: usuario?.id ?? null,
  });

  if (error) throw new Error("Erro ao registrar entrega: " + error.message);

  // Após entregar o material para a execução, a O.S. avança.
  await supabase
    .from("ordens_servico")
    .update({ status: "material_entregue" })
    .eq("id", ordemId);

  revalidatePath(`/ordens/${ordemId}`);
  revalidatePath("/ordens");
  revalidatePath("/entregas");
  revalidatePath("/");
}
