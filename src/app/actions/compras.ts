"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsuario } from "@/lib/auth";
import type { Enums } from "@/lib/database.types";

function revalidarOrdem(ordemId: string) {
  revalidatePath(`/ordens/${ordemId}`);
  revalidatePath("/ordens");
  revalidatePath("/pedidos");
  revalidatePath("/");
}

// ---------- Requisição de Compra (RC) ----------

export async function criarRC(ordemId: string, formData: FormData) {
  const supabase = await createClient();

  const valorRaw = formData.get("valor_estimado")?.toString();
  const { error } = await supabase.from("requisicoes_compra").insert({
    ordem_servico_id: ordemId,
    numero_rc: formData.get("numero_rc")?.toString().trim() ?? "",
    valor_estimado: valorRaw ? Number(valorRaw) : null,
    observacao: formData.get("observacao")?.toString().trim() || null,
    status: "em_aprovacao",
  });

  if (error) throw new Error("Erro ao criar RC: " + error.message);

  await supabase
    .from("ordens_servico")
    .update({ status: "em_aprovacao" })
    .eq("id", ordemId);

  revalidarOrdem(ordemId);
}

export async function alterarStatusRC(
  rcId: string,
  ordemId: string,
  novoStatus: Enums<"status_rc">,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("requisicoes_compra")
    .update({ status: novoStatus })
    .eq("id", rcId);

  if (error) throw new Error("Erro ao atualizar RC: " + error.message);

  // Reflete o avanço na O.S.
  if (novoStatus === "em_cotacao") {
    await supabase
      .from("ordens_servico")
      .update({ status: "em_cotacao" })
      .eq("id", ordemId);
  }

  revalidarOrdem(ordemId);
}

// ---------- Pedido de Compra ----------

export async function criarPedido(
  rcId: string,
  ordemId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const valorRaw = formData.get("valor_total")?.toString();
  const previsao = formData.get("previsao_entrega")?.toString();

  const { data: pedido, error } = await supabase
    .from("pedidos_compra")
    .insert({
      requisicao_id: rcId,
      numero_pedido: formData.get("numero_pedido")?.toString().trim() ?? "",
      fornecedor: formData.get("fornecedor")?.toString().trim() ?? "",
      comprador: formData.get("comprador")?.toString().trim() || null,
      valor_total: valorRaw ? Number(valorRaw) : null,
      previsao_entrega: previsao || null,
      status: "gerado",
    })
    .select("id")
    .single();

  if (error) throw new Error("Erro ao gerar pedido: " + error.message);

  // Itens (campos paralelos: item_descricao[], item_quantidade[], ...)
  const descricoes = formData.getAll("item_descricao").map((v) => v.toString());
  const quantidades = formData.getAll("item_quantidade").map((v) => v.toString());
  const unidades = formData.getAll("item_unidade").map((v) => v.toString());
  const codigos = formData.getAll("item_codigo_sap").map((v) => v.toString());

  const itens = descricoes
    .map((descricao, i) => ({
      pedido_id: pedido.id,
      descricao: descricao.trim(),
      quantidade: quantidades[i] ? Number(quantidades[i]) : 1,
      unidade: unidades[i]?.trim() || "UN",
      codigo_sap: codigos[i]?.trim() || null,
    }))
    .filter((it) => it.descricao.length > 0);

  if (itens.length > 0) {
    const { error: errItens } = await supabase.from("itens_pedido").insert(itens);
    if (errItens) throw new Error("Erro ao salvar itens: " + errItens.message);
  }

  await supabase
    .from("ordens_servico")
    .update({ status: "aguardando_entrega" })
    .eq("id", ordemId);

  revalidarOrdem(ordemId);
  revalidatePath(`/pedidos/${pedido.id}`);
}

export async function alterarStatusPedido(
  pedidoId: string,
  ordemId: string,
  novoStatus: Enums<"status_pedido">,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pedidos_compra")
    .update({ status: novoStatus })
    .eq("id", pedidoId);

  if (error) throw new Error("Erro ao atualizar pedido: " + error.message);

  revalidarOrdem(ordemId);
  revalidatePath(`/pedidos/${pedidoId}`);
}

// ---------- Follow Up ----------

export async function registrarFollowup(
  pedidoId: string,
  ordemId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const usuario = await getUsuario();

  const previsao = formData.get("previsao_entrega")?.toString();
  const { error } = await supabase.from("followups").insert({
    pedido_id: pedidoId,
    contato_fornecedor: formData.get("contato_fornecedor")?.toString().trim() || null,
    previsao_entrega: previsao || null,
    situacao:
      (formData.get("situacao")?.toString() as Enums<"situacao_followup">) ||
      "aguardando",
    observacao: formData.get("observacao")?.toString().trim() || null,
    registrado_por: usuario?.id ?? null,
  });

  if (error) throw new Error("Erro ao registrar follow-up: " + error.message);

  // Mantém a previsão de entrega do pedido sincronizada
  if (previsao) {
    await supabase
      .from("pedidos_compra")
      .update({ previsao_entrega: previsao })
      .eq("id", pedidoId);
  }

  revalidarOrdem(ordemId);
  revalidatePath(`/pedidos/${pedidoId}`);
}

// ---------- Recebimento (chegada no ponto de materiais) ----------

export async function registrarRecebimento(
  pedidoId: string,
  ordemId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const { error } = await supabase.from("recebimentos").insert({
    pedido_id: pedidoId,
    recebido_por: formData.get("recebido_por")?.toString().trim() || null,
    ponto_material: formData.get("ponto_material")?.toString().trim() || null,
    observacao: formData.get("observacao")?.toString().trim() || null,
  });

  if (error) throw new Error("Erro ao registrar recebimento: " + error.message);

  // Marca pedido e itens como recebidos
  await supabase
    .from("pedidos_compra")
    .update({ status: "recebido" })
    .eq("id", pedidoId);
  await supabase
    .from("itens_pedido")
    .update({ status_item: "recebido" })
    .eq("pedido_id", pedidoId);

  // Gatilho do fluxo: O.S. -> material recebido -> liberada para manutenção
  await supabase
    .from("ordens_servico")
    .update({ status: "liberada_para_manutencao" })
    .eq("id", ordemId);

  revalidarOrdem(ordemId);
  revalidatePath(`/pedidos/${pedidoId}`);
}
