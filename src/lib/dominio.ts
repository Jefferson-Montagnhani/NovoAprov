import type { Enums } from "@/lib/database.types";

// ---------- Rótulos legíveis ----------

export const STATUS_OS_LABEL: Record<Enums<"status_os">, string> = {
  aberta: "Aberta",
  verificando_estoque: "Verificando estoque",
  disponivel_estoque: "Disponível em estoque",
  aguardando_compra: "Aguardando compra",
  em_aprovacao: "Em aprovação (RC)",
  em_cotacao: "Em cotação",
  pedido_gerado: "Pedido gerado",
  aguardando_entrega: "Aguardando entrega (follow-up)",
  material_recebido: "Material recebido",
  liberada_para_manutencao: "Liberada para manutenção",
  programada: "Programada",
  material_entregue: "Material entregue",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const PRIORIDADE_LABEL: Record<Enums<"prioridade_os">, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const STATUS_RC_LABEL: Record<Enums<"status_rc">, string> = {
  em_aprovacao: "Em aprovação",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  em_cotacao: "Em cotação",
};

export const STATUS_PEDIDO_LABEL: Record<Enums<"status_pedido">, string> = {
  gerado: "Gerado",
  aprovado: "Aprovado",
  recebido_parcial: "Recebido parcial",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

export const STATUS_ITEM_LABEL: Record<Enums<"status_item">, string> = {
  pendente: "Pendente",
  recebido: "Recebido",
};

export const SITUACAO_FOLLOWUP_LABEL: Record<
  Enums<"situacao_followup">,
  string
> = {
  aguardando: "Aguardando",
  em_transporte: "Em transporte",
  atrasado: "Atrasado",
  entregue: "Entregue",
};

export const PAPEL_LABEL: Record<Enums<"papel_usuario">, string> = {
  admin: "Administrador",
  manutencao: "Manutenção",
  compras: "Compras",
  almoxarifado: "Almoxarifado",
};

// ---------- Cores (classes Tailwind) por status ----------

export const STATUS_OS_COR: Record<Enums<"status_os">, string> = {
  aberta: "bg-slate-100 text-slate-700",
  verificando_estoque: "bg-slate-100 text-slate-700",
  disponivel_estoque: "bg-emerald-100 text-emerald-700",
  aguardando_compra: "bg-amber-100 text-amber-700",
  em_aprovacao: "bg-amber-100 text-amber-700",
  em_cotacao: "bg-amber-100 text-amber-700",
  pedido_gerado: "bg-blue-100 text-blue-700",
  aguardando_entrega: "bg-indigo-100 text-indigo-700",
  material_recebido: "bg-cyan-100 text-cyan-700",
  liberada_para_manutencao: "bg-emerald-100 text-emerald-700",
  programada: "bg-violet-100 text-violet-700",
  material_entregue: "bg-teal-100 text-teal-700",
  concluida: "bg-green-600 text-white",
  cancelada: "bg-red-100 text-red-700",
};

export const SITUACAO_FOLLOWUP_COR: Record<
  Enums<"situacao_followup">,
  string
> = {
  aguardando: "bg-slate-100 text-slate-700",
  em_transporte: "bg-blue-100 text-blue-700",
  atrasado: "bg-red-100 text-red-700",
  entregue: "bg-green-100 text-green-700",
};

export const STATUS_PEDIDO_COR: Record<Enums<"status_pedido">, string> = {
  gerado: "bg-slate-100 text-slate-700",
  aprovado: "bg-blue-100 text-blue-700",
  recebido_parcial: "bg-amber-100 text-amber-700",
  recebido: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

// ---------- Máquina de estados da O.S. ----------
// Transições permitidas a partir de cada status.

export const TRANSICOES_OS: Record<Enums<"status_os">, Enums<"status_os">[]> = {
  aberta: ["verificando_estoque", "cancelada"],
  verificando_estoque: ["disponivel_estoque", "aguardando_compra", "cancelada"],
  disponivel_estoque: ["programada", "cancelada"],
  aguardando_compra: ["em_aprovacao", "cancelada"],
  em_aprovacao: ["em_cotacao", "aguardando_compra", "cancelada"],
  em_cotacao: ["pedido_gerado", "cancelada"],
  pedido_gerado: ["aguardando_entrega", "cancelada"],
  aguardando_entrega: ["material_recebido", "cancelada"],
  material_recebido: ["liberada_para_manutencao", "cancelada"],
  liberada_para_manutencao: ["programada", "cancelada"],
  programada: ["material_entregue", "cancelada"],
  material_entregue: ["concluida", "cancelada"],
  concluida: [],
  cancelada: [],
};

// ---------- Helpers ----------

export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function formatarDataHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor == null) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
