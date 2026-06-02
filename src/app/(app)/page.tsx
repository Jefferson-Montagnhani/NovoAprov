import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import {
  STATUS_OS_LABEL,
  STATUS_OS_COR,
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_COR,
  formatarData,
} from "@/lib/dominio";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: ordens } = await supabase
    .from("ordens_servico")
    .select("id, numero_os, frota, status");

  const { data: pedidos } = await supabase
    .from("pedidos_compra")
    .select(
      "id, numero_pedido, fornecedor, status, previsao_entrega, requisicao_id, requisicoes_compra(ordem_servico_id, ordens_servico(numero_os))",
    )
    .neq("status", "recebido")
    .neq("status", "cancelado")
    .order("previsao_entrega", { ascending: true });

  const total = ordens?.length ?? 0;
  const emCompra =
    ordens?.filter((o) =>
      [
        "aguardando_compra",
        "em_aprovacao",
        "em_cotacao",
        "pedido_gerado",
        "aguardando_entrega",
      ].includes(o.status),
    ).length ?? 0;
  const liberadas =
    ordens?.filter((o) => o.status === "liberada_para_manutencao").length ?? 0;
  const concluidas =
    ordens?.filter((o) => o.status === "concluida").length ?? 0;

  const hoje = new Date().toISOString().slice(0, 10);
  const atrasados =
    pedidos?.filter((p) => p.previsao_entrega && p.previsao_entrega < hoje) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="text-sm text-slate-500">
          Visão geral do aprovisionamento e follow-up de compras.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi titulo="Ordens de Serviço" valor={total} />
        <Kpi titulo="Em processo de compra" valor={emCompra} />
        <Kpi titulo="Liberadas p/ manutenção" valor={liberadas} destaque />
        <Kpi titulo="Concluídas" valor={concluidas} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Pedidos em follow-up
          </h2>
          <Link href="/pedidos" className="text-sm text-blue-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {atrasados.length > 0 && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            ⚠️ {atrasados.length} pedido(s) com entrega atrasada.
          </p>
        )}

        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Pedido</th>
                <th className="px-4 py-2">O.S.</th>
                <th className="px-4 py-2">Fornecedor</th>
                <th className="px-4 py-2">Previsão</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pedidos ?? []).map((p) => {
                const numeroOs =
                  p.requisicoes_compra?.ordens_servico?.numero_os ?? "—";
                const atrasado =
                  p.previsao_entrega && p.previsao_entrega < hoje;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/pedidos/${p.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {p.numero_pedido}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{numeroOs}</td>
                    <td className="px-4 py-2 text-slate-600">{p.fornecedor}</td>
                    <td
                      className={`px-4 py-2 ${atrasado ? "font-semibold text-red-600" : "text-slate-600"}`}
                    >
                      {formatarData(p.previsao_entrega)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        texto={STATUS_PEDIDO_LABEL[p.status]}
                        cor={STATUS_PEDIDO_COR[p.status]}
                      />
                    </td>
                  </tr>
                );
              })}
              {(!pedidos || pedidos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Nenhum pedido em acompanhamento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Liberadas para manutenção
        </h2>
        <div className="flex flex-wrap gap-2">
          {ordens
            ?.filter((o) => o.status === "liberada_para_manutencao")
            .map((o) => (
              <Link
                key={o.id}
                href={`/ordens/${o.id}`}
                className="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:ring-slate-400"
              >
                <span className="font-medium">{o.numero_os}</span>{" "}
                <span className="text-slate-500">· Frota {o.frota}</span>{" "}
                <Badge
                  texto={STATUS_OS_LABEL[o.status]}
                  cor={STATUS_OS_COR[o.status]}
                />
              </Link>
            ))}
          {liberadas === 0 && (
            <p className="text-sm text-slate-400">
              Nenhuma O.S. liberada no momento.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ${
        destaque
          ? "bg-emerald-50 ring-emerald-200"
          : "bg-white ring-slate-200"
      }`}
    >
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{valor}</p>
    </div>
  );
}
