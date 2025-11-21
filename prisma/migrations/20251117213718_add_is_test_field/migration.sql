-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "is_test" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pending_businesses" ADD COLUMN     "is_test" BOOLEAN NOT NULL DEFAULT false;
