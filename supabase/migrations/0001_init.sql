-- ============================================================
-- ERP Follow Up de Pedidos de Compra - Manutencao Automotiva
-- Schema inicial (espelha o aplicado no projeto Supabase)
-- ============================================================

-- ---------- ENUMS ----------
create type papel_usuario as enum ('admin', 'manutencao', 'compras', 'almoxarifado');
create type prioridade_os as enum ('baixa', 'media', 'alta');
create type status_os as enum (
  'aberta', 'verificando_estoque', 'disponivel_estoque', 'aguardando_compra',
  'em_aprovacao', 'em_cotacao', 'pedido_gerado', 'aguardando_entrega',
  'material_recebido', 'liberada_para_manutencao', 'programada',
  'material_entregue', 'concluida', 'cancelada'
);
create type status_rc as enum ('em_aprovacao', 'aprovada', 'reprovada', 'em_cotacao');
create type status_pedido as enum ('gerado', 'aprovado', 'recebido_parcial', 'recebido', 'cancelado');
create type status_item as enum ('pendente', 'recebido');
create type situacao_followup as enum ('aguardando', 'em_transporte', 'atrasado', 'entregue');

-- ---------- FUNCAO updated_at ----------
create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ---------- PERFIS ----------
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  matricula text,
  papel papel_usuario not null default 'manutencao',
  criado_em timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ORDENS DE SERVICO ----------
create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero_os text not null unique,
  frota text not null,
  equipamento text,
  descricao text not null,
  prioridade prioridade_os not null default 'media',
  status status_os not null default 'aberta',
  tem_estoque boolean,
  solicitante text,
  criado_por uuid references public.perfis(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create trigger trg_os_atualizado before update on public.ordens_servico
  for each row execute function public.set_atualizado_em();
create index idx_os_status on public.ordens_servico(status);
create index idx_os_frota on public.ordens_servico(frota);

-- ---------- REQUISICOES DE COMPRA (RC) ----------
create table public.requisicoes_compra (
  id uuid primary key default gen_random_uuid(),
  numero_rc text not null,
  ordem_servico_id uuid not null references public.ordens_servico(id) on delete cascade,
  status status_rc not null default 'em_aprovacao',
  valor_estimado numeric(14,2),
  observacao text,
  criado_em timestamptz not null default now()
);
create index idx_rc_os on public.requisicoes_compra(ordem_servico_id);

-- ---------- PEDIDOS DE COMPRA ----------
create table public.pedidos_compra (
  id uuid primary key default gen_random_uuid(),
  numero_pedido text not null,
  requisicao_id uuid not null references public.requisicoes_compra(id) on delete cascade,
  fornecedor text not null,
  comprador text,
  valor_total numeric(14,2),
  status status_pedido not null default 'gerado',
  data_pedido date not null default current_date,
  previsao_entrega date,
  criado_em timestamptz not null default now()
);
create index idx_pedido_rc on public.pedidos_compra(requisicao_id);
create index idx_pedido_status on public.pedidos_compra(status);

-- ---------- ITENS DO PEDIDO ----------
create table public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_compra(id) on delete cascade,
  descricao text not null,
  codigo_sap text,
  quantidade numeric(14,3) not null default 1,
  unidade text not null default 'UN',
  status_item status_item not null default 'pendente'
);
create index idx_item_pedido on public.itens_pedido(pedido_id);

-- ---------- FOLLOW UPS ----------
create table public.followups (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_compra(id) on delete cascade,
  data_contato timestamptz not null default now(),
  contato_fornecedor text,
  previsao_entrega date,
  situacao situacao_followup not null default 'aguardando',
  observacao text,
  registrado_por uuid references public.perfis(id),
  criado_em timestamptz not null default now()
);
create index idx_followup_pedido on public.followups(pedido_id);

-- ---------- RECEBIMENTOS ----------
create table public.recebimentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_compra(id) on delete cascade,
  data_recebimento timestamptz not null default now(),
  recebido_por text,
  ponto_material text,
  observacao text
);
create index idx_receb_pedido on public.recebimentos(pedido_id);

-- ---------- ENTREGAS ----------
create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid not null references public.ordens_servico(id) on delete cascade,
  material_descricao text not null,
  quantidade numeric(14,3) not null default 1,
  retirado_por_nome text not null,
  retirado_por_matricula text,
  entregue_por uuid references public.perfis(id),
  data_entrega timestamptz not null default now(),
  observacao text
);
create index idx_entrega_os on public.entregas(ordem_servico_id);

-- ============================================================
-- RLS - habilitado em todas as tabelas
-- MVP: qualquer usuario autenticado pode ler/escrever
-- ============================================================
alter table public.perfis enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.requisicoes_compra enable row level security;
alter table public.pedidos_compra enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.followups enable row level security;
alter table public.recebimentos enable row level security;
alter table public.entregas enable row level security;

create policy "perfis_select" on public.perfis for select to authenticated using (true);
create policy "perfis_update_self" on public.perfis for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "os_all" on public.ordens_servico for all to authenticated using (true) with check (true);
create policy "rc_all" on public.requisicoes_compra for all to authenticated using (true) with check (true);
create policy "pedido_all" on public.pedidos_compra for all to authenticated using (true) with check (true);
create policy "item_all" on public.itens_pedido for all to authenticated using (true) with check (true);
create policy "followup_all" on public.followups for all to authenticated using (true) with check (true);
create policy "receb_all" on public.recebimentos for all to authenticated using (true) with check (true);
create policy "entrega_all" on public.entregas for all to authenticated using (true) with check (true);
