-- Harden admin access and profile mutation boundaries.

create table if not exists public.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admin_allowlist_email_lowercase check (email = lower(email))
);

insert into public.admin_allowlist (email)
values ('rayansabih@protonmail.com')
on conflict (email) do nothing;

alter table public.admin_allowlist enable row level security;

revoke all on public.admin_allowlist from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.approved = true
      and p.banned = false
      and exists (
        select 1
        from public.admin_allowlist a
        where a.email = lower(p.email)
      )
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role := 'client';
  requested_role_text text;
begin
  requested_role_text := coalesce(new.raw_user_meta_data ->> 'role', 'client');

  if requested_role_text = 'provider' then
    requested_role := 'provider';
  else
    requested_role := 'client';
  end if;

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
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

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
      array[]::text[],
      50
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

update public.profiles
set
  role = 'admin',
  approved = true,
  verified = true,
  banned = false
where lower(email) = 'rayansabih@protonmail.com';

revoke insert on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;

grant update (
  username,
  full_name,
  avatar_url,
  bio
) on public.profiles to authenticated;
