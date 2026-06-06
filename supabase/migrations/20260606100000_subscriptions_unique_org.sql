-- Add missing UNIQUE constraint on subscriptions.organization_id.
-- The Stripe webhook upsert handler uses onConflict: "organization_id" which
-- requires this constraint to exist — without it the upsert silently inserts
-- duplicates instead of updating the existing subscription.
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_organization_id_unique UNIQUE (organization_id);
