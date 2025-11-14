# Database Schema Design

## Overview

**Database**: PostgreSQL 15+
**ORM**: Prisma 5+
**Design Principles**:
- Bilingual by default (Hebrew + Russian)
- Soft deletes where applicable
- Audit trails (created_at, updated_at)
- Optimized indexes for common queries
- Strict validation at DB level

---

## Complete Prisma Schema

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations (if using Vercel Postgres)
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

model City {
  id          String         @id @default(cuid())
  name_he     String         @unique // "נתניה"
  name_ru     String         @unique // "Нетания"
  slug        String         @unique // "netanya"
  is_active   Boolean        @default(true)
  created_at  DateTime       @default(now())
  updated_at  DateTime       @updatedAt

  neighborhoods Neighborhood[]

  @@map("cities")
}

model Neighborhood {
  id          String         @id @default(cuid())
  city_id     String
  name_he     String         // "מרכז", "צפון", "דרום", "מזרח העיר"
  name_ru     String         // "Центр", "Север", "Юг", "Восток города"
  slug        String         // "merkaz", "tsafon", "darom", "mizrah-hair"
  description_he String?     @db.Text
  description_ru String?     @db.Text
  is_active   Boolean        @default(true)
  display_order Int          @default(0) // For admin sorting
  created_at  DateTime       @default(now())
  updated_at  DateTime       @updatedAt

  city        City           @relation(fields: [city_id], references: [id], onDelete: Cascade)
  businesses  Business[]
  pending_businesses PendingBusiness[]

  @@unique([city_id, slug])
  @@index([city_id, is_active])
  @@map("neighborhoods")
}

model Category {
  id          String         @id @default(cuid())
  name_he     String         @unique // "חשמלאים"
  name_ru     String         @unique // "Электрики"
  slug        String         @unique // "electricians"
  icon_name   String?        // "bolt" (for icon library)
  description_he String?     @db.Text
  description_ru String?     @db.Text
  is_active   Boolean        @default(true)
  is_popular  Boolean        @default(false) // For "Popular Categories" section
  display_order Int          @default(0)
  created_at  DateTime       @default(now())
  updated_at  DateTime       @updatedAt

  businesses  Business[]
  pending_businesses PendingBusiness[]

  @@index([is_active, is_popular])
  @@map("categories")
}

// ============================================================================
// BUSINESS ENTITIES
// ============================================================================

model Business {
  id              String         @id @default(cuid())

  // Basic Info (Bilingual)
  name_he         String
  name_ru         String?
  slug_he         String         @unique
  slug_ru         String?        @unique
  description_he  String?        @db.Text
  description_ru  String?        @db.Text

  // Location
  city_id         String         // Always "נתניה" for now
  neighborhood_id String
  address_he      String?
  address_ru      String?
  latitude        Decimal?       @db.Decimal(10, 8) // For future map features
  longitude       Decimal?       @db.Decimal(11, 8)

  // Contact (Validation: At least one of phone OR whatsapp_number required)
  phone           String?        // International format: +972501234567
  whatsapp_number String?        // International format: +972501234567
  website_url     String?        @db.VarChar(500)
  email           String?        @db.VarChar(255)

  // Operating Hours (JSON or structured text)
  opening_hours_he String?       @db.Text // "א׳-ה׳: 08:00-17:00, ו׳: 08:00-13:00"
  opening_hours_ru String?       @db.Text

  // Admin Flags
  is_visible      Boolean        @default(true)  // Hide from search
  is_verified     Boolean        @default(false) // Blue checkmark badge
  is_pinned       Boolean        @default(false) // Top X results
  pinned_order    Int?           // Order within pinned (1, 2, 3...)

  // Relationships
  category_id     String
  category        Category       @relation(fields: [category_id], references: [id], onDelete: Restrict)
  neighborhood    Neighborhood   @relation(fields: [neighborhood_id], references: [id], onDelete: Restrict)
  city_id_fk      City           @relation(fields: [city_id], references: [id], name: "business_city", onDelete: Restrict)

  // Child entities
  reviews         Review[]

  // Metadata
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt
  deleted_at      DateTime?      // Soft delete

  @@index([category_id, neighborhood_id, is_visible, is_pinned]) // Main search query
  @@index([slug_he])
  @@index([slug_ru])
  @@index([is_pinned, pinned_order]) // Top X logic
  @@index([neighborhood_id])
  @@index([deleted_at]) // Filter out soft-deleted
  @@map("businesses")
}

model PendingBusiness {
  id              String         @id @default(cuid())

  // Submitted Info (Bilingual optional - user chooses language)
  name            String
  description     String?        @db.Text
  language        String         @default("he") // "he" or "ru"

  // Location
  neighborhood_id String
  address         String?

  // Contact (Validation: At least one required)
  phone           String?
  whatsapp_number String?
  website_url     String?
  email           String?

  // Operating Hours
  opening_hours   String?        @db.Text

  // Category
  category_id     String
  category        Category       @relation(fields: [category_id], references: [id])
  neighborhood    Neighborhood   @relation(fields: [neighborhood_id], references: [id])

  // Submission metadata
  submitter_name  String?        // Optional: Who submitted
  submitter_email String?        // For follow-up
  submitter_phone String?

  // Admin workflow
  status          PendingStatus  @default(PENDING)
  admin_notes     String?        @db.Text
  reviewed_at     DateTime?

  // Metadata
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  @@index([status, created_at])
  @@index([category_id])
  @@map("pending_businesses")
}

enum PendingStatus {
  PENDING
  APPROVED
  REJECTED
}

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

model Review {
  id              String         @id @default(cuid())
  business_id     String

  // Rating & Content
  rating          Int            // 1-5 stars (validated at app level)
  comment_he      String?        @db.Text
  comment_ru      String?        @db.Text
  language        String         @default("he") // Which comment field to display

  // Author (Anonymous allowed)
  author_name     String?        // "יוסי כהן" or null (shows "אנונימי")
  author_user_id  String?        // For future user system
  author_ip_hash  String?        // Hashed IP for spam prevention

  // Moderation
  is_approved     Boolean        @default(true) // Can add approval workflow later
  is_flagged      Boolean        @default(false)

  // Relationships
  business        Business       @relation(fields: [business_id], references: [id], onDelete: Cascade)

  // Metadata
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  @@index([business_id, is_approved, created_at])
  @@index([created_at])
  @@map("reviews")
}

// ============================================================================
// ANALYTICS & EVENTS
// ============================================================================

model Event {
  id              String         @id @default(cuid())

  // Event details
  type            EventType
  properties      Json           // Flexible payload for different event types

  // Session tracking
  session_id      String?        // Browser session ID
  user_agent      String?        @db.Text
  ip_hash         String?        // Hashed for privacy
  language        String?        // "he" or "ru"

  // Related entities (optional)
  business_id     String?
  category_id     String?
  neighborhood_id String?

  // Metadata
  created_at      DateTime       @default(now())

  @@index([type, created_at])
  @@index([created_at])
  @@index([business_id])
  @@map("events")
}

enum EventType {
  SEARCH_PERFORMED
  BUSINESS_VIEWED
  CTA_CLICKED
  REVIEW_SUBMITTED
  BUSINESS_SUBMITTED
  PWA_INSTALLED
  SEARCH_ALL_CITY_CLICKED
  LANGUAGE_CHANGED
  ACCESSIBILITY_OPENED
  ACCESSIBILITY_FONT_CHANGED
  ACCESSIBILITY_CONTRAST_TOGGLED
}

// ============================================================================
// ADMIN & SETTINGS
// ============================================================================

model AdminSettings {
  id                  String         @id @default(cuid())
  key                 String         @unique // "top_pinned_count"
  value               String         // "4"
  description         String?        @db.Text
  updated_at          DateTime       @updatedAt

  @@map("admin_settings")
}

model AdminUser {
  id              String         @id @default(cuid())
  email           String         @unique
  password_hash   String         // bcrypt hash (NOT plain text!)
  name            String
  role            AdminRole      @default(SUPERADMIN)
  is_active       Boolean        @default(true)
  last_login_at   DateTime?
  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  @@map("admin_users")
}

enum AdminRole {
  SUPERADMIN
  // Future: MODERATOR, VIEWER
}
```

---

## Critical Validation Rules

### 1. Business Contact Validation
**Rule**: Must have at least one of `phone` OR `whatsapp_number`

**Implementation**:
```typescript
// In Zod schema (app/lib/validations/business.ts)
const businessSchema = z.object({
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  // ... other fields
}).refine(
  (data) => data.phone || data.whatsapp_number,
  {
    message: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות",
    path: ["phone"], // Show error on phone field
  }
)

// In Prisma (post-validate, pre-save)
// Use Prisma middleware or service layer validation
```

### 2. Rating Range
**Rule**: Rating must be 1-5

**Implementation**:
```typescript
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  // ...
})
```

### 3. Slug Uniqueness
**Rule**: Slugs must be unique per language

**Implementation**: Already enforced by `@unique` on `slug_he` and `slug_ru`

### 4. Pinned Order Logic
**Rule**: `pinned_order` should only exist if `is_pinned = true`

**Implementation**:
```typescript
// In service layer
if (is_pinned && !pinned_order) {
  // Auto-assign next order
  pinned_order = await getNextPinnedOrder()
}
if (!is_pinned) {
  pinned_order = null
}
```

---

## Key Indexes Explained

### 1. Main Search Query Index
```prisma
@@index([category_id, neighborhood_id, is_visible, is_pinned])
```
**Why**: 99% of queries filter by category + neighborhood + visibility, then sort by pinned status.

**Query**:
```sql
SELECT * FROM businesses
WHERE category_id = $1
  AND neighborhood_id = $2
  AND is_visible = true
  AND deleted_at IS NULL
ORDER BY is_pinned DESC, pinned_order ASC
```

### 2. Pinned Results Index
```prisma
@@index([is_pinned, pinned_order])
```
**Why**: Fast retrieval of Top X pinned businesses in correct order.

### 3. Reviews Index
```prisma
@@index([business_id, is_approved, created_at])
```
**Why**: Fetch approved reviews for a business, newest first.

### 4. Events Index
```prisma
@@index([type, created_at])
```
**Why**: Analytics queries: "Show all CTA_CLICKED events in last 7 days"

---

## Sample Queries

### Q1: Get Businesses for Search Results
```typescript
const results = await prisma.business.findMany({
  where: {
    category_id: categoryId,
    neighborhood_id: neighborhoodId,
    is_visible: true,
    deleted_at: null,
  },
  include: {
    category: true,
    neighborhood: true,
    reviews: {
      where: { is_approved: true },
      select: { rating: true },
    },
  },
  orderBy: [
    { is_pinned: 'desc' },
    { pinned_order: 'asc' },
    // Then apply custom logic for random 5 + rating sort
  ],
})

// Custom ordering logic (see 03-api-endpoints.md)
```

### Q2: Get Business Detail with Reviews
```typescript
const business = await prisma.business.findUnique({
  where: { slug_he: slug },
  include: {
    category: true,
    neighborhood: true,
    reviews: {
      where: { is_approved: true },
      orderBy: { created_at: 'desc' },
      take: 50, // Limit to recent 50
    },
  },
})

// Calculate average rating
const avgRating = business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
```

### Q3: Get Pending Businesses for Admin
```typescript
const pending = await prisma.pendingBusiness.findMany({
  where: { status: 'PENDING' },
  include: {
    category: true,
    neighborhood: true,
  },
  orderBy: { created_at: 'asc' },
})
```

### Q4: Analytics - Top Searched Categories
```typescript
const topCategories = await prisma.event.groupBy({
  by: ['category_id'],
  where: {
    type: 'SEARCH_PERFORMED',
    created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
  },
  _count: { category_id: true },
  orderBy: { _count: { category_id: 'desc' } },
  take: 10,
})
```

---

## Seed Data

### Initial Seed (for development)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Create City
  const netanya = await prisma.city.create({
    data: {
      name_he: 'נתניה',
      name_ru: 'Нетания',
      slug: 'netanya',
    },
  })

  // 2. Create Neighborhoods
  const neighborhoods = await Promise.all([
    prisma.neighborhood.create({
      data: {
        city_id: netanya.id,
        name_he: 'מרכז',
        name_ru: 'Центр',
        slug: 'merkaz',
        display_order: 1,
        description_he: 'מרכז העיר נתניה',
      },
    }),
    prisma.neighborhood.create({
      data: {
        city_id: netanya.id,
        name_he: 'צפון',
        name_ru: 'Север',
        slug: 'tsafon',
        display_order: 2,
        description_he: 'צפון נתניה',
      },
    }),
    prisma.neighborhood.create({
      data: {
        city_id: netanya.id,
        name_he: 'דרום',
        name_ru: 'Юг',
        slug: 'darom',
        display_order: 3,
        description_he: 'דרום נתניה',
      },
    }),
    prisma.neighborhood.create({
      data: {
        city_id: netanya.id,
        name_he: 'מזרח העיר',
        name_ru: 'Восток города',
        slug: 'mizrah-hair',
        display_order: 4,
        description_he: 'מזרח העיר נתניה',
      },
    }),
  ])

  // 3. Create Categories (Sample)
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name_he: 'חשמלאים',
        name_ru: 'Электрики',
        slug: 'electricians',
        icon_name: 'bolt',
        is_popular: true,
        display_order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name_he: 'אינסטלטורים',
        name_ru: 'Сантехники',
        slug: 'plumbers',
        icon_name: 'wrench',
        is_popular: true,
        display_order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name_he: 'ניקיון ועוזרות בית',
        name_ru: 'Уборка и домработницы',
        slug: 'cleaning',
        icon_name: 'sparkles',
        is_popular: true,
        display_order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name_he: 'שיפוצים וצבע',
        name_ru: 'Ремонт и покраска',
        slug: 'renovation',
        icon_name: 'paint-brush',
        display_order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name_he: 'שיער ויופי',
        name_ru: 'Парикмахерские и красота',
        slug: 'beauty',
        icon_name: 'scissors',
        is_popular: true,
        display_order: 5,
      },
    }),
    // Add remaining categories from sysAnal.md:44-54
  ])

  // 4. Admin Settings
  await prisma.adminSettings.create({
    data: {
      key: 'top_pinned_count',
      value: '4',
      description: 'Number of pinned businesses to show first in search results',
    },
  })

  // 5. Create Admin User (hashed password in production!)
  await prisma.adminUser.create({
    data: {
      email: '345287@gmail.com',
      password_hash: '$2a$10$...', // bcrypt hash of "admin1"
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
  })

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## Migrations Strategy

### Initial Migration
```bash
npx prisma migrate dev --name init
```

### Future Migrations (Examples)

#### Add GIS Support
```sql
-- migrations/add_postgis.sql
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE businesses
ADD COLUMN location GEOGRAPHY(POINT, 4326);

CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
```

#### Add Full-Text Search
```sql
-- migrations/add_fts.sql
ALTER TABLE businesses
ADD COLUMN search_vector_he tsvector,
ADD COLUMN search_vector_ru tsvector;

CREATE INDEX idx_businesses_search_he ON businesses USING GIN(search_vector_he);
CREATE INDEX idx_businesses_search_ru ON businesses USING GIN(search_vector_ru);

-- Trigger to auto-update search vectors
CREATE FUNCTION update_search_vectors() RETURNS trigger AS $$
BEGIN
  NEW.search_vector_he := to_tsvector('hebrew', coalesce(NEW.name_he, '') || ' ' || coalesce(NEW.description_he, ''));
  NEW.search_vector_ru := to_tsvector('russian', coalesce(NEW.name_ru, '') || ' ' || coalesce(NEW.description_ru, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_search_vectors
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION update_search_vectors();
```

---

## Database Backup Strategy

### Development
- Vercel Postgres: Automatic daily backups (retained 7 days on Hobby, 14 days on Pro)
- Manual: `pg_dump` weekly

### Production
- Automated daily backups to S3/Backblaze
- Point-in-time recovery enabled
- Test restore quarterly

---

## Performance Considerations

### Query Optimization
1. **Always filter by `deleted_at IS NULL`** for soft-deleted entities
2. **Use `select` to limit returned fields** (don't fetch all columns if not needed)
3. **Paginate reviews** (don't load 1000 reviews at once)
4. **Cache active categories/neighborhoods** in Redis (change infrequently)

### Connection Pooling
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Security Considerations

### 1. Password Hashing
**NEVER store plain-text passwords**

```typescript
import bcrypt from 'bcryptjs'

// On admin creation/update
const password_hash = await bcrypt.hash(password, 10)

// On login
const isValid = await bcrypt.compare(inputPassword, admin.password_hash)
```

### 2. IP Hashing (GDPR Compliance)
```typescript
import crypto from 'crypto'

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex')
}
```

### 3. SQL Injection Prevention
- Prisma automatically prevents SQL injection via parameterized queries
- Never use raw SQL with user input unless properly escaped

### 4. Soft Deletes
- Instead of hard-deleting businesses, set `deleted_at`
- Allows recovery and audit trail
- Filter out in queries: `where: { deleted_at: null }`

---

## Redis Schema (for Bug Tracking)

```typescript
// In Redis (Upstash)

// Key: user_messages (List)
// Structure:
[
  {
    timestamp: "2025-10-17T09:08:00Z",
    messageText: "#bug - show only future events",
    userId: "...",
    phone: "+972501234567",
    direction: "incoming",
    status: "pending" // or "fixed"
  },
  // ...more messages
]

// Operations:
// Add new message
await redis.lpush('user_messages', JSON.stringify(message))

// Get all pending bugs
const messages = await redis.lrange('user_messages', 0, -1)
const bugs = messages
  .map(m => JSON.parse(m))
  .filter(m => m.messageText.startsWith('#') && m.status === 'pending')

// Mark bug as fixed
await redis.lset('user_messages', index, JSON.stringify({
  ...bug,
  status: 'fixed',
  fixedAt: new Date().toISOString(),
  commitHash: gitHash
}))
```

---

## Next Steps

1. **Create schema file**: `prisma/schema.prisma`
2. **Set up DATABASE_URL** in `.env`
3. **Run migration**: `npx prisma migrate dev --name init`
4. **Create seed script**: `prisma/seed.ts`
5. **Run seed**: `npx prisma db seed`
6. **Test queries** in Prisma Studio: `npx prisma studio`

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Related Docs**: `01-tech-stack.md`, `03-api-endpoints.md`
