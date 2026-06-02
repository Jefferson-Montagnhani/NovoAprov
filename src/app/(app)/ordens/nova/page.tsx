import Link from "next/link";
import { criarOrdem } from "@/app/actions/ordens";

export default function NovaOrdemPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/ordens" className="text-sm text-blue-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Nova Ordem de Serviço
        </h1>
      </div>

      <form
        action={criarOrdem}
        className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-slate-200"
      >
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nº da O.S." name="numero_os" required />
          <Campo label="Frota / Equipamento (nº)" name="frota" required />
        </div>

        <Campo label="Equipamento (descrição)" name="equipamento" />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Descrição do serviço
          </span>
          <textarea
            name="descricao"
            required
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Prioridade
            </span>
            <select
              name="prioridade"
              defaultValue="media"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </label>
          <Campo label="Solicitante" name="solicitante" />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Tem em estoque?
          </span>
          <select
            name="tem_estoque"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="">Ainda não verificado</option>
            <option value="sim">Sim — disponível em estoque</option>
            <option value="nao">Não — seguir para compra</option>
          </select>
          <span className="mt-1 block text-xs text-slate-400">
            Se &quot;Não&quot;, a O.S. já entra como &quot;Aguardando compra&quot;.
          </span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/ordens"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Criar O.S.
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        name={name}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      />
    </label>
  );
}
