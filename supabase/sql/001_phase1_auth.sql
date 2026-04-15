-- Phase 1 auth schema for Hazparo
-- Run in Supabase SQL editor (or migrate via Supabase CLI) before enabling app auth flows.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'client' check (role in ('client', 'tradesperson')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tradesperson_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  trade text not null,
  bio text,
  hourly_rate numeric(10, 2),
  years_experience integer not null default 0,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_tradesperson_profiles_updated_at on public.tradesperson_profiles;
create trigger set_tradesperson_profiles_updated_at
before update on public.tradesperson_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_client_profiles_updated_at on public.client_profiles;
create trigger set_client_profiles_updated_at
before update on public.client_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tradesperson_profiles enable row level security;
alter table public.client_profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists tradesperson_profiles_select_all on public.tradesperson_profiles;
create policy tradesperson_profiles_select_all
on public.tradesperson_profiles
for select
to authenticated
using (true);

drop policy if exists tradesperson_profiles_insert_own on public.tradesperson_profiles;
create policy tradesperson_profiles_insert_own
on public.tradesperson_profiles
for insert
to authenticated
with check (auth.uid() = profile_id);

drop policy if exists tradesperson_profiles_update_own on public.tradesperson_profiles;
create policy tradesperson_profiles_update_own
on public.tradesperson_profiles
for update
to authenticated
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

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
