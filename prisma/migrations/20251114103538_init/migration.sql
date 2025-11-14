-- CreateEnum
CREATE TYPE "PendingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SEARCH_PERFORMED', 'BUSINESS_VIEWED', 'CTA_CLICKED', 'REVIEW_SUBMITTED', 'BUSINESS_SUBMITTED', 'PWA_INSTALLED', 'SEARCH_ALL_CITY_CLICKED', 'LANGUAGE_CHANGED', 'ACCESSIBILITY_OPENED', 'ACCESSIBILITY_FONT_CHANGED', 'ACCESSIBILITY_CONTRAST_TOGGLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN');

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhoods" (
    "id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_he" TEXT,
    "description_ru" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_name" TEXT,
    "description_he" TEXT,
    "description_ru" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_ru" TEXT,
    "slug_he" TEXT NOT NULL,
    "slug_ru" TEXT,
    "description_he" TEXT,
    "description_ru" TEXT,
    "city_id" TEXT NOT NULL,
    "neighborhood_id" TEXT NOT NULL,
    "address_he" TEXT,
    "address_ru" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "phone" TEXT,
    "whatsapp_number" TEXT,
    "website_url" VARCHAR(500),
    "email" VARCHAR(255),
    "opening_hours_he" TEXT,
    "opening_hours_ru" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinned_order" INTEGER,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'he',
    "neighborhood_id" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "whatsapp_number" TEXT,
    "website_url" TEXT,
    "email" TEXT,
    "opening_hours" TEXT,
    "category_id" TEXT NOT NULL,
    "submitter_name" TEXT,
    "submitter_email" TEXT,
    "submitter_phone" TEXT,
    "status" "PendingStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment_he" TEXT,
    "comment_ru" TEXT,
    "language" TEXT NOT NULL DEFAULT 'he',
    "author_name" TEXT,
    "author_user_id" TEXT,
    "author_ip_hash" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "properties" JSONB NOT NULL,
    "session_id" TEXT,
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "language" TEXT,
    "business_id" TEXT,
    "category_id" TEXT,
    "neighborhood_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'SUPERADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_he_key" ON "cities"("name_he");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_ru_key" ON "cities"("name_ru");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "neighborhoods_city_id_is_active_idx" ON "neighborhoods"("city_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "neighborhoods_city_id_slug_key" ON "neighborhoods"("city_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_he_key" ON "categories"("name_he");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_ru_key" ON "categories"("name_ru");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_is_popular_idx" ON "categories"("is_active", "is_popular");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_he_key" ON "businesses"("slug_he");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_ru_key" ON "businesses"("slug_ru");

-- CreateIndex
CREATE INDEX "businesses_category_id_neighborhood_id_is_visible_is_pinned_idx" ON "businesses"("category_id", "neighborhood_id", "is_visible", "is_pinned");

-- CreateIndex
CREATE INDEX "businesses_slug_he_idx" ON "businesses"("slug_he");

-- CreateIndex
CREATE INDEX "businesses_slug_ru_idx" ON "businesses"("slug_ru");

-- CreateIndex
CREATE INDEX "businesses_is_pinned_pinned_order_idx" ON "businesses"("is_pinned", "pinned_order");

-- CreateIndex
CREATE INDEX "businesses_neighborhood_id_idx" ON "businesses"("neighborhood_id");

-- CreateIndex
CREATE INDEX "businesses_deleted_at_idx" ON "businesses"("deleted_at");

-- CreateIndex
CREATE INDEX "pending_businesses_status_created_at_idx" ON "pending_businesses"("status", "created_at");

-- CreateIndex
CREATE INDEX "pending_businesses_category_id_idx" ON "pending_businesses"("category_id");

-- CreateIndex
CREATE INDEX "reviews_business_id_is_approved_created_at_idx" ON "reviews"("business_id", "is_approved", "created_at");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "events_type_created_at_idx" ON "events"("type", "created_at");

-- CreateIndex
CREATE INDEX "events_created_at_idx" ON "events"("created_at");

-- CreateIndex
CREATE INDEX "events_business_id_idx" ON "events"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_key_key" ON "admin_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhoods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_businesses" ADD CONSTRAINT "pending_businesses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_businesses" ADD CONSTRAINT "pending_businesses_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhoods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
