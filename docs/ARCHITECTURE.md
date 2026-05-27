# Carhire System Architecture

## Runtime Shape

Carhire is a modular monolith deployed as a single Next.js App Router application. Domain boundaries are represented by route groups and library modules rather than separate services:

- Public marketplace: search, listings, vendor profiles, city pages, pricing, contact, legal.
- Vendor SaaS: onboarding, branches, vehicles, leads, analytics, billing, settings.
- Admin console: vendor/listing approval, billing review, fraud, reviews, audit.
- Platform modules: Supabase, Stripe, Resend, Typesense, security, validation.

## Trust Boundaries

- Browser clients use only Supabase publishable credentials.
- Server routes use service credentials only for trusted operations such as lead creation, Stripe reconciliation, moderation, and search indexing.
- Stripe card data never enters the app.
- Customer PII is stored only in lead records and is visible to authorized vendor members and platform admins.

## Security Controls

- Supabase RLS is enabled on all public-schema tables.
- Private helper functions in `app_private` centralize organization membership and platform-admin checks.
- Admin routes require platform role and MFA signal.
- Lead and contact endpoints validate input, rate-limit by IP, and support Cloudflare Turnstile.
- Stripe webhooks verify signatures from the raw request body and store processed event IDs.
- Storage buckets separate public approved images from private pending images and vendor documents.

## Scaling Path

- Typesense is included from v1 for predictable public listing search.
- Search index jobs model async reindexing even if the first implementation runs synchronously.
- Organization and branch modeling supports enterprise multi-location fleets.
- Audit logs, security events, and moderation notes support compliance review and incident response.
