# Screen-To-Table Map

Based on the current `src/App.tsx` `ViewState` screens.

| Screen | Current View | Tables Read | Tables Written | Notes |
| --- | --- | --- | --- | --- |
| Landing | `landing` | `marketplace_sections`, `marketplace_subsections`, approved provider `profiles`, `provider_settings` | none | Replace hardcoded taxonomy with Supabase reads. |
| Auth | `auth` | `auth.users`, `profiles` | `auth.users`, trigger creates `profiles`, maybe `provider_settings` | Signup must use Supabase Auth metadata. |
| Pending Approval | `pending_approval` | `profiles` | none | Poll current profile or subscribe to profile changes. |
| Marketplace | `marketplace` | `marketplace_sections`, `marketplace_subsections`, `profiles`, `provider_settings`, `reviews` | none | Filters use `provider_settings.category_slug`, `specialty_slugs`, `availability_status`. |
| Provider Profile | `profile` | `profiles`, `provider_settings`, `reviews`, `provider_verifications` | `calls`, `reports`, `blocks` | Call button writes `calls`; report/block use safety tables. |
| Provider Dashboard | `provider_dashboard` | `profiles`, `provider_settings`, `calls`, `provider_verifications` | `provider_settings`, `calls` | Availability toggle updates `provider_settings.availability_status`. |
| Active Call | `call` | `calls`, participant `profiles` | `calls`, `payments` server-side | Agora token must come from secure server endpoint. |
| Call Summary | `call_summary` | `calls`, `payments` | `reviews` | Client can review only completed calls. |
| Settings | `settings` | `profiles`, `provider_settings`, `marketplace_sections`, `marketplace_subsections` | `profiles`, `provider_settings`, `provider_availability_windows`, storage `avatars` | Current UI does not yet expose availability windows. |
| Admin | `admin` | `profiles`, `reports`, `provider_verifications`, `calls`, `payments` | `profiles`, `reports`, `provider_verifications` | Admin operations require admin RLS and server-side guard for sensitive aggregates. |

## Current API Methods To Replace

| Current API | New Source |
| --- | --- |
| `api.signup` | `supabase.auth.signUp` |
| `api.login` | `supabase.auth.signInWithPassword` |
| `api.me` | `supabase.auth.getUser` + `profiles` |
| `api.getSections` | `marketplace_sections` + `marketplace_subsections` |
| `api.getProviders` | `provider_settings` joined to `profiles` |
| `api.createCall` | server endpoint using Supabase service role after validating auth |
| `api.getAgoraToken` | server endpoint only |
| `api.submitVerification` | storage upload + `provider_verifications` insert |
| Admin APIs | server endpoint or direct Supabase with admin-only RLS where safe |
