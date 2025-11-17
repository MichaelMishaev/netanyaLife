-- CreateEnum
CREATE TYPE "CategoryRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "category_requests" (
    "id" TEXT NOT NULL,
    "category_name_he" TEXT NOT NULL,
    "category_name_ru" TEXT,
    "description" TEXT,
    "requester_name" TEXT,
    "requester_email" TEXT,
    "requester_phone" TEXT,
    "business_name" TEXT,
    "status" "CategoryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "created_category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_requests_status_created_at_idx" ON "category_requests"("status", "created_at");
