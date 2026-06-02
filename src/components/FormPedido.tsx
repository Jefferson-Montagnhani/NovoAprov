"use client";

import { useState } from "react";
import { criarPedido } from "@/app/actions/compras";

type Linha = { descricao: string; quantidade: string; unidade: string; codigo: string };

const LINHA_VAZIA: Linha = {
  descricao: "",
  quantidade: "1",
  unidade: "UN",
  codigo: "",
};

export function FormPedido({
  rcId,
  ordemId,
}: {
  rcId: string;
  ordemId: string;
}) {
  const [itens, setItens] = useState<Linha[]>([{ ...LINHA_VAZIA }]);

  function atualizar(i: number, campo: keyof Linha, valor: string) {
    setItens((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)),
    );
  }

  return (
    <form
      action={criarPedido.bind(null, rcId, ordemId)}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nº do Pedido" name="numero_pedido" required />
        <Campo label="Fornecedor" name="fornecedor" required />
        <Campo label="Comprador" name="comprador" />
        <Campo label="Valor total (R$)" name="valor_total" type="number" />
        <Campo label="Previsão de entrega" name="previsao_entrega" type="date" />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Itens</p>
        <div className="space-y-2">
          {itens.map((linha, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                name="item_descricao"
                placeholder="Descrição do material"
                value={linha.descricao}
                onChange={(e) => atualizar(i, "descricao", e.target.value)}
                className="col-span-5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                name="item_codigo_sap"
                placeholder="Cód. SAP"
                value={linha.codigo}
                onChange={(e) => atualizar(i, "codigo", e.target.value)}
                className="col-span-3 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                name="item_quantidade"
                type="number"
                step="any"
                placeholder="Qtd"
                value={linha.quantidade}
                onChange={(e) => atualizar(i, "quantidade", e.target.value)}
                className="col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                name="item_unidade"
                placeholder="UN"
                value={linha.unidade}
                onChange={(e) => atualizar(i, "unidade", e.target.value)}
                className="col-span-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setItens((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="col-span-1 rounded-lg text-sm text-red-500 hover:bg-red-50"
                aria-label="Remover item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItens((prev) => [...prev, { ...LINHA_VAZIA }])}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Adicionar item
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Gerar Pedido de Compra
        </button>
      </div>
    </form>
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
