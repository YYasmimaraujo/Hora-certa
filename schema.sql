-- Ciclo: tabela de compromissos protegida por usuário (RLS)

create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 60),
  date       date not null,
  start_min  integer not null check (start_min between 0 and 1439),
  end_min    integer not null check (end_min between 1 and 2879),
  cat        text not null check (cat in ('trabalho','estudo','pessoal','saude')),
  rem        integer check (rem in (0,5,15,30,60)),
  created_at timestamptz not null default now(),
  check (end_min > start_min and end_min - start_min <= 1440)
);

create index if not exists events_user_date_idx on public.events (user_id, date);


alter table public.events enable row level security;

grant select, insert, update, delete on public.events to authenticated;

drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

create policy "events_select_own" on public.events for select to authenticated
  using (user_id = (select auth.uid()));
create policy "events_insert_own" on public.events for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "events_update_own" on public.events for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "events_delete_own" on public.events for delete to authenticated
  using (user_id = (select auth.uid()));


create or replace function public.delete_my_account()
returns void language sql security definer set search_path = public as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
