-- Add new marketplace features to vehicles table
ALTER TABLE "public"."vehicles" 
  ADD COLUMN "daily_distance_limit_km" integer DEFAULT NULL,
  ADD COLUMN "extra_distance_fee_aud" numeric(10,2) DEFAULT NULL,
  ADD COLUMN "instant_book" boolean NOT NULL DEFAULT false;

-- Add a comment to explain the fields
COMMENT ON COLUMN "public"."vehicles"."daily_distance_limit_km" IS 'Daily distance allowance in kilometers. Null means unlimited.';
COMMENT ON COLUMN "public"."vehicles"."extra_distance_fee_aud" IS 'Fee per extra kilometer in AUD if limit is exceeded.';
COMMENT ON COLUMN "public"."vehicles"."instant_book" IS 'Whether the vehicle can be booked instantly without host approval.';
