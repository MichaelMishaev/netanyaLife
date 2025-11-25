-- Fix business_owners table schema

-- Add missing columns
ALTER TABLE "business_owners" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "business_owners" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);

-- Rename email_verified to is_verified (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'business_owners' AND column_name = 'email_verified') THEN
        ALTER TABLE "business_owners" RENAME COLUMN "email_verified" TO "is_verified";
    END IF;
END $$;

-- Add is_verified column if it doesn't exist (for fresh installations)
ALTER TABLE "business_owners" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- Make password_hash nullable (for OAuth-only users)
ALTER TABLE "business_owners" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Create unique constraint for google_id
CREATE UNIQUE INDEX IF NOT EXISTS "business_owners_google_id_key" ON "business_owners"("google_id");

-- Create index for google_id
CREATE INDEX IF NOT EXISTS "business_owners_google_id_idx" ON "business_owners"("google_id");

-- Create index for email
CREATE INDEX IF NOT EXISTS "business_owners_email_idx" ON "business_owners"("email");

-- Fix admin_users table (same changes)
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);
ALTER TABLE "admin_users" ALTER COLUMN "password_hash" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_google_id_key" ON "admin_users"("google_id");
CREATE INDEX IF NOT EXISTS "admin_users_google_id_idx" ON "admin_users"("google_id");

-- Fix pending_business_edits indexes
CREATE INDEX IF NOT EXISTS "pending_business_edits_business_id_status_idx" ON "pending_business_edits"("business_id", "status");
CREATE INDEX IF NOT EXISTS "pending_business_edits_status_created_at_idx" ON "pending_business_edits"("status", "created_at");
