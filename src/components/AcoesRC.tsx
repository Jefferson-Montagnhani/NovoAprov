"use client";

import { useTransition } from "react";
import { alterarStatusRC } from "@/app/actions/compras";
import type { Enums } from "@/lib/database.types";

export function AcoesRC({
  rcId,
  ordemId,
  status,
}: {
  rcId: string;
  ordemId: string;
  status: Enums<"status_rc">;
}) {
  const [pending, startTransition] = useTransition();

  function alterar(novo: Enums<"status_rc">) {
    startTransition(() => alterarStatusRC(rcId, ordemId, novo));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "em_aprovacao" && (
        <>
          <Btn pending={pending} onClick={() => alterar("aprovada")}>
            Aprovar RC
          </Btn>
          <Btn pending={pending} variante="perigo" onClick={() => alterar("reprovada")}>
            Reprovar
          </Btn>
        </>
      )}
      {status === "aprovada" && (
        <Btn pending={pending} onClick={() => alterar("em_cotacao")}>
          Enviar para cotação
        </Btn>
      )}
    </div>
  );
}

function Btn({
  children,
  onClick,
  pending,
  variante,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  variante?: "perigo";
}) {
  return (
    <button
      disabled={pending}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
        variante === "perigo"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-slate-900 text-white hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
