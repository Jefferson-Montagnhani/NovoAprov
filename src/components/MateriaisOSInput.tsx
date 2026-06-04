"use client";

import { useState } from "react";

type Linha = {
  descricao: string;
  codigo: string;
  quantidade: string;
  unidade: string;
};

const LINHA_VAZIA: Linha = {
  descricao: "",
  codigo: "",
  quantidade: "1",
  unidade: "UN",
};

/**
 * Lista dinâmica dos materiais necessários para o serviço da O.S.
 * Os campos usam nomes paralelos (material_descricao[], material_codigo_sap[], ...)
 * lidos via FormData.getAll na action `criarOrdem`.
 */
export function MateriaisOSInput() {
  const [materiais, setMateriais] = useState<Linha[]>([{ ...LINHA_VAZIA }]);

  function atualizar(i: number, campo: keyof Linha, valor: string) {
    setMateriais((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)),
    );
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-slate-700">
        Materiais necessários
      </span>
      <p className="mb-2 text-xs text-slate-400">
        Liste os materiais que o serviço vai exigir. Linhas em branco são
        ignoradas.
      </p>

      <div className="space-y-2">
        {materiais.map((linha, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              name="material_descricao"
              placeholder="Descrição do material"
              value={linha.descricao}
              onChange={(e) => atualizar(i, "descricao", e.target.value)}
              className="col-span-5 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
            />
            <input
              name="material_codigo_sap"
              placeholder="Cód. SAP"
              value={linha.codigo}
              onChange={(e) => atualizar(i, "codigo", e.target.value)}
              className="col-span-3 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
            />
            <input
              name="material_quantidade"
              type="number"
              step="any"
              min="0"
              placeholder="Qtd"
              value={linha.quantidade}
              onChange={(e) => atualizar(i, "quantidade", e.target.value)}
              className="col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
            />
            <input
              name="material_unidade"
              placeholder="UN"
              value={linha.unidade}
              onChange={(e) => atualizar(i, "unidade", e.target.value)}
              className="col-span-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
            />
            <button
              type="button"
              onClick={() =>
                setMateriais((prev) =>
                  prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                )
              }
              disabled={materiais.length === 1}
              className="col-span-1 rounded-lg text-sm text-red-500 hover:bg-red-50 disabled:opacity-30"
              aria-label="Remover material"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setMateriais((prev) => [...prev, { ...LINHA_VAZIA }])}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        + Adicionar material
      </button>
    </div>
  );
}
