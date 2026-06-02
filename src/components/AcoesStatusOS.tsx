"use client";

import { useTransition } from "react";
import { alterarStatusOrdem } from "@/app/actions/ordens";
import { STATUS_OS_LABEL } from "@/lib/dominio";
import type { Enums } from "@/lib/database.types";

export function AcoesStatusOS({
  ordemId,
  transicoes,
}: {
  ordemId: string;
  transicoes: Enums<"status_os">[];
}) {
  const [pending, startTransition] = useTransition();

  if (transicoes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {transicoes.map((destino) => (
        <button
          key={destino}
          disabled={pending}
          onClick={() =>
            startTransition(() => alterarStatusOrdem(ordemId, destino))
          }
          className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
            destino === "cancelada"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {destino === "cancelada" ? "Cancelar O.S." : `→ ${STATUS_OS_LABEL[destino]}`}
        </button>
      ))}
    </div>
  );
}
