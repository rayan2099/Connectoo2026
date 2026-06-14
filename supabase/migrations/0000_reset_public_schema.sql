-- Danger: wipes Connectoo public app tables/types/functions.
-- Use only for a clean pre-launch Supabase reset.

drop table if exists public.payments cascade;
drop table if exists public.provider_verifications cascade;
drop table if exists public.provider_availability_windows cascade;
drop table if exists public.provider_settings cascade;
drop table if exists public.creator_settings cascade;
drop table if exists public.user_sessions cascade;
drop table if exists public.reviews cascade;
drop table if exists public.reports cascade;
drop table if exists public.blocks cascade;
drop table if exists public.notifications cascade;
drop table if exists public.calls cascade;
drop table if exists public.marketplace_subsections cascade;
drop table if exists public.marketplace_sections cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_auth_user() cascade;
drop function if exists public.touch_updated_at() cascade;
drop function if exists public.is_admin() cascade;

drop type if exists public.payment_status cascade;
drop type if exists public.verification_status cascade;
drop type if exists public.call_status cascade;
drop type if exists public.availability_status cascade;
drop type if exists public.provider_type cascade;
drop type if exists public.user_role cascade;
