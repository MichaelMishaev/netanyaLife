-- AlterTable: Add new fields to pending_businesses
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "owner_id" TEXT;
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;
ALTER TABLE "pending_businesses" ADD COLUMN IF NOT EXISTS "reviewed_by" TEXT;

-- CreateIndex: Add index on owner_id
CREATE INDEX IF NOT EXISTS "pending_businesses_owner_id_idx" ON "pending_businesses"("owner_id");

-- AddForeignKey: Link pending_businesses to business_owners
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pending_businesses_owner_id_fkey'
  ) THEN
    ALTER TABLE "pending_businesses" ADD CONSTRAINT "pending_businesses_owner_id_fkey" 
    FOREIGN KEY ("owner_id") REFERENCES "business_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
