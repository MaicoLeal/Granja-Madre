-- PROPOSTA NÃO APLICADA. Conferir o banco existente antes de gerar/aplicar migração.
begin;
create table public.gm_spaces(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 200),created_at timestamptz not null default now());
create table public.gm_memberships(workspace_id uuid not null references public.gm_spaces(id),user_id uuid not null references auth.users(id),role text not null check(role in ('admin','operator','reviewer','viewer')),active boolean not null default true,member_id uuid,created_at timestamptz not null default now(),primary key(workspace_id,user_id));
create index gm_memberships_user_active_idx on public.gm_memberships(user_id,workspace_id) where active;
create unique index gm_memberships_member_idx on public.gm_memberships(workspace_id,member_id) where member_id is not null;
create table public.gm_workspace_state(workspace_id uuid primary key references public.gm_spaces(id),body jsonb not null check(jsonb_typeof(body)='object'),revision bigint not null default 0 check(revision>=0),updated_at timestamptz not null default now());
alter table public.gm_spaces enable row level security;
alter table public.gm_memberships enable row level security;
alter table public.gm_workspace_state enable row level security;
alter table public.gm_spaces force row level security;
alter table public.gm_memberships force row level security;
alter table public.gm_workspace_state force row level security;
revoke all on public.gm_spaces,public.gm_memberships,public.gm_workspace_state from public,anon,authenticated;
grant usage on schema public to authenticated;
grant select on public.gm_spaces,public.gm_memberships,public.gm_workspace_state to authenticated;
grant select,insert,update on public.gm_spaces,public.gm_memberships,public.gm_workspace_state to service_role;
create policy gm_read_own_membership on public.gm_memberships for select to authenticated using(user_id=(select auth.uid()) and active);
create policy gm_read_authorized_space on public.gm_spaces for select to authenticated using(id in(select workspace_id from public.gm_memberships where user_id=(select auth.uid()) and active));
create policy gm_read_authorized_state on public.gm_workspace_state for select to authenticated using(workspace_id in(select workspace_id from public.gm_memberships where user_id=(select auth.uid()) and active));
-- Gravações passam somente pela função, que verifica vínculo, papel e regras.
commit;

