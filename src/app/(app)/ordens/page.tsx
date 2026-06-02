import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import {
  STATUS_OS_LABEL,
  STATUS_OS_COR,
  PRIORIDADE_LABEL,
  formatarData,
} from "@/lib/dominio";

export const dynamic = "force-dynamic";

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("ordens_servico")
    .select("*")
    .order("criado_em", { ascending: false });

  if (q) {
    query = query.or(
      `numero_os.ilike.%${q}%,frota.ilike.%${q}%,descricao.ilike.%${q}%`,
    );
  }

  const { data: ordens } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ordens de Serviço
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhe cada O.S. da abertura até a entrega do material.
          </p>
        </div>
        <Link
          href="/ordens/nova"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          + Nova O.S.
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nº O.S., frota ou descrição..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-300"
        >
          Buscar
        </button>
      </form>

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Nº O.S.</th>
              <th className="px-4 py-2">Frota</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Prioridade</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Aberta em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(ordens ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link
                    href={`/ordens/${o.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {o.numero_os}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">{o.frota}</td>
                <td className="max-w-xs truncate px-4 py-2 text-slate-600">
                  {o.descricao}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {PRIORIDADE_LABEL[o.prioridade]}
                </td>
                <td className="px-4 py-2">
                  <Badge
                    texto={STATUS_OS_LABEL[o.status]}
                    cor={STATUS_OS_COR[o.status]}
                  />
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {formatarData(o.criado_em)}
                </td>
              </tr>
            ))}
            {(!ordens || ordens.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Nenhuma O.S. encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
