# Supabase Execution Order

Run these files in Supabase SQL Editor in this exact order for a clean pre-launch reset:

1. `supabase/migrations/0000_reset_public_schema.sql`
2. `supabase/migrations/0001_core_schema.sql`
3. `supabase/migrations/0002_rls_policies.sql`
4. `supabase/migrations/0003_storage_buckets.sql`
5. `supabase/seed/0001_marketplace_taxonomy.sql`

Then verify:

```sql
select
  (select count(*) from public.marketplace_sections) as sections_count,
  (select count(*) from public.marketplace_subsections) as subsections_count;
```

Expected:

```text
sections_count = 8
subsections_count = 90
```

Create real users through Supabase Auth, not direct inserts into `profiles`.
