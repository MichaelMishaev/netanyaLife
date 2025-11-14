# API Endpoints Specification

## Overview

**Architecture**: Next.js App Router with Server Actions + API Routes
**Authentication**: NextAuth sessions for admin endpoints
**Rate Limiting**: Redis-based for public endpoints
**Error Handling**: Standardized JSON responses

---

## Public API Routes

### 1. Event Tracking

#### `POST /api/events`
Track user analytics events

**Request**:
```json
{
  "type": "SEARCH_PERFORMED" | "BUSINESS_VIEWED" | "CTA_CLICKED" | ...,
  "properties": {
    "business_id": "clx...",
    "category_id": "clx...",
    "neighborhood_id": "clx...",
    // ... other event-specific data
  },
  "session_id": "uuid",
  "language": "he" | "ru"
}
```

**Response**:
```json
{
  "success": true
}
```

**Implementation**:
```typescript
// app/api/events/route.ts
import { prisma } from '@/lib/prisma'
import { hashIP } from '@/lib/utils/security'
import { rateLimit } from '@/lib/redis'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

  // Rate limit: 100 events per minute per IP
  const { success } = await rateLimit.check(req, '100 per 1m', `events:${hashIP(ip)}`)
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { type, properties, session_id, language } = await req.json()
  const userAgent = req.headers.get('user-agent')

  await prisma.event.create({
    data: {
      type,
      properties,
      session_id,
      language,
      user_agent: userAgent,
      ip_hash: ip ? hashIP(ip) : null,
    },
  })

  return Response.json({ success: true })
}
```

**Rate Limiting**: 100 events/minute per IP

---

### 2. Review Submission (Server Action)

#### `submitReview(businessId, data)`
Submit a new review for a business

**Input**:
```typescript
{
  rating: number (1-5),
  comment?: string,
  author_name?: string
}
```

**Validation**:
```typescript
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  author_name: z.string().max(100).optional(),
})
```

**Implementation**:
```typescript
// app/actions/reviews.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getLocale } from 'next-intl/server'
import { hashIP, getClientIP } from '@/lib/utils/security'
import { rateLimit } from '@/lib/redis'

export async function submitReview(businessId: string, data: ReviewInput) {
  const ip = await getClientIP()

  // Rate limit: 5 reviews per hour per IP
  const { success } = await rateLimit.check(ip, '5 per 1h', `review:${hashIP(ip)}`)
  if (!success) {
    return { error: 'Rate limit exceeded. Please try again later.' }
  }

  // Validate
  const validated = reviewSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const locale = await getLocale()

  // Create review
  await prisma.review.create({
    data: {
      business_id: businessId,
      rating: validated.data.rating,
      comment_he: locale === 'he' ? validated.data.comment : null,
      comment_ru: locale === 'ru' ? validated.data.comment : null,
      language: locale,
      author_name: validated.data.author_name || null,
      author_ip_hash: hashIP(ip),
    },
  })

  // Track event
  await prisma.event.create({
    data: {
      type: 'REVIEW_SUBMITTED',
      properties: { business_id: businessId, rating: validated.data.rating },
      language: locale,
    },
  })

  // Revalidate business page
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug_he: true, slug_ru: true },
  })
  revalidatePath(`/[locale]/business/${locale === 'he' ? business.slug_he : business.slug_ru}`)

  return { success: true }
}
```

**Rate Limiting**: 5 reviews/hour per IP

---

### 3. Business Submission (Server Action)

#### `submitBusiness(data)`
Submit a new business for approval

**Input**:
```typescript
{
  name: string,
  category_id: string,
  neighborhood_id: string,
  description?: string,
  address?: string,
  phone?: string, // Must have phone OR whatsapp_number
  whatsapp_number?: string,
  website_url?: string,
  opening_hours?: string,
  submitter_name?: string,
  submitter_email?: string,
  submitter_phone?: string
}
```

**Validation**:
```typescript
const addBusinessSchema = z.object({
  name: z.string().min(2).max(200),
  category_id: z.string().cuid(),
  neighborhood_id: z.string().cuid(),
  description: z.string().max(2000).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().regex(/^\+972\d{9}$/).optional(),
  whatsapp_number: z.string().regex(/^\+972\d{9}$/).optional(),
  website_url: z.string().url().max(500).optional(),
  opening_hours: z.string().max(500).optional(),
  submitter_name: z.string().max(100).optional(),
  submitter_email: z.string().email().optional(),
  submitter_phone: z.string().optional(),
}).refine(
  (data) => data.phone || data.whatsapp_number,
  {
    message: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות",
    path: ["phone"],
  }
)
```

**Implementation**:
```typescript
// app/actions/businesses.ts
'use server'

export async function submitBusiness(data: AddBusinessInput) {
  const ip = await getClientIP()

  // Rate limit: 3 submissions per day per IP
  const { success } = await rateLimit.check(ip, '3 per 1d', `business:${hashIP(ip)}`)
  if (!success) {
    return { error: 'You have reached the daily submission limit.' }
  }

  // Validate
  const validated = addBusinessSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const locale = await getLocale()

  // Create pending business
  await prisma.pendingBusiness.create({
    data: {
      name: validated.data.name,
      description: validated.data.description,
      language: locale,
      category_id: validated.data.category_id,
      neighborhood_id: validated.data.neighborhood_id,
      phone: validated.data.phone,
      whatsapp_number: validated.data.whatsapp_number,
      website_url: validated.data.website_url,
      opening_hours: validated.data.opening_hours,
      address: validated.data.address,
      submitter_name: validated.data.submitter_name,
      submitter_email: validated.data.submitter_email,
      submitter_phone: validated.data.submitter_phone,
      status: 'PENDING',
    },
  })

  // Track event
  await prisma.event.create({
    data: {
      type: 'BUSINESS_SUBMITTED',
      properties: {
        category_id: validated.data.category_id,
        neighborhood_id: validated.data.neighborhood_id,
      },
      language: locale,
    },
  })

  return { success: true }
}
```

**Rate Limiting**: 3 submissions/day per IP

---

### 4. Get Active Categories (Server Component)

#### `getActiveCategories(locale)`
Fetch all active categories for dropdowns

**Implementation**:
```typescript
// lib/queries/categories.ts
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function getActiveCategories(locale: 'he' | 'ru') {
  // Try cache first (1 hour TTL)
  const cached = await redis.get(`categories:active:${locale}`)
  if (cached) {
    return JSON.parse(cached)
  }

  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
      icon_name: true,
    },
  })

  // Map to locale-specific format
  const formatted = categories.map(c => ({
    id: c.id,
    name: locale === 'he' ? c.name_he : c.name_ru,
    slug: c.slug,
    icon: c.icon_name,
  }))

  // Cache for 1 hour
  await redis.setex(`categories:active:${locale}`, 3600, JSON.stringify(formatted))

  return formatted
}
```

**Cache**: 1 hour (Redis)

---

### 5. Get Active Neighborhoods (Server Component)

#### `getActiveNeighborhoods(locale)`
Fetch all active neighborhoods for dropdowns

**Implementation**:
```typescript
// lib/queries/neighborhoods.ts
export async function getActiveNeighborhoods(locale: 'he' | 'ru') {
  // Try cache first (1 hour TTL)
  const cached = await redis.get(`neighborhoods:active:${locale}`)
  if (cached) {
    return JSON.parse(cached)
  }

  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true, city_id: NETANYA_CITY_ID },
    orderBy: { display_order: 'asc' },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
    },
  })

  const formatted = neighborhoods.map(n => ({
    id: n.id,
    name: locale === 'he' ? n.name_he : n.name_ru,
    slug: n.slug,
  }))

  // Cache for 1 hour
  await redis.setex(`neighborhoods:active:${locale}`, 3600, JSON.stringify(formatted))

  return formatted
}
```

**Cache**: 1 hour (Redis)

---

### 6. Get Search Results (Server Component)

#### `getSearchResults({ categorySlug, neighborhoodSlug, locale })`
Fetch businesses for search results page with proper ordering

**Implementation**:
```typescript
// lib/queries/businesses.ts
export async function getSearchResults({
  categorySlug,
  neighborhoodSlug,
  locale,
}: {
  categorySlug: string
  neighborhoodSlug: string
  locale: 'he' | 'ru'
}) {
  // 1. Fetch all visible businesses matching category + neighborhood
  const businesses = await prisma.business.findMany({
    where: {
      category: { slug: categorySlug },
      neighborhood: { slug: neighborhoodSlug },
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
  })

  // 2. Calculate average rating for each
  const withRatings = businesses.map(b => ({
    ...b,
    avgRating: b.reviews.length > 0
      ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
      : 0,
    reviewCount: b.reviews.length,
  }))

  // 3. Get Top X setting from admin
  const topPinnedCount = await getAdminSetting('top_pinned_count', 4)

  // 4. Separate pinned from regular
  const pinned = withRatings
    .filter(b => b.is_pinned)
    .sort((a, b) => (a.pinned_order || 0) - (b.pinned_order || 0))

  const regular = withRatings.filter(b => !b.is_pinned)

  // 5. Top X pinned (first in results)
  const topPinned = pinned.slice(0, topPinnedCount)

  // 6. Remaining businesses (pinned after X + all regular)
  const remaining = [...pinned.slice(topPinnedCount), ...regular]

  // 7. Random 5 from remaining
  const random5 = shuffle(remaining).slice(0, 5)

  // 8. Rest sorted by rating desc, then newest
  const rest = remaining
    .filter(b => !random5.includes(b))
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  // 9. Final order: Top Pinned → Random 5 → Rest
  const orderedResults = [...topPinned, ...random5, ...rest]

  // 10. Format for display (localized fields)
  return orderedResults.map(b => ({
    id: b.id,
    name: locale === 'he' ? b.name_he : b.name_ru || b.name_he,
    slug: locale === 'he' ? b.slug_he : b.slug_ru || b.slug_he,
    description: locale === 'he' ? b.description_he : b.description_ru || b.description_he,
    category: locale === 'he' ? b.category.name_he : b.category.name_ru,
    neighborhood: locale === 'he' ? b.neighborhood.name_he : b.neighborhood.name_ru,
    phone: b.phone,
    whatsapp_number: b.whatsapp_number,
    avgRating: b.avgRating,
    reviewCount: b.reviewCount,
    is_verified: b.is_verified,
  }))
}

// Helper: Shuffle array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Helper: Get admin setting
async function getAdminSetting(key: string, defaultValue: any) {
  const setting = await prisma.adminSettings.findUnique({
    where: { key },
  })
  return setting ? parseInt(setting.value) : defaultValue
}
```

**Cache**: None (results change frequently with pinned/random logic)
**Performance**: Indexed query on `[category_id, neighborhood_id, is_visible, is_pinned]`

---

### 7. Get Business Detail (Server Component)

#### `getBusiness({ slug, locale })`
Fetch single business with reviews

**Implementation**:
```typescript
// lib/queries/businesses.ts
export async function getBusiness({
  slug,
  locale,
}: {
  slug: string
  locale: 'he' | 'ru'
}) {
  const slugField = locale === 'he' ? 'slug_he' : 'slug_ru'

  const business = await prisma.business.findFirst({
    where: {
      OR: [
        { slug_he: slug },
        { slug_ru: slug },
      ],
      is_visible: true,
      deleted_at: null,
    },
    include: {
      category: true,
      neighborhood: true,
      reviews: {
        where: { is_approved: true },
        orderBy: { created_at: 'desc' },
        take: 50, // Limit to recent 50 reviews
      },
    },
  })

  if (!business) {
    return null
  }

  // Calculate average rating
  const avgRating = business.reviews.length > 0
    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
    : 0

  // Format reviews
  const reviews = business.reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: locale === 'he' ? r.comment_he : r.comment_ru || r.comment_he,
    author: r.author_name || 'אנונימי',
    date: r.created_at,
  }))

  return {
    id: business.id,
    name: locale === 'he' ? business.name_he : business.name_ru || business.name_he,
    slug: locale === 'he' ? business.slug_he : business.slug_ru || business.slug_he,
    description: locale === 'he' ? business.description_he : business.description_ru,
    address: locale === 'he' ? business.address_he : business.address_ru,
    openingHours: locale === 'he' ? business.opening_hours_he : business.opening_hours_ru,
    phone: business.phone,
    whatsapp_number: business.whatsapp_number,
    website_url: business.website_url,
    category: {
      name: locale === 'he' ? business.category.name_he : business.category.name_ru,
      slug: business.category.slug,
    },
    neighborhood: {
      name: locale === 'he' ? business.neighborhood.name_he : business.neighborhood.name_ru,
      slug: business.neighborhood.slug,
    },
    is_verified: business.is_verified,
    avgRating,
    reviewCount: business.reviews.length,
    reviews,
  }
}
```

**Cache**: None (reviews update frequently)
**Performance**: Indexed query on `slug_he` and `slug_ru`

---

## Admin API Routes (Protected)

### Authentication Middleware

```typescript
// lib/auth/middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function requireAdmin(req: Request) {
  const session = await auth()

  if (!session || session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null // Continue
}
```

---

### 8. Toggle Business Visibility (Server Action)

#### `toggleVisible(businessId)`

**Implementation**:
```typescript
// app/admin/actions/businesses.ts
'use server'

import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function toggleVisible(businessId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  await prisma.business.update({
    where: { id: businessId },
    data: { is_visible: !business.is_visible },
  })

  revalidatePath('/admin/businesses')
  return { success: true }
}
```

---

### 9. Toggle Verified Badge (Server Action)

#### `toggleVerified(businessId)`

**Implementation**:
```typescript
export async function toggleVerified(businessId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  await prisma.business.update({
    where: { id: businessId },
    data: { is_verified: !business.is_verified },
  })

  revalidatePath('/admin/businesses')
  return { success: true }
}
```

---

### 10. Toggle Pinned Status (Server Action)

#### `togglePinned(businessId)`

**Implementation**:
```typescript
export async function togglePinned(businessId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business.is_pinned) {
    // Pin it: assign next order
    const maxOrder = await prisma.business.findFirst({
      where: { is_pinned: true },
      orderBy: { pinned_order: 'desc' },
      select: { pinned_order: true },
    })

    await prisma.business.update({
      where: { id: businessId },
      data: {
        is_pinned: true,
        pinned_order: (maxOrder?.pinned_order || 0) + 1,
      },
    })
  } else {
    // Unpin it
    await prisma.business.update({
      where: { id: businessId },
      data: {
        is_pinned: false,
        pinned_order: null,
      },
    })
  }

  revalidatePath('/admin/businesses')
  return { success: true }
}
```

---

### 11. Approve Pending Business (Server Action)

#### `approveBusiness(pendingId)`

**Implementation**:
```typescript
export async function approveBusiness(pendingId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const pending = await prisma.pendingBusiness.findUnique({
    where: { id: pendingId },
    include: { category: true, neighborhood: true },
  })

  if (!pending) throw new Error('Pending business not found')

  // Generate slugs
  const slug_he = pending.language === 'he' ? generateSlug(pending.name) : null
  const slug_ru = pending.language === 'ru' ? generateSlug(pending.name) : null

  // Create approved business
  await prisma.business.create({
    data: {
      name_he: pending.language === 'he' ? pending.name : '',
      name_ru: pending.language === 'ru' ? pending.name : '',
      slug_he: slug_he || generateSlug(pending.name), // Fallback
      slug_ru: slug_ru,
      description_he: pending.language === 'he' ? pending.description : null,
      description_ru: pending.language === 'ru' ? pending.description : null,
      city_id: pending.neighborhood.city_id,
      neighborhood_id: pending.neighborhood_id,
      category_id: pending.category_id,
      phone: pending.phone,
      whatsapp_number: pending.whatsapp_number,
      website_url: pending.website_url,
      address_he: pending.language === 'he' ? pending.address : null,
      address_ru: pending.language === 'ru' ? pending.address : null,
      opening_hours_he: pending.language === 'he' ? pending.opening_hours : null,
      opening_hours_ru: pending.language === 'ru' ? pending.opening_hours : null,
      is_visible: true,
      is_verified: false,
    },
  })

  // Update pending status
  await prisma.pendingBusiness.update({
    where: { id: pendingId },
    data: {
      status: 'APPROVED',
      reviewed_at: new Date(),
    },
  })

  revalidatePath('/admin/pending')
  return { success: true }
}

// Helper: Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-z0-9]+/g, '-') // Keep Hebrew, Latin, numbers
    .replace(/^-+|-+$/g, '') // Trim dashes
}
```

---

### 12. Reject Pending Business (Server Action)

#### `rejectBusiness(pendingId, reason?)`

**Implementation**:
```typescript
export async function rejectBusiness(pendingId: string, reason?: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await prisma.pendingBusiness.update({
    where: { id: pendingId },
    data: {
      status: 'REJECTED',
      admin_notes: reason,
      reviewed_at: new Date(),
    },
  })

  revalidatePath('/admin/pending')
  return { success: true }
}
```

---

### 13. Update Admin Settings (Server Action)

#### `updateSetting(key, value)`

**Implementation**:
```typescript
export async function updateSetting(key: string, value: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await prisma.adminSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  // Invalidate cache if categories/neighborhoods changed
  if (key === 'top_pinned_count') {
    // No cache to invalidate (search results not cached)
  }

  revalidatePath('/admin/settings')
  return { success: true }
}
```

---

### 14. Create Category (Server Action)

#### `createCategory(data)`

**Input**:
```typescript
{
  name_he: string,
  name_ru: string,
  slug: string,
  icon_name?: string,
  is_popular?: boolean,
  display_order?: number
}
```

**Implementation**:
```typescript
export async function createCategory(data: CategoryInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await prisma.category.create({
    data: {
      name_he: data.name_he,
      name_ru: data.name_ru,
      slug: data.slug,
      icon_name: data.icon_name,
      is_popular: data.is_popular || false,
      display_order: data.display_order || 0,
      is_active: true,
    },
  })

  // Invalidate cache
  await redis.del('categories:active:he', 'categories:active:ru')

  revalidatePath('/admin/categories')
  return { success: true }
}
```

---

### 15. Update Category (Server Action)

#### `updateCategory(categoryId, data)`

Similar to `createCategory`, but uses `prisma.category.update`

---

### 16. Toggle Category Active (Server Action)

#### `toggleCategoryActive(categoryId)`

**Implementation**:
```typescript
export async function toggleCategoryActive(categoryId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  })

  await prisma.category.update({
    where: { id: categoryId },
    data: { is_active: !category.is_active },
  })

  // Invalidate cache
  await redis.del('categories:active:he', 'categories:active:ru')

  revalidatePath('/admin/categories')
  return { success: true }
}
```

---

### 17-19: Neighborhood CRUD (Server Actions)

Similar structure to category actions:
- `createNeighborhood(data)`
- `updateNeighborhood(neighborhoodId, data)`
- `toggleNeighborhoodActive(neighborhoodId)`

---

### 20. Get Admin Analytics (Server Component)

#### `getAdminAnalytics({ startDate, endDate })`

**Implementation**:
```typescript
// lib/queries/analytics.ts
export async function getAdminAnalytics({
  startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate = new Date(),
}: {
  startDate?: Date
  endDate?: Date
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // Top searched categories
  const topCategories = await prisma.event.groupBy({
    by: ['category_id'],
    where: {
      type: 'SEARCH_PERFORMED',
      created_at: { gte: startDate, lte: endDate },
      category_id: { not: null },
    },
    _count: { category_id: true },
    orderBy: { _count: { category_id: 'desc' } },
    take: 10,
  })

  // Top neighborhoods
  const topNeighborhoods = await prisma.event.groupBy({
    by: ['neighborhood_id'],
    where: {
      type: 'SEARCH_PERFORMED',
      created_at: { gte: startDate, lte: endDate },
      neighborhood_id: { not: null },
    },
    _count: { neighborhood_id: true },
    orderBy: { _count: { neighborhood_id: 'desc' } },
    take: 10,
  })

  // Total counts
  const totalSearches = await prisma.event.count({
    where: {
      type: 'SEARCH_PERFORMED',
      created_at: { gte: startDate, lte: endDate },
    },
  })

  const totalBusinessViews = await prisma.event.count({
    where: {
      type: 'BUSINESS_VIEWED',
      created_at: { gte: startDate, lte: endDate },
    },
  })

  const totalReviews = await prisma.event.count({
    where: {
      type: 'REVIEW_SUBMITTED',
      created_at: { gte: startDate, lte: endDate },
    },
  })

  // CTA click distribution
  const ctaClicks = await prisma.event.groupBy({
    by: ['properties'],
    where: {
      type: 'CTA_CLICKED',
      created_at: { gte: startDate, lte: endDate },
    },
    _count: true,
  })

  // Parse CTA types from properties JSON
  const ctaDistribution = ctaClicks.reduce((acc, click) => {
    const type = (click.properties as any).type
    acc[type] = (acc[type] || 0) + click._count
    return acc
  }, {} as Record<string, number>)

  // Language distribution
  const languageDistribution = await prisma.event.groupBy({
    by: ['language'],
    where: {
      created_at: { gte: startDate, lte: endDate },
    },
    _count: { language: true },
  })

  // Accessibility usage
  const accessibilityOpened = await prisma.event.count({
    where: {
      type: 'ACCESSIBILITY_OPENED',
      created_at: { gte: startDate, lte: endDate },
    },
  })

  const accessibilityFontChanged = await prisma.event.count({
    where: {
      type: 'ACCESSIBILITY_FONT_CHANGED',
      created_at: { gte: startDate, lte: endDate },
    },
  })

  const accessibilityContrastToggled = await prisma.event.count({
    where: {
      type: 'ACCESSIBILITY_CONTRAST_TOGGLED',
      created_at: { gte: startDate, lte: endDate },
    },
  })

  return {
    topCategories,
    topNeighborhoods,
    totalSearches,
    totalBusinessViews,
    totalReviews,
    ctaDistribution,
    languageDistribution,
    accessibility: {
      opened: accessibilityOpened,
      fontChanged: accessibilityFontChanged,
      contrastToggled: accessibilityContrastToggled,
    },
  }
}
```

---

## Rate Limiting Implementation

### Redis-based Rate Limiter

```typescript
// lib/redis/rateLimiter.ts
import { redis } from '@/lib/redis'

export async function checkRateLimit(
  key: string,
  limit: number,
  window: number // seconds
): Promise<{ success: boolean; remaining: number }> {
  const current = await redis.get(key)

  if (!current) {
    await redis.setex(key, window, '1')
    return { success: true, remaining: limit - 1 }
  }

  const count = parseInt(current)

  if (count >= limit) {
    return { success: false, remaining: 0 }
  }

  await redis.incr(key)
  return { success: true, remaining: limit - count - 1 }
}

// Usage:
// const { success } = await checkRateLimit(`review:${ip}`, 5, 3600) // 5 per hour
```

---

## Error Handling Standards

### API Route Errors

```typescript
// Return format
{
  error: string,
  code?: string,
  details?: any
}

// Status codes
200 - Success
400 - Bad request (validation error)
401 - Unauthorized
403 - Forbidden
404 - Not found
429 - Rate limit exceeded
500 - Internal server error
```

### Server Action Errors

```typescript
// Return format
{
  success?: boolean,
  error?: string,
  data?: any
}

// Example
export async function someAction() {
  try {
    // ... logic
    return { success: true, data: result }
  } catch (error) {
    console.error(error)
    return { error: 'Something went wrong' }
  }
}
```

---

## Security Checklist

- [x] All admin endpoints check `await auth()` session
- [x] Rate limiting on public endpoints (events, reviews, business submissions)
- [x] IP hashing for privacy (GDPR compliant)
- [x] Input validation with Zod schemas
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (React escapes by default)
- [x] CSRF protection (NextAuth built-in)
- [x] No sensitive data in client-side code

---

## Performance Optimization

### Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Active categories | Redis | 1 hour | On category create/update/toggle |
| Active neighborhoods | Redis | 1 hour | On neighborhood create/update/toggle |
| Search results | None | N/A | N/A (dynamic ordering) |
| Business detail | None | N/A | revalidatePath on review submit |

### Database Indexes

All critical indexes are defined in Prisma schema (see `02-database-schema.md`):
- `[category_id, neighborhood_id, is_visible, is_pinned]` - Main search query
- `[is_pinned, pinned_order]` - Top X pinned businesses
- `[business_id, is_approved, created_at]` - Reviews for business
- `[type, created_at]` - Analytics queries

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Related Docs**: `02-database-schema.md`, `03-development-phases.md`
