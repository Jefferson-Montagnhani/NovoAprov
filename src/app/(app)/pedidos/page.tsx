import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import {
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_COR,
  formatarData,
} from "@/lib/dominio";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const supabase = await createClient();

  const { data: pedidos } = await supabase
    .from("pedidos_compra")
    .select(
      "*, requisicoes_compra(numero_rc, ordens_servico(id, numero_os, frota))",
    )
    .order("previsao_entrega", { ascending: true });

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow Up de Pedidos</h1>
        <p className="text-sm text-slate-500">
          Acompanhe a entrega dos materiais junto aos fornecedores.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Pedido</th>
              <th className="px-4 py-2">O.S. / Frota</th>
              <th className="px-4 py-2">Fornecedor</th>
              <th className="px-4 py-2">Previsão</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(pedidos ?? []).map((p) => {
              const os = p.requisicoes_compra?.ordens_servico;
              const atrasado =
                p.previsao_entrega &&
                p.previsao_entrega < hoje &&
                p.status !== "recebido" &&
                p.status !== "cancelado";
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
                  <td className="px-4 py-2 text-slate-600">
                    {os ? `${os.numero_os} · Frota ${os.frota}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{p.fornecedor}</td>
                  <td
                    className={`px-4 py-2 ${atrasado ? "font-semibold text-red-600" : "text-slate-600"}`}
                  >
                    {formatarData(p.previsao_entrega)}
                    {atrasado ? " ⚠️" : ""}
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
                  Nenhum pedido gerado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
