# Missing Fields And Product Gaps

These are not blockers for the first schema, but they are important before launch.

## Calls

Current `calls` table is enough for MVP ringing/active/completed, but production should add:

- `accepted_at`
- `rejected_at`
- `missed_at`
- `cancelled_at`
- `rejection_reason`
- `agora_uid_client`
- `agora_uid_provider`
- `agora_token_expires_at`
- `client_ip_country` for fraud/risk analysis

## Payments

Need before real launch:

- `payment_intent_id`
- `refund_id`
- `failure_reason`
- `captured_at`
- `refunded_at`
- provider payout table
- provider payout account verification state

## Providers

Need before marketplace scale:

- `headline`
- `years_experience`
- `license_country`
- `license_authority`
- `response_time_seconds`
- `completed_calls_count` materialized/stat field
- `average_rating` materialized/stat field

## Safety And Compliance

Need before legal/medical/psychology public launch:

- category-specific disclaimer acceptance
- emergency warning acknowledgement for medical/psychological support
- report status workflow: `open`, `reviewing`, `resolved`, `dismissed`
- admin moderation notes
- audit log table for admin actions

## Frontend Type Mismatches

Current TypeScript uses camelCase:

- `fullName`
- `avatar`
- `createdAt`
- `providerType`
- `availabilityStatus`
- `pricePerMinute`

Supabase uses snake_case:

- `full_name`
- `avatar_url`
- `created_at`
- `provider_type`
- `availability_status`
- `price_per_minute`

Add mapping functions or generate typed Supabase types.
