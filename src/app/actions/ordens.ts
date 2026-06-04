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

  // Materiais necessários (campos paralelos: material_descricao[], material_quantidade[], ...)
  const descricoes = formData
    .getAll("material_descricao")
    .map((v) => v.toString());
  const codigos = formData
    .getAll("material_codigo_sap")
    .map((v) => v.toString());
  const quantidades = formData
    .getAll("material_quantidade")
    .map((v) => v.toString());
  const unidades = formData
    .getAll("material_unidade")
    .map((v) => v.toString());

  const materiais = descricoes
    .map((descricao, i) => ({
      ordem_servico_id: data.id,
      descricao: descricao.trim(),
      codigo_sap: codigos[i]?.trim() || null,
      quantidade: quantidades[i] ? Number(quantidades[i]) : 1,
      unidade: unidades[i]?.trim() || "UN",
    }))
    .filter((m) => m.descricao.length > 0);

  if (materiais.length > 0) {
    const { error: errMat } = await supabase
      .from("materiais_os")
      .insert(materiais);
    if (errMat) {
      throw new Error("Erro ao salvar materiais da O.S.: " + errMat.message);
    }
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
