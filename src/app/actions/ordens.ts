"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsuario } from "@/lib/auth";
import type { Enums } from "@/lib/database.types";

export async function criarOrdem(formData: FormData) {
  const supabase = await createClient();
  const usuario = await getUsuario();

  const temEstoqueRaw = formData.get("tem_estoque")?.toString();
  const tem_estoque =
    temEstoqueRaw === "sim" ? true : temEstoqueRaw === "nao" ? false : null;

  const { data, error } = await supabase
    .from("ordens_servico")
    .insert({
      numero_os: formData.get("numero_os")?.toString().trim() ?? "",
      frota: formData.get("frota")?.toString().trim() ?? "",
      equipamento: formData.get("equipamento")?.toString().trim() || null,
      descricao: formData.get("descricao")?.toString().trim() ?? "",
      prioridade:
        (formData.get("prioridade")?.toString() as Enums<"prioridade_os">) ||
        "media",
      solicitante: formData.get("solicitante")?.toString().trim() || null,
      tem_estoque,
      status: tem_estoque === false ? "aguardando_compra" : "aberta",
      criado_por: usuario?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("Erro ao criar O.S.: " + error.message);
  }

  revalidatePath("/ordens");
  redirect(`/ordens/${data.id}`);
}

export async function alterarStatusOrdem(
  ordemId: string,
  novoStatus: Enums<"status_os">,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ordens_servico")
    .update({ status: novoStatus })
    .eq("id", ordemId);

  if (error) throw new Error("Erro ao alterar status: " + error.message);

  revalidatePath(`/ordens/${ordemId}`);
  revalidatePath("/ordens");
  revalidatePath("/");
}
