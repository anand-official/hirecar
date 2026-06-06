# Deployment & Operations Guide

Hire Car is optimized for a Serverless Edge deployment model using Vercel.

## Required Services
1. **Vercel** (Hosting, CDN, CI/CD, ISR Caching)
2. **Supabase** (Database, Auth, Storage, Edge Functions)
3. **Typesense Cloud** (Search indexing)
4. **Resend** (Transactional Email)
5. **Stripe** (Subscriptions/Billing)
6. **Cloudflare Turnstile** (Captcha)

## Production Deployment Steps

1. **Connect Vercel to GitHub:**
   Import the repository into Vercel. Vercel will automatically detect Next.js and apply the correct build settings (`npm run build`).

2. **Set Environment Variables:**
   Populate all variables defined in `.env.example` directly in the Vercel Project Settings.

3. **Deploy Supabase Migrations:**
   Ensure your local Supabase CLI is linked to your production project, then run:
   ```bash
   supabase db push
   ```

4. **Deploy Supabase Edge Functions:**
   ```bash
   supabase functions deploy search-index-worker
   supabase functions deploy lead-cleanup
   ```

5. **Configure Storage:**
   Ensure the `vehicle-images` bucket in Supabase is set to **Public**.

6. **Trigger Initial Search Index:**
   Send a POST request to `https://[YOUR_DOMAIN]/api/search/reindex` with the `Authorization: Bearer <WORKER_API_KEY>` header to seed the Typesense cluster.

## Health Checks
Uptime monitoring services (e.g., UptimeRobot, Datadog) should be pointed to:
`GET https://[YOUR_DOMAIN]/api/health`
This verifies both Vercel edge execution and Supabase connection pooling.

## Rollback Plan
If a bad deployment hits production, **do not write a downward database migration**. 
1. Use the Vercel dashboard to "Promote to Production" the previous successful build.
2. Fix the bug locally.
3. Push a new forward-fix commit.
