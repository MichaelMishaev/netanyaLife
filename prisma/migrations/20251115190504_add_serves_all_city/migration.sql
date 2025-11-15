-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "serves_all_city" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pending_businesses" ADD COLUMN     "serves_all_city" BOOLEAN NOT NULL DEFAULT false;
