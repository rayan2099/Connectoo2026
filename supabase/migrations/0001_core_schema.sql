-- Connectoo core schema.
-- Run after 0000_reset_public_schema.sql on a clean pre-launch Supabase project.

create extension if not exists pgcrypto;

create type public.user_role as enum ('client', 'provider', 'admin');
create type public.provider_type as enum ('creator', 'expert');
create type public.availability_status as enum ('online', 'offline', 'busy');
create type public.call_status as enum ('ringing', 'active', 'completed', 'rejected', 'missed', 'cancelled');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text unique not null check (username ~ '^[a-zA-Z0-9_.]{3,30}$'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 800),
  role public.user_role not null default 'client',
  approved boolean not null default false,
  verified boolean not null default false,
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketplace_sections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  provider_type public.provider_type not null,
  label_ar text not null,
  label_en text not null,
  description_ar text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.marketplace_subsections (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.marketplace_sections(id) on delete cascade,
  slug text not null,
  label_ar text not null,
  label_en text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (section_id, slug)
);

create table public.provider_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  provider_type public.provider_type not null,
  availability_status public.availability_status not null default 'offline',
  category_slug text not null references public.marketplace_sections(slug),
  specialty_slugs text[] not null default '{}',
  languages text[] not null default array['العربية'],
  price_per_minute numeric(10,2) not null check (price_per_minute >= 0 and price_per_minute <= 10000),
  accepts_instant_calls boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.provider_availability_windows (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'Asia/Riyadh',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  provider_id uuid not null references public.profiles(id) on delete restrict,
  channel_name text not null unique,
  status public.call_status not null default 'ringing',
  price_per_minute numeric(10,2) not null default 0,
  currency text not null default 'SAR',
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  created_at timestamptz not null default now(),
  check (client_id <> provider_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  call_id uuid not null unique references public.calls(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  check (reviewer_id <> provider_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 2000),
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create table public.provider_verifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  status public.verification_status not null default 'pending',
  profession text not null,
  jurisdiction text not null,
  license_number text not null,
  document_url text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null unique references public.calls(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete restrict,
  provider_id uuid not null references public.profiles(id) on delete restrict,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'SAR',
  platform_fee numeric(10,2) not null default 0 check (platform_fee >= 0),
  provider_earnings numeric(10,2) not null default 0 check (provider_earnings >= 0),
  payment_provider text,
  external_payment_id text,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger touch_provider_settings_updated_at
before update on public.provider_settings
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and banned = false
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  requested_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'client');

  insert into public.profiles (
    id,
    email,
    username,
    full_name,
    avatar_url,
    role,
    approved
  )
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'user_' || substr(new.id::text, 1, 8)),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'مستخدم كونكتو'),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    requested_role,
    requested_role = 'client'
  );

  if requested_role = 'provider' then
    insert into public.provider_settings (
      user_id,
      provider_type,
      category_slug,
      specialty_slugs,
      price_per_minute
    )
    values (
      new.id,
      'creator',
      'creators-celebrities',
      '{}',
      10
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create index idx_profiles_role_approved_banned on public.profiles(role, approved, banned);
create index idx_provider_settings_discovery on public.provider_settings(provider_type, availability_status, category_slug);
create index idx_provider_settings_specialties on public.provider_settings using gin(specialty_slugs);
create index idx_sections_active_order on public.marketplace_sections(active, sort_order);
create index idx_subsections_section_order on public.marketplace_subsections(section_id, active, sort_order);
create index idx_calls_client_created on public.calls(client_id, created_at desc);
create index idx_calls_provider_status_created on public.calls(provider_id, status, created_at desc);
create index idx_reviews_provider_created on public.reviews(provider_id, created_at desc);
create index idx_notifications_user_read_created on public.notifications(user_id, read, created_at desc);
create index idx_reports_resolved_created on public.reports(resolved, created_at desc);
create index idx_verifications_status_created on public.provider_verifications(status, created_at desc);
