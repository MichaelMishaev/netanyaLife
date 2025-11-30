-- Replace telegram_url with tiktok_url in businesses table
ALTER TABLE "businesses" RENAME COLUMN "telegram_url" TO "tiktok_url";

-- Replace telegram_url with tiktok_url in pending_business_edits table
ALTER TABLE "pending_business_edits" RENAME COLUMN "telegram_url" TO "tiktok_url";

-- Replace telegram_url with tiktok_url in pending_businesses table
ALTER TABLE "pending_businesses" RENAME COLUMN "telegram_url" TO "tiktok_url";
