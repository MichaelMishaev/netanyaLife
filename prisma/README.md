# Prisma Database Schema

This folder contains the database schema and migrations for Netanya Local.

## Schema Overview

### Core Entities (3 tables)
- **cities** - City information (currently only Netanya)
- **neighborhoods** - 4 neighborhoods: מרכז, צפון, דרום, מזרח העיר
- **categories** - Service types (חשמלאים, אינסטלטורים, etc.)

### Business Entities (2 tables)
- **businesses** - Approved business listings
- **pending_businesses** - Submissions awaiting admin approval

### Reviews & Ratings (1 table)
- **reviews** - User reviews with 1-5 star ratings

### Analytics (1 table)
- **events** - User actions tracking (searches, clicks, views)

### Admin (2 tables)
- **admin_users** - Admin accounts with bcrypt passwords
- **admin_settings** - Key-value settings (e.g., top_pinned_count)

## Database Commands

```bash
# Open Prisma Studio (GUI)
npm run prisma:studio

# Create new migration after schema changes
npm run prisma:migrate

# Generate Prisma Client after schema changes
npm run prisma:generate

# Seed database with initial data (Day 3)
npm run prisma:seed

# Reset database (⚠️ DANGER: Deletes all data)
npx prisma migrate reset
```

## Schema Structure

Total: **9 tables + 3 enums**

### Tables
1. cities
2. neighborhoods
3. categories
4. businesses
5. pending_businesses
6. reviews
7. events
8. admin_settings
9. admin_users

### Enums
1. **PendingStatus**: PENDING, APPROVED, REJECTED
2. **EventType**: 11 event types (search, view, click, etc.)
3. **AdminRole**: SUPERADMIN (+ future: MODERATOR, VIEWER)

## Critical Validation Rules

### 1. Business Contact
- **Rule**: Must have phone OR whatsapp_number (at least one)
- **Error**: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות"
- **Implementation**: Zod refine in `lib/validations/business.ts`

### 2. Rating Range
- **Rule**: 1-5 stars only
- **Validation**: Client + server-side Zod validation

### 3. Soft Deletes
- **Rule**: Businesses have `deleted_at` field for soft deletes
- **Queries**: Always filter `WHERE deleted_at IS NULL`

## Indexes

All queries are optimized with appropriate indexes:

- **Search queries**: `category_id + neighborhood_id + is_visible + is_pinned`
- **Pinned logic**: `is_pinned + pinned_order`
- **Analytics**: `type + created_at`, `business_id`
- **Reviews**: `business_id + is_approved + created_at`

## Bilingual Design

All user-facing content has both Hebrew and Russian fields:
- `name_he` / `name_ru`
- `description_he` / `description_ru`
- `slug_he` / `slug_ru` (for URLs)

## Relationships

```
City (1) ─→ (many) Neighborhood
City (1) ─→ (many) Business
Neighborhood (1) ─→ (many) Business
Neighborhood (1) ─→ (many) PendingBusiness
Category (1) ─→ (many) Business
Category (1) ─→ (many) PendingBusiness
Business (1) ─→ (many) Review
```

## Next Steps (Day 3)

Tomorrow we'll create `prisma/seed.ts` to populate:
- 1 city (Netanya)
- 4 neighborhoods
- 10+ service categories
- Sample businesses for testing
- 1 admin user

See `docs/devPlan/06-implementation-priorities.md` Day 3 for details.

---

**Last Updated**: Day 2 - Database Setup Complete ✅
