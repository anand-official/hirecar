# Carhire Marketplace

Production-grade starter for an Australian car rental lead marketplace. The app is a modular Next.js monolith with Supabase Auth/Postgres/Storage, Stripe subscriptions, Resend email, Typesense search, and Cloudflare/Vercel deployment assumptions.

## What Is Implemented

- Public marketplace routes for search, listings, vendors, pricing, contact, and legal pages.
- Protected vendor and admin dashboard shells with route-level auth gates.
- API route handlers for leads, contact tracking, Stripe Checkout, Billing Portal, signed Stripe webhooks, admin moderation, and Typesense reindex health checks.
- Supabase migration with enterprise data model, RLS policies, storage buckets, Stripe event idempotency, audit logs, fraud flags, and legal acceptances.
- Shared validation schemas and baseline tests for high-risk public inputs.
- Security headers, Supabase SSR middleware, Turnstile verification hook, and in-memory local rate limiting.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Create separate company-owned projects/accounts for Supabase, Stripe, Resend, Typesense, Vercel, and Cloudflare.
3. Fill Supabase publishable and service-role keys. Never expose the service role key in browser-prefixed env vars.
4. Create Stripe Starter/Growth/Pro prices and set the matching env vars.
5. Apply the Supabase migration in `supabase/migrations`.
6. Run:

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run test
npm run build
```

## Production Notes

- Admin access requires trusted app metadata or an admin role record plus MFA.
- Public vehicle visibility requires approved organization, branch, subscription, and vehicle states.
- Customer bookings, deposits, insurance, driver verification, refunds, and disputes remain out of scope.
- Legal placeholder pages must be replaced with lawyer-reviewed Australian documents before launch.
