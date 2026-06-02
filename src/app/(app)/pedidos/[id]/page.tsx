import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { registrarFollowup } from "@/app/actions/compras";
import {
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_COR,
  STATUS_ITEM_LABEL,
  SITUACAO_FOLLOWUP_LABEL,
  SITUACAO_FOLLOWUP_COR,
  formatarData,
  formatarDataHora,
  formatarMoeda,
} from "@/lib/dominio";

export const dynamic = "force-dynamic";

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pedido } = await supabase
    .from("pedidos_compra")
    .select(
      "*, itens_pedido(*), followups(*), requisicoes_compra(numero_rc, ordens_servico(id, numero_os, frota))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!pedido) notFound();

  const os = pedido.requisicoes_compra?.ordens_servico;
  const followups = (pedido.followups ?? [])
    .slice()
    .sort((a, b) => b.data_contato.localeCompare(a.data_contato));

  return (
    <div className="space-y-6">
      <Link href="/pedidos" className="text-sm text-blue-600 hover:underline">
        ← Voltar para Follow Up
      </Link>

      <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pedido {pedido.numero_pedido}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {pedido.fornecedor}
              {pedido.comprador ? ` · Comprador: ${pedido.comprador}` : ""}
            </p>
            <p className="text-sm text-slate-500">
              {formatarMoeda(pedido.valor_total)} · Previsão:{" "}
              {formatarData(pedido.previsao_entrega)}
            </p>
            {os && (
              <p className="mt-1 text-sm">
                <Link
                  href={`/ordens/${os.id}`}
                  className="text-blue-600 hover:underline"
                >
                  O.S. {os.numero_os} · Frota {os.frota}
                </Link>
              </p>
            )}
          </div>
          <Badge
            texto={STATUS_PEDIDO_LABEL[pedido.status]}
            cor={STATUS_PEDIDO_COR[pedido.status]}
          />
        </div>

        <ul className="mt-4 divide-y divide-slate-100 rounded-lg bg-slate-50 text-sm">
          {pedido.itens_pedido?.map((it) => (
            <li key={it.id} className="flex justify-between px-3 py-2">
              <span>
                {it.descricao}
                {it.codigo_sap ? ` (${it.codigo_sap})` : ""}
              </span>
              <span className="text-slate-500">
                {it.quantidade} {it.unidade} · {STATUS_ITEM_LABEL[it.status_item]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Histórico de Follow Up
        </h2>

        {followups.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {followups.map((f) => (
              <li key={f.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    {formatarDataHora(f.data_contato)}
                  </span>
                  <Badge
                    texto={SITUACAO_FOLLOWUP_LABEL[f.situacao]}
                    cor={SITUACAO_FOLLOWUP_COR[f.situacao]}
                  />
                </div>
                {f.contato_fornecedor && <p>Contato: {f.contato_fornecedor}</p>}
                {f.previsao_entrega && (
                  <p>Nova previsão: {formatarData(f.previsao_entrega)}</p>
                )}
                {f.observacao && <p className="text-slate-600">{f.observacao}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-slate-400">
            Nenhum contato registrado ainda.
          </p>
        )}

        {os && (
          <form
            action={registrarFollowup.bind(null, pedido.id, os.id)}
            className="space-y-3 border-t border-slate-100 pt-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Contato no fornecedor
                </span>
                <input
                  name="contato_fornecedor"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Nova previsão
                </span>
                <input
                  name="previsao_entrega"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Situação
              </span>
              <select
                name="situacao"
                defaultValue="aguardando"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="aguardando">Aguardando</option>
                <option value="em_transporte">Em transporte</option>
                <option value="atrasado">Atrasado</option>
                <option value="entregue">Entregue</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Observação
              </span>
              <input
                name="observacao"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Registrar follow-up
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
