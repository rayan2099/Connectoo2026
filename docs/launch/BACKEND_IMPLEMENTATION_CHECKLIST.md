# Backend Implementation Checklist

The current Express backend is a prototype using local JSON storage. Replace it with Supabase-backed server endpoints.

## Must Replace

- Remove `server/db.ts` JSON storage.
- Remove user-id bearer tokens.
- Remove mock password login.
- Remove mock Agora token.
- Remove simulated payments.

## Required Server Endpoints

### Auth

Auth should be Supabase Auth on the client. Server endpoints should validate Supabase JWTs when needed.

### Calls

- `POST /api/calls`
  - Verify user is a client.
  - Verify provider exists, approved, not banned, online, not blocked.
  - Snapshot `price_per_minute`.
  - Insert `calls` row with `ringing`.

- `PATCH /api/calls/:id`
  - Only participants can accept/reject/end.
  - Provider can set `active` from `ringing`.
  - Either participant can complete.
  - Compute duration and payment amount server-side.

### Agora

- `POST /api/agora/token`
  - Validate Supabase JWT.
  - Verify caller is participant in call.
  - Generate real Agora RTC token using server-only app certificate.
  - Never expose certificate to browser.

### Payments

- `POST /api/payments/create-intent`
  - Verify call/provider/client.
  - Authorize or charge based on chosen payment provider.

- `POST /api/payments/webhook`
  - Verify webhook signature.
  - Update `payments.status`.
  - Never trust client-provided payment status.

### Admin

- `GET /api/admin/analytics`
  - Validate admin.
  - Aggregate users, calls, payments, reports.

- `PATCH /api/admin/users/:id`
  - Approve, ban, verify.

- `PATCH /api/admin/verifications/:id`
  - Approve/reject professional verification.

## Vercel Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AGORA_APP_ID=
SUPABASE_SERVICE_ROLE_KEY=
AGORA_APP_CERTIFICATE=
PAYMENT_PROVIDER_SECRET_KEY=
```

## Done Means

- `npm run lint` passes.
- `npm run build` passes.
- A client can sign up and browse providers.
- A provider can sign up, set price/category/specialties, and wait for admin approval.
- Admin can approve provider.
- Client can call online provider.
- Real Agora token connects both sides.
- Payment is recorded from real provider webhook.
- Report/block/review flows work.
