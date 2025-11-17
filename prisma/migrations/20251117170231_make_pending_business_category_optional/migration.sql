-- DropForeignKey
ALTER TABLE "pending_businesses" DROP CONSTRAINT "pending_businesses_category_id_fkey";

-- AlterTable
ALTER TABLE "pending_businesses" ALTER COLUMN "category_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "pending_businesses" ADD CONSTRAINT "pending_businesses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
