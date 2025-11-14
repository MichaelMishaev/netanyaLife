# Component Architecture (UPDATED)

## Overview

**Framework**: Next.js 14 App Router with React Server Components (RSC)
**Styling**: Tailwind CSS with RTL support
**UI Library**: Headless UI for accessible components
**State Management**: React Context for client-side state (accessibility, language)
**Form Library**: React Hook Form with Zod validation

---

## Key Updates from v1.0

✅ Added "כל נתניה" option to SearchForm
✅ Complete FilterSheet specification with sort/filter options
✅ Business card description preview
✅ Share functionality (WhatsApp + Copy with attribution)
✅ Back button with navigation history
✅ Result count display
✅ Social media meta tags (Open Graph, Twitter Cards)
✅ Breadcrumb navigation component
✅ Recently Viewed tracking (localStorage)
✅ Print stylesheet for business details

---

## Updated Component Breakdown

### Public Client Components

#### 1. SearchForm (UPDATED)

**File**: `components/client/SearchForm.tsx`

**Purpose**: Home page search card with category & neighborhood dropdowns + "כל נתניה" option

**Props**:
```typescript
{
  categories: { id: string; name: string; slug: string }[]
  neighborhoods: { id: string; name: string; slug: string }[]
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Listbox } from '@headlessui/react'
import { useTranslations } from 'next-intl'

const ALL_NEIGHBORHOODS_ID = 'all-netanya'

export function SearchForm({ categories, neighborhoods, locale }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null)
  const router = useRouter()
  const t = useTranslations('home.search')

  // Add "כל נתניה" option to neighborhoods
  const neighborhoodsWithAll = [
    { id: ALL_NEIGHBORHOODS_ID, name: t('allNetanya'), slug: 'all' },
    ...neighborhoods,
  ]

  const handleSearch = () => {
    if (!selectedCategory || !selectedNeighborhood) return

    const categorySlug = categories.find(c => c.id === selectedCategory)?.slug
    const neighborhoodSlug = neighborhoodsWithAll.find(n => n.id === selectedNeighborhood)?.slug

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
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 px-4 text-right shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="block truncate">
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name
                  : t('servicePlaceholder')
                }
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg">
              {categories.map((category) => (
                <Listbox.Option
                  key={category.id}
                  value={category.id}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-4 ${
                      active ? 'bg-blue-100' : ''
                    }`
                  }
                >
                  {category.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Neighborhood Dropdown with "כל נתניה" */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('neighborhoodLabel')}
        </label>
        <Listbox value={selectedNeighborhood} onChange={setSelectedNeighborhood}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 px-4 text-right shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="block truncate">
                {selectedNeighborhood
                  ? neighborhoodsWithAll.find(n => n.id === selectedNeighborhood)?.name
                  : t('neighborhoodPlaceholder')
                }
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg">
              {neighborhoodsWithAll.map((neighborhood) => (
                <Listbox.Option
                  key={neighborhood.id}
                  value={neighborhood.id}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-4 ${
                      active ? 'bg-blue-100' : ''
                    } ${
                      neighborhood.id === ALL_NEIGHBORHOODS_ID ? 'font-bold border-b border-gray-200' : ''
                    }`
                  }
                >
                  {neighborhood.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={!selectedCategory || !selectedNeighborhood}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {t('searchButton')}
      </button>
    </div>
  )
}
```

**Translations** (`messages/he.json`):
```json
{
  "home": {
    "search": {
      "allNetanya": "כל נתניה",
      "serviceLabel": "סוג שירות",
      "servicePlaceholder": "בחרו סוג שירות",
      "neighborhoodLabel": "שכונה",
      "neighborhoodPlaceholder": "בחרו שכונה",
      "searchButton": "חיפוש"
    }
  }
}
```

---

#### 2. FilterSheet (COMPLETE SPECIFICATION)

**File**: `components/client/FilterSheet.tsx`

**Purpose**: Bottom sheet for filtering and sorting search results

**Props**:
```typescript
{
  open: boolean
  onClose: () => void
  categories: Category[]
  neighborhoods: Neighborhood[]
  currentCategory: string
  currentNeighborhood: string
  currentSort: 'recommended' | 'rating' | 'newest'
  onApply: (filters: FilterState) => void
}

interface FilterState {
  categorySlug: string
  neighborhoodSlug: string
  sort: 'recommended' | 'rating' | 'newest'
}
```

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { useTranslations } from 'next-intl'

export function FilterSheet({
  open,
  onClose,
  categories,
  neighborhoods,
  currentCategory,
  currentNeighborhood,
  currentSort,
  onApply,
}) {
  const t = useTranslations('filters')
  const [tempCategory, setTempCategory] = useState(currentCategory)
  const [tempNeighborhood, setTempNeighborhood] = useState(currentNeighborhood)
  const [tempSort, setTempSort] = useState(currentSort)

  const handleApply = () => {
    onApply({
      categorySlug: tempCategory,
      neighborhoodSlug: tempNeighborhood,
      sort: tempSort,
    })
    onClose()
  }

  const handleReset = () => {
    setTempCategory(currentCategory)
    setTempNeighborhood(currentNeighborhood)
    setTempSort('recommended')
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 flex items-end justify-center">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-t-2xl p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4 flex items-center justify-between">
            <span>{t('title')}</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label={t('close')}
            >
              ✕
            </button>
          </Dialog.Title>

          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">{t('sortBy')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'recommended', label: t('sort.recommended'), icon: '⭐' },
                { value: 'rating', label: t('sort.rating'), icon: '📊' },
                { value: 'newest', label: t('sort.newest'), icon: '🆕' },
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setTempSort(value as any)}
                  className={`py-3 px-4 rounded-lg border-2 transition ${
                    tempSort === value
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
            {/* Sort descriptions */}
            <div className="mt-2 text-xs text-gray-600">
              {tempSort === 'recommended' && t('sort.recommendedDesc')}
              {tempSort === 'rating' && t('sort.ratingDesc')}
              {tempSort === 'newest' && t('sort.newestDesc')}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">{t('category')}</h3>
            <select
              value={tempCategory}
              onChange={(e) => setTempCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">{t('neighborhood')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTempNeighborhood('all')}
                className={`py-2 px-4 rounded-lg border-2 transition ${
                  tempNeighborhood === 'all'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t('allNetanya')}
              </button>
              {neighborhoods.map((neighborhood) => (
                <button
                  key={neighborhood.slug}
                  onClick={() => setTempNeighborhood(neighborhood.slug)}
                  className={`py-2 px-4 rounded-lg border-2 transition ${
                    tempNeighborhood === neighborhood.slug
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {neighborhood.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition"
            >
              {t('reset')}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {t('apply')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
```

**Translations** (`messages/he.json`):
```json
{
  "filters": {
    "title": "פילטרים ומיון",
    "close": "סגור",
    "sortBy": "מיון לפי",
    "sort": {
      "recommended": "מומלץ",
      "rating": "דירוג",
      "newest": "חדשים",
      "recommendedDesc": "עסקים מומלצים ראשונים, אחר כך אקראי",
      "ratingDesc": "מהדירוג הגבוה לנמוך",
      "newestDesc": "העסקים החדשים ביותר ראשונים"
    },
    "category": "סוג שירות",
    "neighborhood": "שכונה",
    "allNetanya": "כל נתניה",
    "reset": "איפוס",
    "apply": "החל"
  }
}
```

---

#### 3. BusinessCard (UPDATED with Description)

**File**: `components/server/BusinessCard.tsx`

**Props**:
```typescript
{
  business: {
    id: string
    name: string
    slug: string
    description?: string // ADDED
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
  // Truncate description to 100 characters
  const truncatedDesc = business.description
    ? business.description.length > 100
      ? business.description.substring(0, 100) + '...'
      : business.description
    : null

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold flex-1">{business.name}</h3>
        {business.is_verified && (
          <Badge variant="verified">מאומת ✓</Badge>
        )}
      </div>

      {/* Meta */}
      <p className="text-sm text-gray-600 mb-2">
        {business.category} • {business.neighborhood}
      </p>

      {/* Description Preview (NEW) */}
      {truncatedDesc && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-1">
          {truncatedDesc}
        </p>
      )}

      {/* Rating */}
      {business.reviewCount > 0 ? (
        <div className="flex items-center gap-2 mb-3">
          <Rating value={business.avgRating} size="sm" />
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
            className="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 text-sm font-medium"
            onClick={() => trackCTA('whatsapp', business.id)}
            aria-label="פתח WhatsApp"
          >
            💬 WhatsApp
          </a>
        )}
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm font-medium"
            onClick={() => trackCTA('call', business.id)}
            aria-label="התקשר"
          >
            📞 התקשר
          </a>
        )}
        <Link
          href={`/${locale}/business/${business.slug}`}
          className="flex-1 bg-gray-200 text-gray-900 text-center py-2 rounded hover:bg-gray-300 text-sm font-medium"
        >
          פרטים →
        </Link>
      </div>
    </div>
  )
}
```

---

#### 4. ResultsHeader (NEW with Back Button + Count)

**File**: `components/client/ResultsHeader.tsx`

**Purpose**: Results page header with back navigation, title, count, and filter button

**Props**:
```typescript
{
  categoryName: string
  neighborhoodName: string
  resultsCount: number
  onFilterClick: () => void
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function ResultsHeader({
  categoryName,
  neighborhoodName,
  resultsCount,
  onFilterClick,
  locale,
}) {
  const router = useRouter()
  const t = useTranslations('results')

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3">
      {/* Back button + Title + Count */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label={t('back')}
        >
          {locale === 'he' ? '→' : '←'}
        </button>
        <h1 className="text-xl font-bold flex-1">
          {categoryName} ב{neighborhoodName}
          <span className="text-gray-600 font-normal text-base mr-2">
            ({resultsCount} {t('results')})
          </span>
        </h1>
      </div>

      {/* Filter/Sort Chips */}
      <div className="flex gap-2">
        <button
          onClick={onFilterClick}
          className="px-4 py-2 rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition text-sm font-medium"
        >
          🔽 {t('filtersAndSort')}
        </button>
      </div>
    </div>
  )
}
```

**Translations** (`messages/he.json`):
```json
{
  "results": {
    "back": "חזור",
    "results": "תוצאות",
    "filtersAndSort": "פילטרים ומיון"
  }
}
```

---

#### 5. ShareButton (NEW)

**File**: `components/client/ShareButton.tsx`

**Purpose**: Share business via WhatsApp or copy link with attribution

**Props**:
```typescript
{
  business: {
    name: string
    category: string
    neighborhood: string
  }
  url: string // Full business URL
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog } from '@headlessui/react'

export function ShareButton({ business, url, locale }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const t = useTranslations('share')

  // Generate share text with attribution
  const shareText = locale === 'he'
    ? `🏙️ ${business.name}\n${business.category} • ${business.neighborhood}\n\n✨ נמצא ב-Netanya Local - מדריך העסקים של נתניה\n${url}`
    : `🏙️ ${business.name}\n${business.category} • ${business.neighborhood}\n\n✨ Found on Netanya Local - Netanya's Business Directory\n${url}`

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
    setOpen(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Try Web Share API first (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: shareText,
          url: url,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    } else {
      setOpen(true) // Fallback to custom dialog
    }
  }

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition flex items-center gap-2"
        aria-label={t('shareButton')}
      >
        <span className="text-xl">🔗</span>
        <span className="font-medium">{t('shareButton')}</span>
      </button>

      {/* Custom Share Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-lg p-6 shadow-xl">
            <Dialog.Title className="text-xl font-bold mb-4">
              {t('title')}
            </Dialog.Title>

            <div className="space-y-3">
              {/* WhatsApp Share */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <span className="text-xl">💬</span>
                <span className="font-medium">{t('shareWhatsApp')}</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition flex items-center justify-center gap-2"
              >
                <span className="text-xl">{copied ? '✓' : '📋'}</span>
                <span className="font-medium">
                  {copied ? t('copied') : t('copyLink')}
                </span>
              </button>
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
              {shareText}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
```

**Translations** (`messages/he.json`):
```json
{
  "share": {
    "shareButton": "שיתוף",
    "title": "שיתוף העסק",
    "shareWhatsApp": "שיתוף ב-WhatsApp",
    "copyLink": "העתק קישור",
    "copied": "הועתק!"
  }
}
```

---

#### 6. Breadcrumbs (NEW)

**File**: `components/server/Breadcrumbs.tsx`

**Purpose**: Navigation breadcrumb trail

**Props**:
```typescript
{
  items: Array<{
    label: string
    href?: string
  }>
  locale: 'he' | 'ru'
}
```

**Implementation**:
```typescript
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function Breadcrumbs({ items, locale }) {
  const t = useTranslations('breadcrumbs')

  return (
    <nav aria-label={t('ariaLabel')} className="py-3 px-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-gray-400">
                {locale === 'he' ? '←' : '→'}
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**Usage Example**:
```typescript
// On business detail page
<Breadcrumbs
  items={[
    { label: 'בית', href: '/he' },
    { label: 'חשמלאים', href: '/he/netanya/tsafon/electricians' },
    { label: business.name },
  ]}
  locale="he"
/>
```

---

#### 7. RecentlyViewedProvider (NEW)

**File**: `lib/contexts/RecentlyViewedContext.tsx`

**Purpose**: Track and display recently viewed businesses

**Implementation**:
```typescript
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface Business {
  id: string
  name: string
  slug: string
  category: string
  neighborhood: string
  avgRating: number
  viewedAt: number
}

interface RecentlyViewedContextType {
  recentlyViewed: Business[]
  addBusiness: (business: Omit<Business, 'viewedAt'>) => void
  clearHistory: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>(null)

const MAX_RECENT = 10
const STORAGE_KEY = 'recently_viewed_businesses'

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Business[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentlyViewed(parsed)
      } catch (err) {
        console.error('Failed to parse recently viewed:', err)
      }
    }
  }, [])

  const addBusiness = (business: Omit<Business, 'viewedAt'>) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((b) => b.id !== business.id)

      // Add to front with timestamp
      const updated = [
        { ...business, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT)

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      return updated
    })
  }

  const clearHistory = () => {
    setRecentlyViewed([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addBusiness, clearHistory }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
  }
  return context
}
```

**RecentlyViewed Component**:
```typescript
// components/client/RecentlyViewed.tsx
'use client'

import { useRecentlyViewed } from '@/lib/contexts/RecentlyViewedContext'
import Link from 'next/link'
import { Rating } from '@/components/shared/Rating'

export function RecentlyViewed({ locale }) {
  const { recentlyViewed, clearHistory } = useRecentlyViewed()

  if (recentlyViewed.length === 0) return null

  return (
    <div className="py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">נצפו לאחרונה</h2>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          נקה היסטוריה
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentlyViewed.map((business) => (
          <Link
            key={business.id}
            href={`/${locale}/business/${business.slug}`}
            className="flex-shrink-0 w-48 p-3 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="font-bold text-sm mb-1 truncate">{business.name}</h3>
            <p className="text-xs text-gray-600 mb-2">
              {business.category} • {business.neighborhood}
            </p>
            <div className="flex items-center gap-1">
              <Rating value={business.avgRating} size="sm" />
              <span className="text-xs text-gray-600">{business.avgRating.toFixed(1)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**Usage** (in business detail page):
```typescript
// app/[locale]/business/[slug]/page.tsx
'use client'

import { useRecentlyViewed } from '@/lib/contexts/RecentlyViewedContext'
import { useEffect } from 'react'

export default function BusinessDetailPage({ business }) {
  const { addBusiness } = useRecentlyViewed()

  useEffect(() => {
    addBusiness({
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category.name,
      neighborhood: business.neighborhood.name,
      avgRating: business.avgRating,
    })
  }, [business.id])

  return (
    // ... business detail content
  )
}
```

---

## Print Stylesheet (NEW)

**File**: `app/globals.css`

**Purpose**: Optimized print styles for business details

```css
/* Print Stylesheet for Business Details */
@media print {
  /* Hide non-essential elements */
  header,
  footer,
  nav,
  .accessibility-button,
  .share-button,
  .cta-buttons,
  .filter-sheet,
  .recently-viewed {
    display: none !important;
  }

  /* Business detail optimizations */
  .business-detail {
    page-break-inside: avoid;
  }

  .business-header {
    border-bottom: 2px solid #000;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  /* Show full URLs for links */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  /* WhatsApp/Phone as text */
  .cta-link:after {
    content: " - " attr(href);
  }

  /* Reviews print formatting */
  .review {
    page-break-inside: avoid;
    border-bottom: 1px solid #ddd;
    padding: 0.5rem 0;
  }

  /* Color to grayscale */
  * {
    color: #000 !important;
    background: #fff !important;
  }

  /* Preserve ratings */
  .rating-star {
    color: #000 !important;
  }

  /* Page margins */
  @page {
    margin: 2cm;
  }

  /* Add attribution footer */
  .business-detail:after {
    content: "מקור: Netanya Local - netanyalocal.com";
    display: block;
    text-align: center;
    font-size: 0.8em;
    color: #666 !important;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }
}
```

---

## Social Media Meta Tags (NEW)

**File**: `app/[locale]/business/[slug]/page.tsx`

**Purpose**: Open Graph and Twitter Cards for business pages

**Implementation**:
```typescript
// In generateMetadata function
export async function generateMetadata({ params: { locale, slug } }) {
  const business = await getBusiness({ slug, locale })

  if (!business) {
    return {
      title: 'Business not found',
    }
  }

  const title = `${business.name} - ${business.category.name} בנתניה`
  const description = business.description || `${business.category.name} ב${business.neighborhood.name} • ${business.reviewCount} חוות דעת • דירוג ${business.avgRating.toFixed(1)}/5`
  const url = `https://netanyalocal.com/${locale}/business/${business.slug}`

  // Use business image if available, otherwise default
  const imageUrl = business.image_url || 'https://netanyalocal.com/og-default.jpg'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'he': `/he/business/${business.slug_he}`,
        'ru': business.slug_ru ? `/ru/business/${business.slug_ru}` : undefined,
      },
    },
    openGraph: {
      type: 'business.business',
      locale: locale === 'he' ? 'he_IL' : 'ru_RU',
      url,
      title,
      description,
      siteName: 'Netanya Local',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: business.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: business.is_visible,
      follow: true,
      googleBot: {
        index: business.is_visible,
        follow: true,
      },
    },
  }
}
```

**Default OG Image** (`public/og-default.jpg`):
- Size: 1200x630px
- Content: Netanya Local logo + "מדריך העסקים של נתניה"
- Background: Gradient blue to match brand

---

## Updated Component Hierarchy

```
app/[locale]/layout.tsx
├── AccessibilityProvider
├── AnalyticsProvider
├── RecentlyViewedProvider (NEW)
├── Header
│   ├── Logo
│   ├── LanguageSwitcher
│   └── Breadcrumbs (conditionally)
├── <main>
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── SearchForm (with "כל נתניה")
│   │   ├── PopularCategories
│   │   ├── NeighborhoodGrid
│   │   └── RecentlyViewed (if has history)
│   │
│   ├── ResultsPage
│   │   ├── ResultsHeader (with back + count)
│   │   ├── FilterSheet (complete)
│   │   └── BusinessCard[] (with description)
│   │
│   └── BusinessDetailPage
│       ├── Breadcrumbs
│       ├── ShareButton (WhatsApp + Copy)
│       ├── BusinessDetail
│       ├── ReviewsList
│       └── WriteReviewButton
│
├── Footer
└── AccessibilityButton
```

---

## Testing Structure (DEDICATED FOLDER)

```
tests/
├── unit/
│   ├── components/
│   │   ├── SearchForm.test.tsx
│   │   ├── FilterSheet.test.tsx
│   │   ├── BusinessCard.test.tsx
│   │   ├── ShareButton.test.tsx
│   │   └── Rating.test.tsx
│   ├── utils/
│   │   ├── ordering.test.ts        # CRITICAL: Search ordering logic
│   │   ├── validation.test.ts      # Phone/WhatsApp validation
│   │   └── slugify.test.ts
│   └── contexts/
│       ├── AccessibilityContext.test.tsx
│       └── RecentlyViewedContext.test.tsx
│
├── integration/
│   ├── search-flow.test.tsx         # Home → Search → Results
│   ├── review-submission.test.tsx   # Full review flow
│   ├── business-submission.test.tsx # Add business flow
│   └── admin-approval.test.tsx      # Admin approve business
│
├── e2e/
│   ├── user-journey.spec.ts         # Full user flow (Playwright)
│   ├── admin-journey.spec.ts        # Admin flow
│   ├── accessibility.spec.ts        # Keyboard navigation, screen reader
│   └── pwa.spec.ts                  # PWA install, offline mode
│
├── visual/
│   ├── snapshots/                   # Visual regression tests
│   └── screenshots/
│
└── performance/
    ├── lighthouse.config.js         # Lighthouse CI
    └── load-testing.spec.ts         # k6 or Artillery

vitest.config.ts                     # Vitest configuration
playwright.config.ts                 # Playwright configuration
```

---

**Document Version**: 2.0
**Last Updated**: 2025-11-14
**Changes**: Added all requested features + complete testing structure
