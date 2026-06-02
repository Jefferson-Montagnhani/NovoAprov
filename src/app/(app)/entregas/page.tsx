import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import {
  STATUS_OS_LABEL,
  STATUS_OS_COR,
  formatarDataHora,
} from "@/lib/dominio";

export const dynamic = "force-dynamic";

export default async function EntregasPage() {
  const supabase = await createClient();

  const { data: aguardando } = await supabase
    .from("ordens_servico")
    .select("id, numero_os, frota, status")
    .in("status", ["liberada_para_manutencao", "programada"])
    .order("atualizado_em", { ascending: false });

  const { data: entregas } = await supabase
    .from("entregas")
    .select("*, ordens_servico(numero_os, frota)")
    .order("data_entrega", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entregas de Material</h1>
        <p className="text-sm text-slate-500">
          Materiais prontos para entrega à execução e histórico de retiradas.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Aguardando entrega
        </h2>
        <div className="flex flex-wrap gap-2">
          {(aguardando ?? []).map((o) => (
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
          {(!aguardando || aguardando.length === 0) && (
            <p className="text-sm text-slate-400">
              Nenhuma O.S. aguardando entrega no momento.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Histórico de entregas
        </h2>
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">O.S.</th>
                <th className="px-4 py-2">Material</th>
                <th className="px-4 py-2">Qtd</th>
                <th className="px-4 py-2">Retirado por</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(entregas ?? []).map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-600">
                    {e.ordens_servico?.numero_os ?? "—"}
                  </td>
                  <td className="px-4 py-2">{e.material_descricao}</td>
                  <td className="px-4 py-2 text-slate-600">{e.quantidade}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {e.retirado_por_nome}
                    {e.retirado_por_matricula
                      ? ` (${e.retirado_por_matricula})`
                      : ""}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {formatarDataHora(e.data_entrega)}
                  </td>
                </tr>
              ))}
              {(!entregas || entregas.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Nenhuma entrega registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
