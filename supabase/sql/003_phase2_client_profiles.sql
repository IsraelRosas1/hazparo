-- Phase 2 client profiles extension
-- Run this on projects that already applied 001/002 and need a dedicated client table.

create table if not exists public.client_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  phone_number text,
  default_address text,
  city text,
  state text,
  postal_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_client_profiles_updated_at on public.client_profiles;
create trigger set_client_profiles_updated_at
before update on public.client_profiles
for each row execute function public.set_updated_at();

alter table public.client_profiles enable row level security;

drop policy if exists client_profiles_select_own on public.client_profiles;
create policy client_profiles_select_own
on public.client_profiles
for select
to authenticated
using (auth.uid() = profile_id);

drop policy if exists client_profiles_insert_own on public.client_profiles;
create policy client_profiles_insert_own
on public.client_profiles
for insert
to authenticated
with check (auth.uid() = profile_id);

drop policy if exists client_profiles_update_own on public.client_profiles;
create policy client_profiles_update_own
on public.client_profiles
for update
to authenticated
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);
