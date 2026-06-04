-- ============================================================
-- Materiais necessarios da Ordem de Servico
-- Um servico (O.S.) pode exigir varios materiais.
-- ============================================================

create table public.materiais_os (
  id uuid primary key default gen_random_uuid(),
  ordem_servico_id uuid not null references public.ordens_servico(id) on delete cascade,
  descricao text not null,
  codigo_sap text,
  quantidade numeric(14,3) not null default 1,
  unidade text not null default 'UN',
  criado_em timestamptz not null default now()
);
create index idx_material_os on public.materiais_os(ordem_servico_id);

-- RLS (consistente com as demais tabelas: qualquer autenticado le/escreve no MVP)
alter table public.materiais_os enable row level security;
create policy "material_os_all" on public.materiais_os
  for all to authenticated using (true) with check (true);
