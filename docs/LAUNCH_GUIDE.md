# Connectoo Launch Guide

This app should launch with Supabase as the source of truth, Vercel as the host, and server-only functions for sensitive actions such as Agora token generation and payments.

## 1. Supabase

Run these files in the Supabase SQL editor, in this order:

```sql
-- first
db/schema.sql

-- second
db/seed.sql
```

Expected seed result:

```text
sections_count: 8
subsections_count: 90
```

Use Supabase Auth for all users. Do not store app passwords in `profiles`.

## 2. Required Environment Variables

Vercel frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AGORA_APP_ID=
APP_URL=
```

Vercel server-only functions:

```env
SUPABASE_SERVICE_ROLE_KEY=
AGORA_APP_CERTIFICATE=
PAYMENT_PROVIDER_SECRET_KEY=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `AGORA_APP_CERTIFICATE`, or payment secrets to browser code.

## 3. Backend Work Still Required

The current Express backend is still a prototype. Before launch, replace:

- Local JSON storage in `server/db.ts` with Supabase queries.
- Header token auth in `server.ts` with Supabase Auth JWT validation.
- Mock Agora token response with a real server-only Agora token generator.
- Simulated payments with a real payment provider flow and webhook.
- Demo provider data with real provider onboarding and admin approval.

## 4. Frontend Work Still Required

The frontend should use Supabase Auth and database reads directly where safe:

- Signup/login through `supabase.auth`.
- Marketplace sections from `marketplace_sections` and `marketplace_subsections`.
- Approved providers from `profiles` joined with `provider_settings`.
- Calls through server APIs only when a sensitive action is needed.

## 5. Launch Gate

Do not launch until all are true:

- Supabase schema and seed run cleanly.
- `npm run lint` passes.
- `npm run build` passes.
- A real user can sign up, log in, become a provider, set price, set availability, and be approved.
- A client can call an online provider using a real Agora token.
- Payment is charged, recorded, and visible to admin.
- Reports, blocks, bans, and provider verification work from the admin panel.
