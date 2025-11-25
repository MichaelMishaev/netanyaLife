-- CreateTable
CREATE TABLE IF NOT EXISTS "business_owners" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "pending_business_edits" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "description_he" TEXT,
    "description_ru" TEXT,
    "phone" TEXT,
    "whatsapp_number" TEXT,
    "website_url" VARCHAR(500),
    "email" VARCHAR(255),
    "opening_hours_he" TEXT,
    "opening_hours_ru" TEXT,
    "address_he" TEXT,
    "address_ru" TEXT,
    "status" "PendingStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_business_edits_pkey" PRIMARY KEY ("id")
);

-- Add columns to pending_businesses if they don't exist
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "subcategory_id" TEXT;
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "owner_id" TEXT;
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "reviewed_by" TEXT;
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "serves_all_city" BOOLEAN NOT NULL DEFAULT false;

-- Add owner_id to businesses if it doesn't exist
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "owner_id" TEXT;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "subcategory_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "business_owners_email_key" ON "business_owners"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pending_business_edits_business_id_idx" ON "pending_business_edits"("business_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pending_business_edits_owner_id_status_idx" ON "pending_business_edits"("owner_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pending_businesses_owner_id_idx" ON "pending_businesses"("owner_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "businesses_owner_id_idx" ON "businesses"("owner_id");

-- AddForeignKey (only if table and columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_business_edits') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'pending_business_edits_business_id_fkey') THEN
            ALTER TABLE "pending_business_edits"
            ADD CONSTRAINT "pending_business_edits_business_id_fkey"
            FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'pending_business_edits_owner_id_fkey') THEN
            ALTER TABLE "pending_business_edits"
            ADD CONSTRAINT "pending_business_edits_owner_id_fkey"
            FOREIGN KEY ("owner_id") REFERENCES "business_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'pending_businesses' AND column_name = 'owner_id') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'pending_businesses_owner_id_fkey') THEN
            ALTER TABLE "pending_businesses"
            ADD CONSTRAINT "pending_businesses_owner_id_fkey"
            FOREIGN KEY ("owner_id") REFERENCES "business_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'businesses' AND column_name = 'owner_id') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'businesses_owner_id_fkey') THEN
            ALTER TABLE "businesses"
            ADD CONSTRAINT "businesses_owner_id_fkey"
            FOREIGN KEY ("owner_id") REFERENCES "business_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'pending_businesses' AND column_name = 'subcategory_id') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'pending_businesses_subcategory_id_fkey') THEN
            ALTER TABLE "pending_businesses"
            ADD CONSTRAINT "pending_businesses_subcategory_id_fkey"
            FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'businesses' AND column_name = 'subcategory_id') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'businesses_subcategory_id_fkey') THEN
            ALTER TABLE "businesses"
            ADD CONSTRAINT "businesses_subcategory_id_fkey"
            FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;
