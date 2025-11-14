# Component Architecture

## Overview

**Framework**: Next.js 14 App Router with React Server Components (RSC)
**Styling**: Tailwind CSS with RTL support
**UI Library**: Headless UI for accessible components
**State Management**: React Context for client-side state (accessibility, language)
**Form Library**: React Hook Form with Zod validation

---

## Folder Structure

```
app/
├── [locale]/                    # Internationalized routes
│   ├── layout.tsx              # Root layout (font, i18n provider, accessibility)
│   ├── page.tsx                # Home page
│   ├── netanya/
│   │   └── [neighborhood]/
│   │       └── [category]/
│   │           └── page.tsx    # Search results
│   ├── business/
│   │   └── [slug]/
│   │       ├── page.tsx        # Business detail
│   │       └── review/
│   │           └── page.tsx    # Write review
│   ├── add-business/
│   │   ├── page.tsx            # Add business form
│   │   └── success/
│   │       └── page.tsx        # Success message
│   └── offline/
│       └── page.tsx            # PWA offline fallback
│
├── admin/
│   ├── layout.tsx              # Admin layout (sidebar, auth check)
│   ├── login/
│   │   └── page.tsx            # Admin login
│   ├── page.tsx                # Dashboard
│   ├── businesses/
│   │   ├── page.tsx            # Business management
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx    # Edit business
│   ├── pending/
│   │   └── page.tsx            # Pending approvals
│   ├── categories/
│   │   └── page.tsx            # Category management
│   ├── neighborhoods/
│   │   └── page.tsx            # Neighborhood management
│   ├── settings/
│   │   └── page.tsx            # Admin settings
│   └── analytics/
│       └── page.tsx            # Analytics dashboard
│
├── api/
│   └── events/
│       └── route.ts            # Event tracking endpoint
│
└── actions/                    # Server actions
    ├── businesses.ts           # Business-related actions
    ├── reviews.ts              # Review actions
    └── admin/
        ├── businesses.ts       # Admin business actions
        ├── categories.ts       # Admin category actions
        └── neighborhoods.ts    # Admin neighborhood actions

components/
├── client/                     # Client Components (interactive)
│   ├── AccessibilityButton.tsx
│   ├── AccessibilityPanel.tsx
│   ├── LanguageSwitcher.tsx
│   ├── SearchForm.tsx
│   ├── FilterSheet.tsx
│   ├── ReviewForm.tsx
│   ├── AddBusinessForm.tsx
│   └── admin/
│       ├── BusinessTable.tsx
│       ├── PendingTable.tsx
│       └── AnalyticsCharts.tsx
│
├── server/                     # Server Components (static)
│   ├── HeroSection.tsx
│   ├── PopularCategories.tsx
│   ├── NeighborhoodGrid.tsx
│   ├── BusinessCard.tsx
│   ├── BusinessDetail.tsx
│   ├── ReviewsList.tsx
│   └── NoResults.tsx
│
└── shared/                     # Shared components (can be server or client)
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Badge.tsx
    ├── Rating.tsx
    └── Loading.tsx

lib/
├── prisma.ts                   # Prisma client singleton
├── redis.ts                    # Redis client
├── queries/                    # Database queries
│   ├── businesses.ts
│   ├── categories.ts
│   ├── neighborhoods.ts
│   └── analytics.ts
├── utils/
│   ├── security.ts             # IP hashing, validation
│   ├── slugify.ts              # Slug generation
│   └── formatting.ts           # Date, number formatting
├── contexts/                   # React contexts
│   ├── AccessibilityContext.tsx
│   └── AnalyticsContext.tsx
└── validations/                # Zod schemas
    ├── review.ts
    ├── business.ts
    └── admin.ts

messages/
├── he.json                     # Hebrew translations
└── ru.json                     # Russian translations
```

---

## Component Breakdown

### Public Client Components

#### 1. AccessibilityButton + Panel

**File**: `components/client/AccessibilityButton.tsx`

**Purpose**: Fixed button that opens accessibility panel

**Props**: None (uses context)

**State**:
- `open` - Panel visibility
- Uses `AccessibilityContext` for settings

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { useAccessibility } from '@/lib/contexts/AccessibilityContext'
import { useAnalytics } from '@/lib/contexts/AnalyticsContext'

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
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open accessibility options"
      >
        <span className="text-2xl" aria-hidden="true">♿</span>
      </button>

      <AccessibilityPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function AccessibilityPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    underlineLinks,
    setUnderlineLinks,
  } = useAccessibility()
  const { trackEvent } = useAnalytics()

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            Accessibility Options
          </Dialog.Title>

          {/* Font Size */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <div className="flex gap-2">
              {['normal', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setFontSize(size as any)
                    trackEvent({ type: 'ACCESSIBILITY_FONT_CHANGED', properties: { size } })
                  }}
                  className={`px-4 py-2 rounded ${
                    fontSize === size ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {size === 'normal' ? 'A' : size === 'medium' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="mb-6">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">High Contrast</span>
              <button
                onClick={() => {
                  setHighContrast(!highContrast)
                  trackEvent({
                    type: 'ACCESSIBILITY_CONTRAST_TOGGLED',
                    properties: { enabled: !highContrast },
                  })
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  highContrast ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Underline Links */}
          <div className="mb-6">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Underline Links</span>
              <button
                onClick={() => setUnderlineLinks(!underlineLinks)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  underlineLinks ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    underlineLinks ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-900 py-2 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
```

---

#### 2. SearchForm

**File**: `components/client/SearchForm.tsx`

**Purpose**: Home page search card with category & neighborhood dropdowns

**Props**:
```typescript
{
  categories: { id: string; name: string; slug: string }[]
  neighborhoods: { id: string; name: string; slug: string }[]
  locale: 'he' | 'ru'
}
```

**State**:
- `selectedCategory` - Selected category ID
- `selectedNeighborhood` - Selected neighborhood ID

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Listbox } from '@headlessui/react'
import { useTranslations } from 'next-intl'

export function SearchForm({ categories, neighborhoods, locale }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null)
  const router = useRouter()
  const t = useTranslations('home.search')

  const handleSearch = () => {
    if (!selectedCategory || !selectedNeighborhood) return

    const categorySlug = categories.find(c => c.id === selectedCategory)?.slug
    const neighborhoodSlug = neighborhoods.find(n => n.id === selectedNeighborhood)?.slug

    router.push(`/${locale}/netanya/${neighborhoodSlug}/${categorySlug}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('serviceLabel')}
        </label>
        <Listbox value={selectedCategory} onChange={setSelectedCategory}>
          {/* Headless UI Listbox implementation */}
        </Listbox>
      </div>

      {/* Neighborhood Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('neighborhoodLabel')}
        </label>
        <Listbox value={selectedNeighborhood} onChange={setSelectedNeighborhood}>
          {/* Headless UI Listbox implementation */}
        </Listbox>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={!selectedCategory || !selectedNeighborhood}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
      >
        {t('searchButton')}
      </button>
    </div>
  )
}
```

---

#### 3. FilterSheet

**File**: `components/client/FilterSheet.tsx`

**Purpose**: Bottom sheet for filtering/sorting search results

**Props**:
```typescript
{
  open: boolean
  onClose: () => void
  categories: Category[]
  neighborhoods: Neighborhood[]
  currentCategory: string
  currentNeighborhood: string
  onApply: (filters: { category: string; neighborhood: string; sort: string }) => void
}
```

**State**:
- `tempCategory`, `tempNeighborhood`, `tempSort` - Temporary selections before apply

---

#### 4. ReviewForm

**File**: `components/client/ReviewForm.tsx`

**Purpose**: Form for submitting reviews

**Props**:
```typescript
{
  businessId: string
  businessName: string
}
```

**State**:
- Form state managed by React Hook Form
- Loading state during submission

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema } from '@/lib/validations/review'
import { submitReview } from '@/app/actions/reviews'
import { useTranslations } from 'next-intl'

export function ReviewForm({ businessId, businessName }) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('review')
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(reviewSchema),
  })

  const rating = watch('rating')

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await submitReview(businessId, data)

    if (result.error) {
      alert(result.error)
    } else {
      // Success - redirect handled by server action
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('ratingLabel')} *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setValue('rating', star)}
              className="text-3xl"
            >
              {star <= rating ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('commentLabel')}
        </label>
        <textarea
          {...register('comment')}
          rows={4}
          className="w-full border rounded-lg p-3"
          placeholder={t('commentPlaceholder')}
        />
        {errors.comment && (
          <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
        )}
      </div>

      {/* Author Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('nameLabel')}
        </label>
        <input
          {...register('author_name')}
          type="text"
          className="w-full border rounded-lg p-3"
          placeholder={t('namePlaceholder')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
      >
        {loading ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
```

---

#### 5. AddBusinessForm

**File**: `components/client/AddBusinessForm.tsx`

**Purpose**: Form for submitting new businesses

**Props**:
```typescript
{
  categories: Category[]
  neighborhoods: Neighborhood[]
}
```

**Validation**: Must have phone OR whatsapp_number

**Implementation**: Similar to ReviewForm, uses React Hook Form + Zod

---

### Public Server Components

#### 6. HeroSection

**File**: `components/server/HeroSection.tsx`

**Purpose**: Landing page hero with title, subtitle, CTA

**Props**: None (uses translations)

**Implementation**:
```typescript
import { useTranslations } from 'next-intl'

export function HeroSection() {
  const t = useTranslations('home.hero')

  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        {t('title')}
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        {t('subtitle')}
      </p>
    </div>
  )
}
```

---

#### 7. PopularCategories

**File**: `components/server/PopularCategories.tsx`

**Purpose**: Horizontal chips of popular categories

**Props**:
```typescript
{
  categories: Category[]
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
import Link from 'next/link'

export function PopularCategories({ categories, locale }) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Popular Categories</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/${locale}/netanya/all/${category.slug}`}
            className="px-6 py-3 bg-blue-100 text-blue-900 rounded-full whitespace-nowrap hover:bg-blue-200"
          >
            {category.icon && <span className="mr-2">{category.icon}</span>}
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

#### 8. NeighborhoodGrid

**File**: `components/server/NeighborhoodGrid.tsx`

**Purpose**: 3-button grid for neighborhoods

**Props**:
```typescript
{
  neighborhoods: Neighborhood[]
  locale: 'he' | 'ru'
}
```

---

#### 9. BusinessCard

**File**: `components/server/BusinessCard.tsx`

**Purpose**: Single business listing in search results

**Props**:
```typescript
{
  business: {
    id: string
    name: string
    slug: string
    category: string
    neighborhood: string
    phone?: string
    whatsapp_number?: string
    avgRating: number
    reviewCount: number
    is_verified: boolean
  }
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
import Link from 'next/link'
import { Rating } from '@/components/shared/Rating'
import { Badge } from '@/components/shared/Badge'

export function BusinessCard({ business, locale }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold">{business.name}</h3>
        {business.is_verified && (
          <Badge variant="verified">מאומת</Badge>
        )}
      </div>

      {/* Meta */}
      <p className="text-sm text-gray-600 mb-2">
        {business.category} • {business.neighborhood}
      </p>

      {/* Rating */}
      {business.reviewCount > 0 ? (
        <div className="flex items-center gap-2 mb-3">
          <Rating value={business.avgRating} />
          <span className="text-sm text-gray-600">
            {business.avgRating.toFixed(1)} ({business.reviewCount})
          </span>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-3">היו הראשונים לדרג</p>
      )}

      {/* CTAs */}
      <div className="flex gap-2">
        {business.whatsapp_number && (
          <a
            href={`https://wa.me/${business.whatsapp_number}`}
            className="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700"
            onClick={() => trackCTA('whatsapp', business.id)}
          >
            💬 WhatsApp
          </a>
        )}
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
            onClick={() => trackCTA('call', business.id)}
          >
            📞 Call
          </a>
        )}
        <Link
          href={`/${locale}/business/${business.slug}`}
          className="flex-1 bg-gray-200 text-gray-900 text-center py-2 rounded hover:bg-gray-300"
        >
          Details
        </Link>
      </div>
    </div>
  )
}
```

---

#### 10. BusinessDetail

**File**: `components/server/BusinessDetail.tsx`

**Purpose**: Full business details page content

**Props**:
```typescript
{
  business: BusinessWithReviews
  locale: 'he' | 'ru'
}
```

**Sections**:
- Header (name, category, neighborhood, rating)
- CTA Grid (WhatsApp, Call, Directions, Website) - **conditional rendering**
- Info section (description, address, opening hours) - **conditional rendering**
- Reviews list

---

#### 11. ReviewsList

**File**: `components/server/ReviewsList.tsx`

**Purpose**: Display list of reviews

**Props**:
```typescript
{
  reviews: Review[]
  businessId: string
}
```

---

#### 12. NoResults

**File**: `components/server/NoResults.tsx`

**Purpose**: No results message with "search all city" button

**Props**:
```typescript
{
  categorySlug: string
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
import Link from 'next/link'

export function NoResults({ categorySlug, locale }) {
  return (
    <div className="text-center py-16">
      <p className="text-xl text-gray-600 mb-4">
        לא נמצאו תוצאות בשכונה שנבחרה
      </p>
      <Link
        href={`/${locale}/netanya/all/${categorySlug}`}
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        חיפוש בכל נתניה
      </Link>
    </div>
  )
}
```

---

### Admin Components

#### 13. BusinessTable

**File**: `components/client/admin/BusinessTable.tsx`

**Purpose**: Admin business management table with actions

**Props**:
```typescript
{
  businesses: Business[]
}
```

**Features**:
- Sortable columns
- Toggle visibility, verified, pinned
- Edit, delete actions
- Pagination

---

#### 14. PendingTable

**File**: `components/client/admin/PendingTable.tsx`

**Purpose**: Pending business approvals table

**Props**:
```typescript
{
  pending: PendingBusiness[]
}
```

**Actions**:
- Approve (creates new business)
- Reject (with optional reason)
- View details

---

#### 15. AnalyticsCharts

**File**: `components/client/admin/AnalyticsCharts.tsx`

**Purpose**: Dashboard charts for analytics

**Props**:
```typescript
{
  data: AnalyticsData
}
```

**Charts**:
- Top categories (bar chart)
- Top neighborhoods (bar chart)
- CTA distribution (pie chart)
- Language distribution (pie chart)
- Accessibility usage (stats cards)

---

### Shared Components

#### 16. Button

**File**: `components/shared/Button.tsx`

**Props**:
```typescript
{
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

---

#### 17. Rating

**File**: `components/shared/Rating.tsx`

**Props**:
```typescript
{
  value: number // 0-5
  size?: 'sm' | 'md' | 'lg'
}
```

**Implementation**:
```typescript
export function Rating({ value, size = 'md' }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  return (
    <div className={`flex ${sizeClasses[size]}`}>
      {stars.map(star => (
        <span key={star}>
          {star <= Math.round(value) ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}
```

---

#### 18. Badge

**File**: `components/shared/Badge.tsx`

**Props**:
```typescript
{
  variant: 'verified' | 'pinned' | 'new' | 'popular'
  children: React.ReactNode
}
```

---

## Context Providers

### 1. AccessibilityContext

**File**: `lib/contexts/AccessibilityContext.tsx`

**State**:
- `fontSize: 'normal' | 'medium' | 'large'`
- `highContrast: boolean`
- `underlineLinks: boolean`

**Methods**:
- `setFontSize(size)`
- `setHighContrast(enabled)`
- `setUnderlineLinks(enabled)`

**Persistence**: localStorage

---

### 2. AnalyticsContext

**File**: `lib/contexts/AnalyticsContext.tsx`

**Methods**:
- `trackEvent({ type, properties })`

**Implementation**:
```typescript
'use client'

import { createContext, useContext } from 'react'

const AnalyticsContext = createContext(null)

export function AnalyticsProvider({ children }) {
  const trackEvent = async ({ type, properties = {} }) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        properties,
        session_id: getSessionId(),
        language: document.documentElement.lang,
      }),
    })
  }

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  return useContext(AnalyticsContext)
}

function getSessionId() {
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}
```

---

## Layout Hierarchy

### Root Layout (`app/[locale]/layout.tsx`)

```typescript
import { Heebo } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { AccessibilityProvider } from '@/lib/contexts/AccessibilityContext'
import { AnalyticsProvider } from '@/lib/contexts/AnalyticsContext'
import { AccessibilityButton } from '@/components/client/AccessibilityButton'

const heebo = Heebo({ subsets: ['hebrew', 'latin', 'cyrillic'] })

export default async function RootLayout({ children, params: { locale } }) {
  const messages = await import(`@/messages/${locale}.json`)
  const direction = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={direction} className={heebo.className}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AccessibilityProvider>
            <AnalyticsProvider>
              <SkipLink />
              <Header />
              <main id="main-content">
                {children}
              </main>
              <Footer />
              <AccessibilityButton />
            </AnalyticsProvider>
          </AccessibilityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Admin Layout (`app/admin/layout.tsx`)

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }) {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
```

---

## Component Communication Patterns

### 1. Server → Client Props

**Pattern**: Pass serializable data from Server Component to Client Component

```typescript
// app/[locale]/page.tsx (Server Component)
export default async function HomePage() {
  const categories = await getActiveCategories(locale)

  return <SearchForm categories={categories} />
}

// components/client/SearchForm.tsx (Client Component)
'use client'
export function SearchForm({ categories }) {
  // Use categories in client-side logic
}
```

---

### 2. Client → Server Actions

**Pattern**: Call server actions from client components

```typescript
// components/client/ReviewForm.tsx
'use client'
import { submitReview } from '@/app/actions/reviews'

export function ReviewForm({ businessId }) {
  const onSubmit = async (data) => {
    const result = await submitReview(businessId, data)
    // Handle result
  }
}
```

---

### 3. Context for Global State

**Pattern**: Use React Context for client-side global state (accessibility, analytics)

```typescript
// lib/contexts/AccessibilityContext.tsx
export function AccessibilityProvider({ children }) {
  const [fontSize, setFontSize] = useState('normal')
  // ...
}

// components/client/AccessibilityPanel.tsx
export function AccessibilityPanel() {
  const { fontSize, setFontSize } = useAccessibility()
  // ...
}
```

---

## Performance Optimizations

### 1. Server Components by Default

**All components are Server Components unless**:
- They use hooks (useState, useEffect, etc.)
- They use browser APIs
- They use event handlers

### 2. Dynamic Imports for Heavy Components

```typescript
import dynamic from 'next/dynamic'

const AnalyticsCharts = dynamic(
  () => import('@/components/admin/AnalyticsCharts'),
  { ssr: false, loading: () => <Loading /> }
)
```

### 3. Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/business-logo.jpg"
  alt="Business name"
  width={200}
  height={200}
  loading="lazy"
/>
```

### 4. Lazy Loading Below-Fold Content

```typescript
import { Suspense } from 'react'

<Suspense fallback={<ReviewsSkeleton />}>
  <ReviewsList reviews={reviews} />
</Suspense>
```

---

## Accessibility Guidelines

### 1. Semantic HTML

```typescript
// ✅ Good
<main>
  <header>
    <nav>
      <button onClick={...}>Click me</button>
    </nav>
  </header>
</main>

// ❌ Bad
<div>
  <div>
    <div>
      <div onClick={...}>Click me</div>
    </div>
  </div>
</div>
```

### 2. ARIA Labels

```typescript
// Icon-only buttons must have aria-label
<button aria-label="Open WhatsApp">
  💬
</button>

// Images must have alt text
<img src="..." alt="Description" />
```

### 3. Form Labels

```typescript
// Every input must have a label
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

### 4. Focus Styles

```typescript
// Never remove focus outlines
// ❌ Bad
button:focus { outline: none; }

// ✅ Good
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// components/shared/Rating.test.tsx
import { render } from '@testing-library/react'
import { Rating } from './Rating'

test('renders correct number of filled stars', () => {
  const { container } = render(<Rating value={3.5} />)
  const filledStars = container.querySelectorAll('span:contains("⭐")')
  expect(filledStars).toHaveLength(4) // Rounds to 4
})
```

### Integration Tests (React Testing Library)

```typescript
// components/client/SearchForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchForm } from './SearchForm'

test('search button is disabled without selections', () => {
  render(<SearchForm categories={[...]} neighborhoods={[...]} />)
  const button = screen.getByRole('button', { name: /search/i })
  expect(button).toBeDisabled()
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/search-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete search flow', async ({ page }) => {
  await page.goto('/he')
  await page.selectOption('[name="category"]', 'electricians')
  await page.selectOption('[name="neighborhood"]', 'tsafon')
  await page.click('button:has-text("חיפוש")')
  await expect(page).toHaveURL(/\/he\/netanya\/tsafon\/electricians/)
  await expect(page.locator('.business-card')).toHaveCount.greaterThan(0)
})
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Related Docs**: `03-development-phases.md`, `04-api-endpoints.md`
