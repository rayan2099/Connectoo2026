# Connectoo Project Assessment

## Executive Summary

Connectoo is now shaped as a two-sided Arabic voice marketplace:

- Users describe what they need and get matched with an available person.
- Creators, influencers, and experts create a call-ready profile with price, availability, category, and matching bio.
- The public landing page explains the product, previews provider cards, and supports a smart matching prompt.

The product direction is strong. The main launch risk is not the UI anymore; it is backend production readiness.

## Product Positioning

Primary promise:

> A fast voice call with the right person: someone you admire, or someone who can help.

The product should avoid sounding like only an expert-help app. It must keep both lanes visible:

- creator/fan calls
- expert/problem-solving calls

## What Is Working

- Arabic-first RTL experience.
- Clear two-sided entry: make a call or receive calls.
- Provider type selection: creator/influencer or expert.
- Provider bio is positioned as a matching signal, not a decorative profile field.
- Marketplace preview cards show how the experience works before signup.
- Smart prompt flow lets users describe their situation instead of only choosing categories.

## Immediate Product Decisions

- Categories stay, but they are secondary. The matching bio and user prompt become the main discovery layer.
- Public preview cards should be clickable and educational, but real calls require signin.
- Experts and creators must be encouraged to write specific bios because matching quality depends on that text.
- Provider approval must become an admin workflow, not manual SQL.

## Launch Blockers

These must be finished before a real public launch:

- Replace prototype auth/session handling with Supabase Auth everywhere.
- Replace local JSON backend with Supabase-backed data access.
- Build admin approval against Supabase profiles and provider verifications.
- Generate real Agora tokens from a protected server function.
- Add real payment authorization/capture and webhook handling.
- Add legal/medical/emotional-support disclaimers in the call flow.
- Add abuse reporting, blocking, and moderation review that persists in Supabase.

## Recommended Next Sprint

1. Supabase admin approval:
   - pending providers list
   - approve/reject
   - verify expert license

2. AI matching backend:
   - input: user situation
   - rank: provider bio, category, specialties, language, price, availability, verification
   - output: top 5 providers with reason

3. Call readiness:
   - create call row
   - provider receives ringing request
   - client sees waiting state
   - provider accepts/rejects
   - Agora token generated server-side

4. Payment readiness:
   - hold before call
   - charge after call duration
   - provider earnings ledger

## Execution Status

Implemented in this pass:

- Smart matching backend endpoint: `POST /api/match/providers`.
- Matching now ranks providers by prompt terms, provider bio, category, specialty, language, availability, verification, rating, and price.
- Marketplace smart prompt now uses backend-ranked results instead of only changing local filters.
- Provider cards can show why a matched person appeared.
- Call signin prompt is handled professionally before unauthenticated users can request a call.
- Local admin approval flow exists for prototype data.
- Call request, ringing, accept, reject, active, and completed states exist in the prototype backend.
- Real Agora RTC token endpoint is implemented server-side with `AGORA_APP_CERTIFICATE`.
- Admin user approval, rejection, ban, and verification approval now use Supabase when `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Supabase JWT requests can be resolved server-side so admin-only endpoints can work with Supabase Auth sessions.

Still required before production:

- Replace prototype local backend with Supabase-backed endpoints.
- Test RLS policies with separate client, provider, and admin accounts.

Deferred by decision:

- Payment authorization, capture, webhook, and provider earnings ledger.

## Quality Bar

Do not call the app launch-ready until:

- `npm run lint` passes.
- `npm run build` passes.
- signup, signin, provider settings, marketplace, smart matching, call request, call accept, review, report, and admin approval are all tested on the deployed URL.
- Supabase RLS policies are tested with client, provider, and admin accounts.
- No secret keys are exposed to the browser.
