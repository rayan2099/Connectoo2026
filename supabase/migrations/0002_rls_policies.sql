-- Connectoo row-level security policies.

alter table public.profiles enable row level security;
alter table public.marketplace_sections enable row level security;
alter table public.marketplace_subsections enable row level security;
alter table public.provider_settings enable row level security;
alter table public.provider_availability_windows enable row level security;
alter table public.calls enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.provider_verifications enable row level security;
alter table public.payments enable row level security;

create policy "profiles_select_public_or_self_or_admin"
on public.profiles for select
using (
  id = auth.uid()
  or public.is_admin()
  or (role = 'provider' and approved = true and banned = false)
);

create policy "profiles_update_self_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "sections_select_active"
on public.marketplace_sections for select
using (active = true or public.is_admin());

create policy "subsections_select_active"
on public.marketplace_subsections for select
using (active = true or public.is_admin());

create policy "admin_manage_sections"
on public.marketplace_sections for all
using (public.is_admin())
with check (public.is_admin());

create policy "admin_manage_subsections"
on public.marketplace_subsections for all
using (public.is_admin())
with check (public.is_admin());

create policy "provider_settings_select_public_or_owner_or_admin"
on public.provider_settings for select
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.profiles p
    where p.id = provider_settings.user_id
      and p.role = 'provider'
      and p.approved = true
      and p.banned = false
  )
);

create policy "provider_settings_insert_owner_or_admin"
on public.provider_settings for insert
with check (user_id = auth.uid() or public.is_admin());

create policy "provider_settings_update_owner_or_admin"
on public.provider_settings for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "availability_select_public_or_owner_or_admin"
on public.provider_availability_windows for select
using (
  provider_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.profiles p
    where p.id = provider_availability_windows.provider_id
      and p.approved = true
      and p.banned = false
  )
);

create policy "availability_manage_owner_or_admin"
on public.provider_availability_windows for all
using (provider_id = auth.uid() or public.is_admin())
with check (provider_id = auth.uid() or public.is_admin());

create policy "calls_select_participant_or_admin"
on public.calls for select
using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

create policy "calls_insert_client"
on public.calls for insert
with check (
  client_id = auth.uid()
  and client_id <> provider_id
  and exists (
    select 1 from public.profiles p
    join public.provider_settings s on s.user_id = p.id
    where p.id = calls.provider_id
      and p.role = 'provider'
      and p.approved = true
      and p.banned = false
      and s.availability_status = 'online'
      and s.accepts_instant_calls = true
  )
);

create policy "calls_update_participant_or_admin"
on public.calls for update
using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin())
with check (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

create policy "reviews_select_public"
on public.reviews for select
using (true);

create policy "reviews_insert_reviewer"
on public.reviews for insert
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1 from public.calls c
    where c.id = reviews.call_id
      and c.client_id = auth.uid()
      and c.provider_id = reviews.provider_id
      and c.status = 'completed'
  )
);

create policy "notifications_select_owner_or_admin"
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());

create policy "notifications_update_owner_or_admin"
on public.notifications for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "blocks_manage_owner_or_admin"
on public.blocks for all
using (blocker_id = auth.uid() or public.is_admin())
with check (blocker_id = auth.uid() or public.is_admin());

create policy "reports_insert_reporter"
on public.reports for insert
with check (reporter_id = auth.uid());

create policy "reports_select_admin_or_reporter"
on public.reports for select
using (reporter_id = auth.uid() or public.is_admin());

create policy "reports_update_admin"
on public.reports for update
using (public.is_admin())
with check (public.is_admin());

create policy "verifications_insert_provider"
on public.provider_verifications for insert
with check (provider_id = auth.uid());

create policy "verifications_select_owner_or_admin"
on public.provider_verifications for select
using (provider_id = auth.uid() or public.is_admin());

create policy "verifications_update_admin"
on public.provider_verifications for update
using (public.is_admin())
with check (public.is_admin());

create policy "payments_select_participant_or_admin"
on public.payments for select
using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

create policy "payments_admin_all"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());
