-- Chạy file này 1 lần trong Supabase → SQL Editor (dự án "bee")
create table if not exists public.app_state (
  owner_id   uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_select_own" on public.app_state;
drop policy if exists "app_state_insert_own" on public.app_state;
drop policy if exists "app_state_update_own" on public.app_state;
drop policy if exists "app_state_delete_own" on public.app_state;

create policy "app_state_select_own" on public.app_state for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "app_state_insert_own" on public.app_state for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy "app_state_update_own" on public.app_state for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "app_state_delete_own" on public.app_state for delete to authenticated
  using ((select auth.uid()) = owner_id);

revoke all on public.app_state from anon;
grant select, insert, update, delete on public.app_state to authenticated;
