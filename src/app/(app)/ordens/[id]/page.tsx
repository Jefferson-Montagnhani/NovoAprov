import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { AcoesStatusOS } from "@/components/AcoesStatusOS";
import { AcoesRC } from "@/components/AcoesRC";
import { FormPedido } from "@/components/FormPedido";
import { criarRC, registrarFollowup, registrarRecebimento } from "@/app/actions/compras";
import { registrarEntrega } from "@/app/actions/entregas";
import {
  STATUS_OS_LABEL,
  STATUS_OS_COR,
  STATUS_RC_LABEL,
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_COR,
  STATUS_ITEM_LABEL,
  SITUACAO_FOLLOWUP_LABEL,
  SITUACAO_FOLLOWUP_COR,
  PRIORIDADE_LABEL,
  TRANSICOES_OS,
  formatarData,
  formatarDataHora,
  formatarMoeda,
} from "@/lib/dominio";

export const dynamic = "force-dynamic";

export default async function OrdemDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ordem } = await supabase
    .from("ordens_servico")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!ordem) notFound();

  const { data: rcs } = await supabase
    .from("requisicoes_compra")
    .select(
      "*, pedidos_compra(*, itens_pedido(*), followups(*), recebimentos(*))",
    )
    .eq("ordem_servico_id", id)
    .order("criado_em", { ascending: false });

  const { data: entregas } = await supabase
    .from("entregas")
    .select("*")
    .eq("ordem_servico_id", id)
    .order("data_entrega", { ascending: false });

  const rc = rcs?.[0] ?? null;
  const pedido = rc?.pedidos_compra?.[0] ?? null;
  const followups = pedido?.followups ?? [];
  const recebimentos = pedido?.recebimentos ?? [];

  return (
    <div className="space-y-6">
      <Link href="/ordens" className="text-sm text-blue-600 hover:underline">
        ← Voltar para Ordens
      </Link>

      {/* Cabeçalho */}
      <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                O.S. {ordem.numero_os}
              </h1>
              <Badge
                texto={STATUS_OS_LABEL[ordem.status]}
                cor={STATUS_OS_COR[ordem.status]}
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Frota <span className="font-medium">{ordem.frota}</span>
              {ordem.equipamento ? ` · ${ordem.equipamento}` : ""} · Prioridade{" "}
              {PRIORIDADE_LABEL[ordem.prioridade]}
            </p>
          </div>
        </div>
        <p className="mt-3 text-slate-700">{ordem.descricao}</p>
        {ordem.solicitante && (
          <p className="mt-1 text-sm text-slate-500">
            Solicitante: {ordem.solicitante}
          </p>
        )}
        {ordem.tem_estoque != null && (
          <p className="mt-1 text-sm">
            Estoque:{" "}
            {ordem.tem_estoque ? (
              <span className="text-emerald-600">Disponível</span>
            ) : (
              <span className="text-amber-600">Sem estoque (seguiu p/ compra)</span>
            )}
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">
            Avançar status
          </p>
          <AcoesStatusOS ordemId={ordem.id} transicoes={TRANSICOES_OS[ordem.status]} />
        </div>
      </div>

      {/* Requisição de Compra */}
      <Secao titulo="1. Requisição de Compra (RC)">
        {!rc ? (
          <form action={criarRC.bind(null, ordem.id)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Nº da RC" name="numero_rc" required />
              <Campo label="Valor estimado (R$)" name="valor_estimado" type="number" />
            </div>
            <Campo label="Observação" name="observacao" />
            <div className="flex justify-end">
              <BotaoEnviar>Gerar RC</BotaoEnviar>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">RC {rc.numero_rc}</p>
                <p className="text-sm text-slate-500">
                  {rc.valor_estimado != null
                    ? `Estimado: ${formatarMoeda(rc.valor_estimado)} · `
                    : ""}
                  {formatarData(rc.criado_em)}
                </p>
                {rc.observacao && (
                  <p className="text-sm text-slate-500">{rc.observacao}</p>
                )}
              </div>
              <Badge
                texto={STATUS_RC_LABEL[rc.status]}
                cor="bg-amber-100 text-amber-700"
              />
            </div>
            <AcoesRC rcId={rc.id} ordemId={ordem.id} status={rc.status} />
          </div>
        )}
      </Secao>

      {/* Pedido de Compra */}
      {rc && (
        <Secao titulo="2. Pedido de Compra">
          {!pedido ? (
            rc.status === "em_cotacao" || rc.status === "aprovada" ? (
              <FormPedido rcId={rc.id} ordemId={ordem.id} />
            ) : (
              <p className="text-sm text-slate-400">
                Aprove e cote a RC para gerar o pedido de compra.
              </p>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/pedidos/${pedido.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Pedido {pedido.numero_pedido}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {pedido.fornecedor}
                    {pedido.comprador ? ` · Comprador: ${pedido.comprador}` : ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatarMoeda(pedido.valor_total)} · Previsão:{" "}
                    {formatarData(pedido.previsao_entrega)}
                  </p>
                </div>
                <Badge
                  texto={STATUS_PEDIDO_LABEL[pedido.status]}
                  cor={STATUS_PEDIDO_COR[pedido.status]}
                />
              </div>
              <ul className="divide-y divide-slate-100 rounded-lg bg-slate-50 text-sm">
                {pedido.itens_pedido?.map((it) => (
                  <li key={it.id} className="flex justify-between px-3 py-2">
                    <span>
                      {it.descricao}
                      {it.codigo_sap ? ` (${it.codigo_sap})` : ""}
                    </span>
                    <span className="text-slate-500">
                      {it.quantidade} {it.unidade} ·{" "}
                      {STATUS_ITEM_LABEL[it.status_item]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Secao>
      )}

      {/* Follow Up */}
      {pedido && (
        <Secao titulo="3. Follow Up com o fornecedor">
          <div className="space-y-4">
            {followups.length > 0 && (
              <ul className="space-y-2">
                {followups
                  .slice()
                  .sort((a, b) => b.data_contato.localeCompare(a.data_contato))
                  .map((f) => (
                    <li
                      key={f.id}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">
                          {formatarDataHora(f.data_contato)}
                        </span>
                        <Badge
                          texto={SITUACAO_FOLLOWUP_LABEL[f.situacao]}
                          cor={SITUACAO_FOLLOWUP_COR[f.situacao]}
                        />
                      </div>
                      {f.contato_fornecedor && (
                        <p>Contato: {f.contato_fornecedor}</p>
                      )}
                      {f.previsao_entrega && (
                        <p>Nova previsão: {formatarData(f.previsao_entrega)}</p>
                      )}
                      {f.observacao && <p className="text-slate-600">{f.observacao}</p>}
                    </li>
                  ))}
              </ul>
            )}

            <form
              action={registrarFollowup.bind(null, pedido.id, ordem.id)}
              className="space-y-3 border-t border-slate-100 pt-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Contato no fornecedor" name="contato_fornecedor" />
                <Campo label="Nova previsão" name="previsao_entrega" type="date" />
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
              <Campo label="Observação" name="observacao" />
              <div className="flex justify-end">
                <BotaoEnviar>Registrar follow-up</BotaoEnviar>
              </div>
            </form>
          </div>
        </Secao>
      )}

      {/* Recebimento */}
      {pedido && (
        <Secao titulo="4. Recebimento (ponto de materiais)">
          {recebimentos.length > 0 ? (
            <div className="space-y-2">
              {recebimentos.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                >
                  Recebido em {formatarDataHora(r.data_recebimento)}
                  {r.recebido_por ? ` por ${r.recebido_por}` : ""}
                  {r.ponto_material ? ` · ${r.ponto_material}` : ""}
                  {r.observacao ? ` — ${r.observacao}` : ""}
                </div>
              ))}
              <p className="text-sm text-emerald-700">
                ✓ Material recebido — O.S. liberada para manutenção.
              </p>
            </div>
          ) : (
            <form
              action={registrarRecebimento.bind(null, pedido.id, ordem.id)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Recebido por" name="recebido_por" />
                <Campo label="Ponto de materiais" name="ponto_material" />
              </div>
              <Campo label="Observação" name="observacao" />
              <div className="flex justify-end">
                <BotaoEnviar>Registrar recebimento</BotaoEnviar>
              </div>
            </form>
          )}
        </Secao>
      )}

      {/* Entrega */}
      <Secao titulo="5. Entrega do material para a execução">
        {entregas && entregas.length > 0 && (
          <ul className="mb-4 space-y-2">
            {entregas.map((e) => (
              <li key={e.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <p className="font-medium">
                  {e.material_descricao} — {e.quantidade}
                </p>
                <p className="text-slate-500">
                  Retirado por {e.retirado_por_nome}
                  {e.retirado_por_matricula
                    ? ` (mat. ${e.retirado_por_matricula})`
                    : ""}{" "}
                  em {formatarDataHora(e.data_entrega)}
                </p>
                {e.observacao && (
                  <p className="text-slate-600">{e.observacao}</p>
                )}
              </li>
            ))}
          </ul>
        )}
        <form
          action={registrarEntrega.bind(null, ordem.id)}
          className="space-y-3 border-t border-slate-100 pt-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Campo label="Material entregue" name="material_descricao" required />
            </div>
            <Campo label="Quantidade" name="quantidade" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Retirado por (nome)" name="retirado_por_nome" required />
            <Campo label="Matrícula" name="retirado_por_matricula" />
          </div>
          <Campo label="Observação" name="observacao" />
          <div className="flex justify-end">
            <BotaoEnviar>Registrar entrega</BotaoEnviar>
          </div>
        </form>
      </Secao>
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      />
    </label>
  );
}

function BotaoEnviar({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
    >
      {children}
    </button>
  );
}
