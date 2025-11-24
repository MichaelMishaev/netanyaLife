-- AlterTable: Add new fields to pending_businesses
ALTER TABLE "pending_businesses" ADD COLUMN "owner_id" TEXT,
ADD COLUMN "rejection_reason" TEXT,
ADD COLUMN "reviewed_by" TEXT;

-- CreateIndex: Add index on owner_id
CREATE INDEX "pending_businesses_owner_id_idx" ON "pending_businesses"("owner_id");

-- AddForeignKey: Link pending_businesses to business_owners
ALTER TABLE "pending_businesses" ADD CONSTRAINT "pending_businesses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "business_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
