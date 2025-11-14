# Development Phases & Timeline

## Overview

**Total Estimated Time**: 8-10 weeks (solo developer, part-time)
**Deployment Strategy**: Continuous deployment with Vercel previews
**Testing Strategy**: Test each phase before moving to next

---

## Phase 0: Project Setup & Infrastructure (Week 1)

### Goals
- Initialize project with all core dependencies
- Set up development environment
- Configure database and Redis
- Establish deployment pipeline

### Tasks

#### 0.1: Project Initialization
```bash
# Create Next.js project
npx create-next-app@latest netanya-local \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd netanya-local
git init
git add .
git commit -m "Initial Next.js setup"
```

#### 0.2: Install Core Dependencies
```bash
# i18n & UI
pnpm add next-intl @headlessui/react @heroicons/react

# Database & ORM
pnpm add @prisma/client
pnpm add -D prisma

# Redis
pnpm add @upstash/redis

# Auth
pnpm add next-auth@beta bcryptjs
pnpm add -D @types/bcryptjs

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# PWA
pnpm add next-pwa

# Development tools
pnpm add -D @types/node eslint-plugin-jsx-a11y
```

#### 0.3: Configure Prisma
```bash
npx prisma init --datasource-provider postgresql
```
- Copy schema from `02-database-schema.md`
- Set `DATABASE_URL` in `.env.local`
- Run initial migration: `npx prisma migrate dev --name init`

#### 0.4: Set Up Redis (Upstash)
- Create Upstash account
- Create Redis database
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`
- Create `lib/redis.ts` client

#### 0.5: Configure i18n (next-intl)
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['he', 'ru'],
  defaultLocale: 'he',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

Create folder structure:
```
messages/
  he.json
  ru.json
app/
  [locale]/
    layout.tsx
    page.tsx
```

#### 0.6: Set Up Vercel Project
```bash
# Install Vercel CLI
pnpm add -D vercel

# Link project
vercel link

# Add environment variables via Vercel dashboard
# - DATABASE_URL
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
```

#### 0.7: Configure Tailwind for RTL
```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-rtl'),
  ],
}
```

Add Heebo font to `app/[locale]/layout.tsx`:
```typescript
import { Heebo } from 'next/font/google'

const heebo = Heebo({ subsets: ['hebrew', 'latin', 'cyrillic'] })
```

#### 0.8: Seed Database
```bash
# Create seed script (see 02-database-schema.md)
npx prisma db seed
```

### Deliverables
- ✅ Next.js project running locally
- ✅ Database migrated and seeded
- ✅ Redis connected
- ✅ i18n routing working (`/he` and `/ru`)
- ✅ Vercel project linked
- ✅ Git repository with initial commit

### Testing
- [ ] Can access `/he` and `/ru` routes
- [ ] Prisma Studio shows seeded data: `npx prisma studio`
- [ ] Redis connection works (test with simple get/set)

---

## Phase 1: Core Client Pages (Weeks 2-3)

### Goals
- Build public-facing pages
- Implement search functionality
- Create business listing and detail pages
- NO admin panel yet

### Tasks

#### 1.1: Home Page (`app/[locale]/page.tsx`)
**Components to create**:
- `HeroSection` - Title, subtitle, main CTA
- `SearchCard` - Service type & neighborhood dropdowns + search button
- `PopularCategories` - Horizontal chips
- `NeighborhoodGrid` - 3 buttons (צפון/דרום/מזרח)

**Data fetching**:
```typescript
// Server Component
const categories = await prisma.category.findMany({
  where: { is_active: true, is_popular: true },
  orderBy: { display_order: 'asc' }
})

const neighborhoods = await prisma.neighborhood.findMany({
  where: { is_active: true, city_id: NETANYA_CITY_ID },
  orderBy: { display_order: 'asc' }
})
```

**Translations** (`messages/he.json`):
```json
{
  "home": {
    "hero": {
      "title": "🏙️ רק לתושבי נתניה!",
      "subtitle": "מדריך עסקים מקומי לפי שכונות – מרכז, צפון, דרום ומזרח העיר.",
      "cta": "התחילו חיפוש לפי שירות ושכונה"
    },
    "search": {
      "serviceLabel": "סוג שירות",
      "servicePlaceholder": "בחרו סוג שירות",
      "neighborhoodLabel": "שכונה",
      "searchButton": "חיפוש"
    },
    "popular": "קטגוריות פופולריות",
    "neighborhoods": "שכונות בנתניה"
  }
}
```

#### 1.2: Search Results Page (`app/[locale]/netanya/[neighborhood]/[category]/page.tsx`)

**URL Examples**:
- `/he/netanya/tsafon/plumbers` → צפון, אינסטלטורים
- `/he/netanya/merkaz/electricians` → מרכז, חשמלאים
- `/ru/netanya/darom/electricians` → Юг, Электрики

**Components**:
- `ResultsHeader` - Back button, title, result count
- `FilterChips` - [פילטרים], [מיון]
- `BusinessCard` - Business listing (name, rating, CTAs)
- `NoResults` - "לא נמצאו תוצאות" + "חיפוש בכל נתניה" button

**Critical Logic - Result Ordering** (see sysAnal.md:87-91):
```typescript
// lib/queries/getSearchResults.ts
export async function getSearchResults({
  categorySlug,
  neighborhoodSlug,
  locale
}: SearchParams) {
  // 1. Fetch all visible businesses
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

  // 3. Separate pinned from regular
  const pinned = withRatings.filter(b => b.is_pinned).sort((a, b) => a.pinned_order - b.pinned_order)
  const regular = withRatings.filter(b => !b.is_pinned)

  // 4. Get top X pinned
  const topPinnedCount = await getAdminSetting('top_pinned_count') // e.g., 4
  const topPinned = pinned.slice(0, topPinnedCount)

  // 5. Random 5 from remaining
  const remaining = [...pinned.slice(topPinnedCount), ...regular]
  const random5 = shuffle(remaining).slice(0, 5)

  // 6. Rest sorted by rating desc, then newest
  const rest = remaining
    .filter(b => !random5.includes(b))
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return [...topPinned, ...random5, ...rest]
}
```

**No Results Flow**:
```typescript
if (results.length === 0) {
  // Show button to search in all neighborhoods
  return <NoResults categorySlug={categorySlug} locale={locale} />
}
```

#### 1.3: Business Detail Page (`app/[locale]/business/[slug]/page.tsx`)

**URL**: `/he/business/yossi-plumber`

**Components**:
- `BusinessHeader` - Name, category, neighborhood, rating
- `CTAGrid` - WhatsApp, Call, Directions, Website (conditional rendering)
- `BusinessInfo` - Description, address, opening hours (conditional)
- `ReviewsList` - Reviews with stars, comments, author, date
- `WriteReviewButton` - Sticky or bottom CTA

**Data Fetching**:
```typescript
const business = await prisma.business.findUnique({
  where: { slug_he: slug }, // or slug_ru depending on locale
  include: {
    category: true,
    neighborhood: true,
    reviews: {
      where: { is_approved: true },
      orderBy: { created_at: 'desc' },
      take: 50,
    },
  },
})

if (!business || !business.is_visible) {
  notFound()
}
```

**Conditional CTAs**:
```typescript
{business.whatsapp_number && (
  <a href={`https://wa.me/${business.whatsapp_number}`}>
    💬 WhatsApp
  </a>
)}
{business.phone && (
  <a href={`tel:${business.phone}`}>
    📞 {t('cta.call')}
  </a>
)}
{business.address_he && (
  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address_he)}`}>
    📍 {t('cta.directions')}
  </a>
)}
{business.website_url && (
  <a href={business.website_url} target="_blank">
    🌐 {t('cta.website')}
  </a>
)}
```

#### 1.4: Write Review Page (`app/[locale]/business/[slug]/review/page.tsx`)

**Form Fields**:
- Star rating (1-5) - required
- Comment - optional textarea
- Name - optional input

**Validation**:
```typescript
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  author_name: z.string().optional(),
})
```

**Submission**:
```typescript
// Server Action
export async function submitReview(businessId: string, data: ReviewInput) {
  await prisma.review.create({
    data: {
      business_id: businessId,
      rating: data.rating,
      comment_he: locale === 'he' ? data.comment : null,
      comment_ru: locale === 'ru' ? data.comment : null,
      language: locale,
      author_name: data.author_name || null,
      author_ip_hash: hashIP(getClientIP()),
    },
  })

  // Track event
  await trackEvent({
    type: 'REVIEW_SUBMITTED',
    properties: { business_id: businessId, rating: data.rating },
  })

  revalidatePath(`/[locale]/business/${slug}`)
  redirect(`/[locale]/business/${slug}`)
}
```

#### 1.5: Add Business Page (`app/[locale]/add-business/page.tsx`)

**Form Fields** (see sysAnal.md:143-161):
- Business name - required
- Service type - required dropdown
- Neighborhood - required dropdown
- Description - optional
- Address - optional
- Phone - optional (international format)
- WhatsApp - optional (international format)
- Website - optional
- Opening hours - optional

**Validation**:
```typescript
const addBusinessSchema = z.object({
  name: z.string().min(2),
  category_id: z.string().cuid(),
  neighborhood_id: z.string().cuid(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().regex(/^\+972\d{9}$/).optional(),
  whatsapp_number: z.string().regex(/^\+972\d{9}$/).optional(),
  website_url: z.string().url().optional(),
  opening_hours: z.string().optional(),
}).refine(
  (data) => data.phone || data.whatsapp_number,
  {
    message: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות",
    path: ["phone"],
  }
)
```

**Submission**:
```typescript
export async function submitBusiness(data: AddBusinessInput) {
  await prisma.pendingBusiness.create({
    data: {
      name: data.name,
      description: data.description,
      language: locale,
      category_id: data.category_id,
      neighborhood_id: data.neighborhood_id,
      phone: data.phone,
      whatsapp_number: data.whatsapp_number,
      website_url: data.website_url,
      opening_hours: data.opening_hours,
      address: data.address,
      status: 'PENDING',
    },
  })

  // Track event
  await trackEvent({
    type: 'BUSINESS_SUBMITTED',
    properties: { category_id: data.category_id, neighborhood_id: data.neighborhood_id },
  })

  // Show success message
  redirect('/[locale]/add-business/success')
}
```

### Deliverables
- ✅ Home page with search
- ✅ Search results with proper ordering (pinned → random 5 → rest)
- ✅ Business detail page with conditional CTAs
- ✅ Review submission
- ✅ Add business form

### Testing
- [ ] Search flow: Home → Select category/neighborhood → See results
- [ ] Business card shows correct CTAs (only if data exists)
- [ ] No results flow works (shows "search all city" button)
- [ ] Review submission works
- [ ] Add business validation (must have phone OR whatsapp)
- [ ] RTL/LTR switching works for both languages

---

## Phase 2: Accessibility & PWA (Week 4)

### Goals
- Implement accessibility panel
- Add PWA support
- Ensure WCAG AA compliance

### Tasks

#### 2.1: Accessibility Panel

**Component**: `AccessibilityPanel.tsx`

**Features** (see sysAnal.md:169-195):
- Font size toggle (Normal / Medium / Large)
- High contrast mode toggle
- Underline links toggle
- Remember preferences in localStorage

**Implementation**:
```typescript
// lib/contexts/AccessibilityContext.tsx
'use client'

export function AccessibilityProvider({ children }) {
  const [fontSize, setFontSize] = useState<'normal' | 'medium' | 'large'>('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [underlineLinks, setUnderlineLinks] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility')
    if (saved) {
      const { fontSize, highContrast, underlineLinks } = JSON.parse(saved)
      setFontSize(fontSize)
      setHighContrast(highContrast)
      setUnderlineLinks(underlineLinks)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('accessibility', JSON.stringify({ fontSize, highContrast, underlineLinks }))

    // Apply CSS classes
    document.documentElement.classList.toggle('font-medium', fontSize === 'medium')
    document.documentElement.classList.toggle('font-large', fontSize === 'large')
    document.documentElement.classList.toggle('high-contrast', highContrast)
    document.documentElement.classList.toggle('underline-links', underlineLinks)
  }, [fontSize, highContrast, underlineLinks])

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast, underlineLinks, setUnderlineLinks }}>
      {children}
    </AccessibilityContext.Provider>
  )
}
```

**Global Styles** (`app/globals.css`):
```css
/* Font sizes */
html.font-medium { font-size: 18px; }
html.font-large { font-size: 20px; }

/* High contrast */
html.high-contrast {
  --text-color: #000;
  --bg-color: #fff;
}
html.high-contrast body {
  color: var(--text-color);
  background: var(--bg-color);
}
html.high-contrast button {
  border: 2px solid #000 !important;
}

/* Underline links */
html.underline-links a {
  text-decoration: underline !important;
}

/* Focus visible */
*:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

**Fixed Button** (bottom-right):
```typescript
// components/AccessibilityButton.tsx
export function AccessibilityButton() {
  const [open, setOpen] = useState(false)
  const { trackEvent } = useAnalytics()

  return (
    <>
      <button
        onClick={() => {
          setOpen(true)
          trackEvent({ type: 'ACCESSIBILITY_OPENED' })
        }}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg"
        aria-label={t('accessibility.open')}
      >
        ♿
      </button>
      <AccessibilityPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

#### 2.2: Semantic HTML Audit
- Replace all `<div>` with semantic tags where appropriate:
  - `<main>` for main content
  - `<nav>` for navigation
  - `<header>` for headers
  - `<footer>` for footer
  - `<button>` instead of clickable divs
  - `<label>` for all form inputs (with `htmlFor`)

#### 2.3: ARIA Labels
```typescript
// Add aria-labels to icon-only buttons
<button aria-label={t('cta.whatsapp')}>💬</button>
<button aria-label={t('cta.call')}>📞</button>
<button aria-label={t('cta.directions')}>📍</button>
```

#### 2.4: Skip Link
```typescript
// app/[locale]/layout.tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  {t('skipToContent')} {/* "דלג לתוכן" */}
</a>
<main id="main-content">
  {children}
</main>
```

#### 2.5: PWA Configuration

**Install next-pwa**:
```bash
pnpm add next-pwa
```

**Configure** (`next.config.js`):
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\/(he|ru)\/netanya\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
      }
    }
  ]
})

module.exports = withPWA({
  // ... other Next.js config
})
```

**Manifest** (`public/manifest.json`):
```json
{
  "name": "Netanya Local – מדריך עסקים בנתניה",
  "short_name": "NetanyaLocal",
  "lang": "he",
  "dir": "rtl",
  "start_url": "/he",
  "display": "standalone",
  "theme_color": "#0066cc",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Offline Fallback** (`app/offline/page.tsx`):
```typescript
export default function OfflinePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1>{t('offline.title')}</h1>
      <p>{t('offline.message')}</p>
      {/* "אין חיבור לאינטרנט. אפשר לראות חלק מהתוכן שנשמר מהביקור האחרון." */}
    </main>
  )
}
```

### Deliverables
- ✅ Accessibility panel with font size, contrast, underline toggles
- ✅ All semantic HTML
- ✅ ARIA labels on icon buttons
- ✅ Skip link at top
- ✅ PWA installable on mobile
- ✅ Offline fallback page

### Testing
- [ ] Accessibility panel persists preferences across page reloads
- [ ] High contrast mode works correctly
- [ ] Can navigate entire site with keyboard only
- [ ] Tab order is logical
- [ ] Run axe DevTools on all pages (0 critical issues)
- [ ] PWA installs on iOS Safari and Android Chrome
- [ ] Offline mode shows fallback page

---

## Phase 3: Admin Panel (Week 5-6)

### Goals
- Build admin authentication
- Create business management dashboard
- Implement approval workflow for pending businesses
- Add category and neighborhood management

### Tasks

#### 3.1: Admin Authentication

**Login Page** (`app/admin/login/page.tsx`):
```typescript
// Simple form with email + password
export default function AdminLogin() {
  return (
    <form action={loginAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

**Auth Config** (`auth.ts`):
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        // For MVP: hardcoded check
        if (credentials.email === '345287@gmail.com' && credentials.password === 'admin1') {
          return { id: '1', email: '345287@gmail.com', role: 'superadmin' }
        }

        // For production: database lookup
        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email }
        })
        if (admin && await bcrypt.compare(credentials.password, admin.password_hash)) {
          return { id: admin.id, email: admin.email, role: admin.role }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        return !!auth
      }
      return true
    },
  },
})
```

#### 3.2: Admin Dashboard Layout (`app/admin/layout.tsx`)

**Sidebar Navigation**:
- Dashboard (stats overview)
- Businesses
- Pending Approvals (with badge count)
- Categories
- Neighborhoods
- Settings
- Logout

#### 3.3: Business Management (`app/admin/businesses/page.tsx`)

**Table Columns** (see sysAnal.md:207-220):
- Name
- Service Type
- Neighborhood
- IsVisible (toggle)
- IsVerified (toggle)
- IsPinned (toggle)
- CreatedAt
- Actions (Edit / Delete)

**Actions**:
```typescript
// Toggle visible
export async function toggleVisible(businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  await prisma.business.update({
    where: { id: businessId },
    data: { is_visible: !business.is_visible },
  })
  revalidatePath('/admin/businesses')
}

// Toggle verified (show "מאומת" badge)
export async function toggleVerified(businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  await prisma.business.update({
    where: { id: businessId },
    data: { is_verified: !business.is_verified },
  })
  revalidatePath('/admin/businesses')
}

// Toggle pinned (for Top X logic)
export async function togglePinned(businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } })

  if (!business.is_pinned) {
    // Pin it: assign next order
    const maxOrder = await prisma.business.findFirst({
      where: { is_pinned: true },
      orderBy: { pinned_order: 'desc' },
      select: { pinned_order: true },
    })
    await prisma.business.update({
      where: { id: businessId },
      data: { is_pinned: true, pinned_order: (maxOrder?.pinned_order || 0) + 1 },
    })
  } else {
    // Unpin it
    await prisma.business.update({
      where: { id: businessId },
      data: { is_pinned: false, pinned_order: null },
    })
  }

  revalidatePath('/admin/businesses')
}

// Soft delete
export async function deleteBusiness(businessId: string) {
  await prisma.business.update({
    where: { id: businessId },
    data: { deleted_at: new Date(), is_visible: false },
  })
  revalidatePath('/admin/businesses')
}
```

#### 3.4: Pending Businesses (`app/admin/pending/page.tsx`)

**Table**:
- Name
- Category
- Neighborhood
- Phone / WhatsApp
- Submitted At
- Actions (Approve / Reject / View)

**Approve Flow**:
```typescript
export async function approveBusiness(pendingId: string) {
  const pending = await prisma.pendingBusiness.findUnique({
    where: { id: pendingId },
    include: { category: true, neighborhood: true },
  })

  // Create approved business
  await prisma.business.create({
    data: {
      name_he: pending.language === 'he' ? pending.name : '',
      name_ru: pending.language === 'ru' ? pending.name : '',
      slug_he: generateSlug(pending.name, 'he'),
      slug_ru: pending.language === 'ru' ? generateSlug(pending.name, 'ru') : null,
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
      is_verified: false, // Admin can verify later
    },
  })

  // Update pending status
  await prisma.pendingBusiness.update({
    where: { id: pendingId },
    data: { status: 'APPROVED', reviewed_at: new Date() },
  })

  revalidatePath('/admin/pending')
}

export async function rejectBusiness(pendingId: string, reason?: string) {
  await prisma.pendingBusiness.update({
    where: { id: pendingId },
    data: {
      status: 'REJECTED',
      admin_notes: reason,
      reviewed_at: new Date(),
    },
  })
  revalidatePath('/admin/pending')
}
```

#### 3.5: Categories Management (`app/admin/categories/page.tsx`)

**CRUD Operations**:
- List all categories (active + inactive)
- Add new category (name HE/RU, slug, icon, display order)
- Edit category
- Toggle active/inactive
- Mark as popular

#### 3.6: Neighborhoods Management (`app/admin/neighborhoods/page.tsx`)

**CRUD Operations**:
- List all neighborhoods
- Add new neighborhood (name HE/RU, slug, description, display order)
- Edit neighborhood
- Toggle active/inactive

#### 3.7: Settings Page (`app/admin/settings/page.tsx`)

**Settings**:
- Top Pinned Count (for Top X logic)
- Future: Email notifications, analytics settings, etc.

```typescript
export async function updateTopPinnedCount(count: number) {
  await prisma.adminSettings.upsert({
    where: { key: 'top_pinned_count' },
    update: { value: count.toString() },
    create: { key: 'top_pinned_count', value: count.toString() },
  })
  revalidatePath('/admin/settings')
}
```

### Deliverables
- ✅ Admin login with NextAuth
- ✅ Business management (edit, toggle flags, delete)
- ✅ Pending business approval workflow
- ✅ Category CRUD
- ✅ Neighborhood CRUD
- ✅ Settings page (top pinned count)

### Testing
- [ ] Can log in with admin credentials
- [ ] Cannot access admin pages without login
- [ ] Toggle visible/verified/pinned works and reflects on client
- [ ] Approve pending business creates new business entry
- [ ] Edit category updates dropdown options on client
- [ ] Top pinned count setting affects search results

---

## Phase 4: Analytics & SEO (Week 7)

### Goals
- Implement event tracking
- Add structured data (LocalBusiness schema)
- Configure sitemap and robots.txt
- Set up hreflang tags

### Tasks

#### 4.1: Analytics Event Tracking

**Client-side Tracking Hook** (`lib/hooks/useAnalytics.ts`):
```typescript
export function useAnalytics() {
  const trackEvent = async (event: { type: EventType; properties?: any }) => {
    await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        type: event.type,
        properties: event.properties,
        session_id: getSessionId(), // From localStorage
        language: document.documentElement.lang,
      }),
    })
  }

  return { trackEvent }
}
```

**API Route** (`app/api/events/route.ts`):
```typescript
export async function POST(req: Request) {
  const { type, properties, session_id, language } = await req.json()
  const userAgent = req.headers.get('user-agent')
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

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

**Track Events**:
- Search performed (on search submission)
- Business viewed (on business detail page mount)
- CTA clicked (on WhatsApp/Call/Directions/Website click)
- Review submitted (on review submission)
- Business submitted (on add business submission)
- PWA installed (on `beforeinstallprompt` event)
- Accessibility opened (on panel open)
- Font/contrast changed (on setting change)

#### 4.2: Structured Data (SEO)

**Business Detail Page Schema**:
```typescript
// app/[locale]/business/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const business = await getBusiness(params.slug)

  // LocalBusiness schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name_he,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address_he,
      "addressLocality": "נתניה",
      "addressCountry": "IL"
    },
    "telephone": business.phone,
    "url": business.website_url,
    "openingHours": parseOpeningHours(business.opening_hours_he),
    "aggregateRating": business.reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": business.reviews.length,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "review": business.reviews.slice(0, 10).map(r => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating
      },
      "author": {
        "@type": "Person",
        "name": r.author_name || "אנונימי"
      },
      "reviewBody": r.comment_he || r.comment_ru
    }))
  }

  return {
    title: `${business.name_he} - ${business.category.name_he} בנתניה`,
    description: business.description_he || `${business.category.name_he} ב${business.neighborhood.name_he}`,
    alternates: {
      canonical: `/he/business/${business.slug_he}`,
      languages: {
        'he': `/he/business/${business.slug_he}`,
        'ru': business.slug_ru ? `/ru/business/${business.slug_ru}` : undefined,
      },
    },
    other: {
      'structured-data': JSON.stringify(schema),
    },
  }
}
```

#### 4.3: Sitemap Generation

**Dynamic Sitemap** (`app/sitemap.ts`):
```typescript
export default async function sitemap() {
  const businesses = await prisma.business.findMany({
    where: { is_visible: true, deleted_at: null },
    select: { slug_he: true, slug_ru: true, updated_at: true },
  })

  const businessUrls = businesses.flatMap(b => [
    {
      url: `https://netanyalocal.com/he/business/${b.slug_he}`,
      lastModified: b.updated_at,
      alternates: {
        languages: {
          he: `https://netanyalocal.com/he/business/${b.slug_he}`,
          ru: b.slug_ru ? `https://netanyalocal.com/ru/business/${b.slug_ru}` : undefined,
        },
      },
    },
  ])

  const staticUrls = [
    { url: 'https://netanyalocal.com/he', lastModified: new Date() },
    { url: 'https://netanyalocal.com/ru', lastModified: new Date() },
    // ... add category/neighborhood pages
  ]

  return [...staticUrls, ...businessUrls]
}
```

#### 4.4: Robots.txt

**Static File** (`app/robots.ts`):
```typescript
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://netanyalocal.com/sitemap.xml',
  }
}
```

#### 4.5: Admin Analytics Dashboard

**Page** (`app/admin/analytics/page.tsx`):

**Widgets**:
- Top searched categories (last 7 days)
- Top searched neighborhoods
- Total searches, business views, reviews
- CTA click distribution (WhatsApp vs Call vs Directions vs Website)
- Accessibility usage stats
- Language distribution (HE vs RU)

**Query Example**:
```typescript
const topCategories = await prisma.event.groupBy({
  by: ['category_id'],
  where: {
    type: 'SEARCH_PERFORMED',
    created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  },
  _count: { category_id: true },
  orderBy: { _count: { category_id: 'desc' } },
  take: 10,
})
```

### Deliverables
- ✅ Event tracking on all key actions
- ✅ LocalBusiness schema on business pages
- ✅ Sitemap with hreflang
- ✅ Robots.txt
- ✅ Admin analytics dashboard

### Testing
- [ ] Events are being saved to database
- [ ] Google Rich Results Test shows valid LocalBusiness schema
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Analytics dashboard shows correct data

---

## Phase 5: Polish & Testing (Week 8)

### Goals
- Cross-browser testing
- Performance optimization
- Security audit
- Final accessibility review

### Tasks

#### 5.1: Performance Optimization
- Run Lighthouse on all pages (target: 90+ performance, 100 accessibility)
- Optimize images (use Next.js `<Image>` component)
- Lazy load below-the-fold components
- Minimize JavaScript bundle size

#### 5.2: Security Checklist
- [ ] Environment variables not exposed to client
- [ ] Admin password hashed (bcrypt)
- [ ] CSRF protection enabled (NextAuth default)
- [ ] Rate limiting on review submission (Redis)
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React escapes by default)
- [ ] HTTPS enforced (Vercel default)

#### 5.3: Cross-Browser Testing
- Chrome (desktop + mobile)
- Safari (desktop + iOS)
- Firefox
- Edge

**Test checklist**:
- RTL/LTR switching
- Accessibility panel
- PWA install
- Form submissions
- Search flow

#### 5.4: Final Accessibility Audit
- Run axe DevTools on all pages
- Manual keyboard navigation test
- Screen reader test (NVDA or VoiceOver)
- Color contrast check (WebAIM Contrast Checker)

#### 5.5: Error Handling
- Add global error boundary
- Add 404 page (not-found.tsx)
- Add 500 page (error.tsx)
- Proper form validation errors

#### 5.6: Loading States
- Add loading.tsx for all dynamic pages
- Skeleton screens for business cards
- Spinner for form submissions

### Deliverables
- ✅ All pages pass Lighthouse (90+ performance, 100 accessibility)
- ✅ Security checklist completed
- ✅ Cross-browser tested
- ✅ Accessibility audit passed
- ✅ Error handling and loading states added

---

## Post-Launch (Week 9+)

### Monitoring
- Set up Sentry for error tracking
- Monitor Vercel Analytics
- Weekly check of admin analytics dashboard

### Iteration
- Gather user feedback
- Fix bugs from Redis bug tracking
- Add new categories/neighborhoods as requested

### Future Features (Phase 6+)
- User accounts (save favorites, claim business)
- Premium listings (featured placement, enhanced profile)
- Full-text search (PostgreSQL FTS or Algolia)
- Map view (integrate PostGIS)
- Business owner dashboard (edit own listing, respond to reviews)
- Email notifications (new review, pending approval)
- Multi-city expansion

---

## Risk Mitigation Timeline

| Risk | Phase | Mitigation |
|------|-------|------------|
| RTL bugs | Phase 1 | Test every component in both directions |
| PWA caching issues | Phase 2 | Use NetworkFirst, test offline early |
| Search ordering logic | Phase 1 | Write unit tests for ordering algorithm |
| Accessibility non-compliance | Phase 2 & 5 | Continuous testing with axe DevTools |
| Admin access security | Phase 3 | Use NextAuth, hash passwords, HTTPS only |
| Performance on mobile | Phase 5 | Lighthouse testing, optimize images |

---

## Success Criteria

### Phase 1 Complete
- [ ] Can search by category + neighborhood
- [ ] See properly ordered results (pinned → random → rest)
- [ ] View business detail with all info
- [ ] Submit review
- [ ] Submit new business

### Phase 2 Complete
- [ ] Accessibility panel works and persists
- [ ] PWA installs on mobile
- [ ] Passes WCAG AA audit

### Phase 3 Complete
- [ ] Admin can log in
- [ ] Admin can approve/reject pending businesses
- [ ] Admin can edit businesses and toggle flags
- [ ] Admin can manage categories/neighborhoods

### Phase 4 Complete
- [ ] All events being tracked
- [ ] Business pages have LocalBusiness schema
- [ ] Sitemap generated

### Phase 5 Complete
- [ ] Lighthouse score 90+ performance, 100 accessibility
- [ ] Works on all major browsers
- [ ] No critical security issues

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Next Review**: After Phase 1 completion
