-- ============================================================
-- FlowCRM — Esquema PostgreSQL / Supabase
-- Ejecuta este script en el SQL Editor de Supabase.
-- Incluye tablas, enums, índices, RLS y triggers básicos.
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ---------- Tipos enumerados ----------
do $$ begin
  create type lead_source as enum ('web','referido','redes_sociales','evento','llamada_fria','email_marketing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type prospect_status as enum ('nuevo','contactado','calificado','perdido','convertido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_status as enum ('activo','inactivo','en_riesgo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pipeline_stage as enum ('prospeccion','calificacion','propuesta','negociacion','ganada','perdida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum ('llamada','reunion','correo','tarea');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('borrador','enviada','aceptada','rechazada');
exception when duplicate_object then null; end $$;

-- ---------- Perfiles de usuario (extiende auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'ejecutivo',
  avatar text,
  goal numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Prospectos ----------
create table if not exists public.prospects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text not null,
  email text,
  phone text,
  position text,
  source lead_source not null default 'web',
  status prospect_status not null default 'nuevo',
  estimated_value numeric not null default 0,
  score int not null default 50 check (score between 0 and 100),
  owner_id uuid references public.profiles(id) on delete set null,
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Clientes ----------
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company text not null,
  email text,
  phone text,
  industry text,
  status client_status not null default 'activo',
  total_value numeric not null default 0,
  owner_id uuid references public.profiles(id) on delete set null,
  converted_from_prospect_id uuid references public.prospects(id) on delete set null,
  address text,
  created_at timestamptz not null default now()
);

-- ---------- Oportunidades ----------
create table if not exists public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  client_id uuid references public.clients(id) on delete set null,
  prospect_id uuid references public.prospects(id) on delete set null,
  account_name text not null,
  value numeric not null default 0,
  stage pipeline_stage not null default 'prospeccion',
  probability int not null default 15 check (probability between 0 and 100),
  owner_id uuid references public.profiles(id) on delete set null,
  expected_close_date date,
  source lead_source not null default 'web',
  created_at timestamptz not null default now()
);

-- ---------- Actividades ----------
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  type activity_type not null,
  subject text not null,
  description text,
  related_type text not null check (related_type in ('prospect','client','opportunity')),
  related_id uuid not null,
  related_name text,
  owner_id uuid references public.profiles(id) on delete set null,
  due_date timestamptz,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Cotizaciones ----------
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  account_name text not null,
  status quote_status not null default 'borrador',
  items jsonb not null default '[]'::jsonb,
  tax_rate numeric not null default 16,
  owner_id uuid references public.profiles(id) on delete set null,
  valid_until date,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- Índices ----------
create index if not exists idx_prospects_owner on public.prospects(owner_id);
create index if not exists idx_prospects_status on public.prospects(status);
create index if not exists idx_clients_owner on public.clients(owner_id);
create index if not exists idx_opportunities_stage on public.opportunities(stage);
create index if not exists idx_opportunities_owner on public.opportunities(owner_id);
create index if not exists idx_activities_owner on public.activities(owner_id);
create index if not exists idx_activities_related on public.activities(related_type, related_id);
create index if not exists idx_quotes_client on public.quotes(client_id);

-- ---------- Row Level Security ----------
alter table public.profiles      enable row level security;
alter table public.prospects     enable row level security;
alter table public.clients       enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities    enable row level security;
alter table public.quotes        enable row level security;

-- Política simple: cualquier usuario autenticado puede leer/escribir
-- (para un SaaS multi-tenant real, filtra por organización/owner).
do $$
declare t text;
begin
  foreach t in array array['profiles','prospects','clients','opportunities','activities','quotes']
  loop
    execute format($f$
      drop policy if exists "auth_all_%1$s" on public.%1$s;
      create policy "auth_all_%1$s" on public.%1$s
        for all to authenticated using (true) with check (true);
    $f$, t);
  end loop;
end $$;

-- ---------- Trigger: crear perfil al registrarse ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email, 'ejecutivo')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
