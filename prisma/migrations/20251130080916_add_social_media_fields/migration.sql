-- Add social media fields to businesses table
ALTER TABLE "businesses" ADD COLUMN "instagram_url" VARCHAR(500);
ALTER TABLE "businesses" ADD COLUMN "facebook_url" VARCHAR(500);
ALTER TABLE "businesses" ADD COLUMN "telegram_url" VARCHAR(500);

-- Add social media fields to pending_business_edits table
ALTER TABLE "pending_business_edits" ADD COLUMN "instagram_url" VARCHAR(500);
ALTER TABLE "pending_business_edits" ADD COLUMN "facebook_url" VARCHAR(500);
ALTER TABLE "pending_business_edits" ADD COLUMN "telegram_url" VARCHAR(500);

-- Add social media fields to pending_businesses table
ALTER TABLE "pending_businesses" ADD COLUMN "instagram_url" VARCHAR(500);
ALTER TABLE "pending_businesses" ADD COLUMN "facebook_url" VARCHAR(500);
ALTER TABLE "pending_businesses" ADD COLUMN "telegram_url" VARCHAR(500);
