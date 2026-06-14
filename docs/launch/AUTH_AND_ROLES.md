# Auth And Role Setup

Connectoo should use Supabase Auth as the only password/session system.

## Roles

`profiles.role` supports:

- `client`: can browse providers, start calls, review completed calls, report/block users.
- `provider`: can set pricing, category, specialties, availability, submit verification, accept/reject calls.
- `admin`: can approve providers, verify credentials, ban users, resolve reports, inspect payments.

## Signup Metadata

When signing up, pass metadata to Supabase Auth:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: signupRole,
      username,
      full_name: fullName,
      avatar_url: null
    }
  }
});
```

The `on_auth_user_created` trigger creates the matching `profiles` row.

## Approval Flow

Clients are auto-approved.

Providers are created with:

```text
approved = false
verified = false
provider_settings.availability_status = offline
```

Admins must approve `profiles.approved = true`. Professional experts should also go through `provider_verifications`.

## Creating The First Admin

1. Create the admin user through Supabase Auth.
2. Run this once, replacing the email:

```sql
update public.profiles
set role = 'admin',
    approved = true,
    verified = true
where email = 'admin@example.com';
```

Do not allow public signup as `admin` in the frontend.

## Environment Variables

Browser-safe:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AGORA_APP_ID=
```

Server-only:

```env
SUPABASE_SERVICE_ROLE_KEY=
AGORA_APP_CERTIFICATE=
PAYMENT_PROVIDER_SECRET_KEY=
```

Never expose service role, Agora certificate, or payment secrets in frontend code.
