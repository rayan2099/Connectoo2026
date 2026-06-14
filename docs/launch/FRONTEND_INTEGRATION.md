# Frontend Integration Code

The current `src/api.ts` talks to the prototype Express server. Replace auth and safe reads with Supabase, and keep sensitive operations behind server APIs.

## Install

```bash
npm install @supabase/supabase-js
```

## Supabase Client

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Auth Replacement

Replace `/api/auth/signup` with:

```ts
export async function signUpConnectoo(input: {
  email: string;
  password: string;
  username: string;
  fullName: string;
  role: 'client' | 'provider';
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        role: input.role,
        username: input.username,
        full_name: input.fullName
      }
    }
  });

  if (error) throw error;
  return data;
}
```

Replace `/api/auth/login` with:

```ts
export async function loginConnectoo(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
```

Load the current profile:

```ts
export async function getCurrentProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (error) throw error;
  return data;
}
```

## Marketplace Reads

Sections:

```ts
export async function getMarketplaceSections() {
  const { data, error } = await supabase
    .from('marketplace_sections')
    .select('*, marketplace_subsections(*)')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('sort_order', { foreignTable: 'marketplace_subsections', ascending: true });

  if (error) throw error;
  return data;
}
```

Providers:

```ts
export async function getProviders(filters: {
  providerType?: 'creator' | 'expert';
  category?: string;
  specialty?: string;
  onlineOnly?: boolean;
}) {
  let query = supabase
    .from('provider_settings')
    .select('*, profiles!inner(*)')
    .eq('profiles.role', 'provider')
    .eq('profiles.approved', true)
    .eq('profiles.banned', false);

  if (filters.providerType) query = query.eq('provider_type', filters.providerType);
  if (filters.category) query = query.eq('category_slug', filters.category);
  if (filters.specialty) query = query.contains('specialty_slugs', [filters.specialty]);
  if (filters.onlineOnly) query = query.eq('availability_status', 'online');

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

## Sensitive Operations

Keep these server-side:

- Generate Agora RTC tokens.
- Create/confirm payments.
- Payment webhooks.
- Admin analytics that aggregate private data.

Use Vercel Functions or Supabase Edge Functions for those endpoints.
