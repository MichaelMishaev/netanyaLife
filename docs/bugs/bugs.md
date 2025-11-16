# Bug Tracking & Solutions

**Purpose**: Document bugs encountered during development and their working solutions
**Last Updated**: 2025-11-16

---

## How to Use This File

When you encounter a bug during development:

1. **Document the bug** - Add a new entry with:
   - Bug description
   - Steps to reproduce
   - Error messages/logs
   - Expected vs actual behavior

2. **Document the solution** - When fixed, add:
   - Root cause analysis
   - Solution implemented
   - Code changes made
   - Prevention tips

3. **Mark as resolved** - Change status from 🔴 OPEN to ✅ RESOLVED

---

## Bug Template

````markdown
## BUG-XXX: [Short Description]

**Status**: 🔴 OPEN / ✅ RESOLVED
**Date Found**: YYYY-MM-DD
**Date Fixed**: YYYY-MM-DD
**Component**: [e.g., SearchForm, getSearchResults, etc.]
**Severity**: 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Error Messages/Logs
```
[Paste error messages or logs here]
```

### Environment
- OS: [e.g., macOS 14.5]
- Browser: [e.g., Chrome 120]
- Node: [e.g., v18.17.0]
- Next.js: [e.g., 14.0.4]

### Root Cause
[Analysis of why the bug occurred]

### Solution
[Detailed explanation of the fix]

### Code Changes
```typescript
// Before (broken)
[code]

// After (fixed)
[code]
```

### Files Changed
- `path/to/file1.ts`
- `path/to/file2.tsx`

### Prevention Tips
[How to avoid this bug in the future]

### Related Issues
- Links to related bugs or GitHub issues
````

---

## Active Bugs (🔴 OPEN)

*No active bugs yet. Add bugs here as you encounter them.*

---

## Resolved Bugs (✅ RESOLVED)

## BUG-005: Recently Viewed Count Mismatch on Mobile

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-16
**Date Fixed**: 2025-11-16
**Component**: RecentlyViewed
**Severity**: 🟢 Medium

### Description
The "Recently Viewed" section displayed incorrect count on mobile devices. The header showed total count (e.g., "4 עסקים נצפו לאחרונה") but only 3 businesses were actually displayed in the list, causing user confusion.

### Steps to Reproduce
1. Visit 4 business detail pages to populate recently viewed
2. Navigate to home page
3. Scroll to "Recently Viewed" section on mobile (or narrow viewport < 768px)
4. Observe header shows "4 עסקים נצפו לאחרונה"
5. Count displayed businesses - only 3 are shown

### Expected Behavior
The count text should match the number of businesses displayed:
- Mobile: Show "3 עסקים נצפו לאחרונה" when displaying 3 items
- Desktop: Show full count when displaying all items via horizontal scroll

### Actual Behavior
Header always showed `recentlyViewed.length` (total count) even when mobile displayed fewer items via `.slice(0, 3)`.

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: All browsers (viewport-dependent issue)
- Node: v18+
- Next.js: 14.2.33

### Root Cause
The component had two separate display logics:
1. **Count text** (line 44): Always showed `recentlyViewed.length` (e.g., 4)
2. **Mobile display** (line 76): Limited to first 3 items via `.slice(0, 3)`

The count was not responsive to the actual display behavior, creating a mismatch between what was shown and what was counted.

### Solution
Implemented responsive count display using Tailwind's breakpoint classes (`md:hidden` and `hidden md:inline`):
- **Mobile (`md:hidden`)**: Shows `Math.min(recentlyViewed.length, 3)` to match the 3 displayed items
- **Desktop (`hidden md:inline`)**: Shows `recentlyViewed.length` to match all displayed items in horizontal scroll

This ensures the count always matches what's visible without JavaScript viewport detection.

### Code Changes
```typescript
// Before (broken) - components/client/RecentlyViewed.tsx:43-46
<p className="mt-1 text-xs text-gray-500 sm:text-sm">
  {recentlyViewed.length}{' '}
  {locale === 'he' ? 'עסקים נצפו לאחרונה' : 'недавно просмотренных'}
</p>

// After (fixed) - components/client/RecentlyViewed.tsx:43-54
<p className="mt-1 text-xs text-gray-500 sm:text-sm">
  {/* Mobile: show count of displayed items (max 3) */}
  <span className="md:hidden">
    {Math.min(recentlyViewed.length, 3)}{' '}
    {locale === 'he' ? 'עסקים נצפו לאחרונה' : 'недавно просмотренных'}
  </span>
  {/* Desktop: show total count */}
  <span className="hidden md:inline">
    {recentlyViewed.length}{' '}
    {locale === 'he' ? 'עסקים נצפו לאחרונה' : 'недавно просмотренных'}
  </span>
</p>
```

### Files Changed
- `components/client/RecentlyViewed.tsx` (lines 43-54)

### Prevention Tips
1. **Always match display count to visible items** - When limiting displayed items, update count text accordingly
2. **Use responsive count logic** - For viewport-dependent displays, make counts responsive too
3. **Prefer CSS-based solutions** - Tailwind breakpoint classes are cleaner than JS viewport detection
4. **Test on multiple viewports** - Mobile vs desktop may show different content
5. **Consider UX implications** - Mismatched counts confuse users about total available items

---

## BUG-001: React useContext Hook Error During SSR

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-15
**Date Fixed**: 2025-11-15
**Component**: Layout, ClientProviders
**Severity**: 🔴 Critical

### Description
Application was crashing with a React hooks error: `TypeError: Cannot read properties of null (reading 'useContext')` during server-side rendering. The error occurred in Next.js's ErrorBoundary component when trying to use `usePathname()` hook.

### Steps to Reproduce
1. Start development server (`npm run dev`)
2. Navigate to any page (e.g., `/he`, `/he/add-business`)
3. Server throws React hooks error and page fails to render

### Expected Behavior
Pages should render successfully without React context errors.

### Actual Behavior
Application crashed with the following error:
```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
TypeError: Cannot read properties of null (reading 'useContext')
    at usePathname (webpack-internal:///(ssr)/./node_modules/next/dist/client/components/navigation.js:121:34)
    at ErrorBoundary (webpack-internal:///(ssr)/./node_modules/next/dist/client/components/error-boundary.js:159:50)
```

### Error Messages/Logs
```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app

TypeError: Cannot read properties of null (reading 'useContext')
    at t.useContext (/Users/michaelmishayev/Desktop/Projects/netanyaBusiness/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js:35:162242)
    at usePathname (webpack-internal:///(ssr)/./node_modules/next/dist/client/components/navigation.js:121:34)
    at ErrorBoundary (webpack-internal:///(ssr)/./node_modules/next/dist/client/components/error-boundary.js:159:50)
```

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: N/A (server-side error)
- Node: v18+
- Next.js: 14.2.33
- React: 18.3.0

### Root Cause
The issue was caused by using client-side providers (`AnalyticsProvider`, `AccessibilityProvider`, `RecentlyViewedProvider`) directly in a server component (`app/[locale]/layout.tsx`).

When Next.js tried to render the server component during SSR:
1. It encountered the client component boundary (providers marked with 'use client')
2. React context was not properly initialized during the SSR phase
3. Next.js's ErrorBoundary tried to use `usePathname()` hook
4. The hook failed because React context was `null`

This is a known Next.js issue when mixing server and client components without proper boundaries.

### Solution
Created a dedicated client component wrapper (`ClientProviders`) that encapsulates all client-side context providers. This ensures proper React context initialization by creating a clear client boundary.

The wrapper component:
- Is marked with 'use client' directive
- Wraps all context providers (Analytics, Accessibility, RecentlyViewed)
- Ensures React context is initialized on the client side before any hooks are called

### Code Changes

**Before (broken):**
```typescript
// app/[locale]/layout.tsx
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext'

export default async function LocaleLayout({ children, params }) {
  return (
    <body>
      <NextIntlClientProvider messages={messages}>
        <AnalyticsProvider>
          <AccessibilityProvider>
            <RecentlyViewedProvider>
              {children}
            </RecentlyViewedProvider>
          </AccessibilityProvider>
        </AnalyticsProvider>
      </NextIntlClientProvider>
    </body>
  )
}
```

**After (fixed):**
```typescript
// components/providers/ClientProviders.tsx (NEW FILE)
'use client'

import { ReactNode } from 'react'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AnalyticsProvider>
      <AccessibilityProvider>
        <RecentlyViewedProvider>
          {children}
        </RecentlyViewedProvider>
      </AccessibilityProvider>
    </AnalyticsProvider>
  )
}

// app/[locale]/layout.tsx (UPDATED)
import { ClientProviders } from '@/components/providers/ClientProviders'

export default async function LocaleLayout({ children, params }) {
  return (
    <body>
      <NextIntlClientProvider messages={messages}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </NextIntlClientProvider>
    </body>
  )
}
```

### Files Changed
- `components/providers/ClientProviders.tsx` (created)
- `app/[locale]/layout.tsx` (modified)

### Prevention Tips
1. **Always wrap client providers in a dedicated client component** when using them in server components
2. **Create clear client boundaries** by marking wrapper components with 'use client'
3. **Never import client providers directly in server components** - use a wrapper instead
4. **Watch for SSR errors** - if you see "useContext" errors during server rendering, check your client/server boundaries
5. **Follow Next.js App Router patterns** - use the recommended pattern of separating server and client logic

### Related Issues
- Next.js Issue: Server/Client component boundary context initialization
- React Error: "Invalid hook call" when context is not properly initialized

---

## BUG-002: Recommended Badge Overlapping Business Name on Mobile

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-16
**Date Fixed**: 2025-11-16
**Component**: BusinessCard
**Severity**: 🟡 High

### Description
The "⭐ מומלץ" (Recommended) badge for pinned businesses was overlapping with the business name text on mobile devices, making the business name partially unreadable.

### Steps to Reproduce
1. Navigate to search results page on mobile device or narrow viewport (375px width)
2. View a business that has `is_pinned = true`
3. Observe the recommended badge at the top-right
4. Notice the business name text is partially covered by the badge

### Expected Behavior
The recommended badge should display at the top without overlapping any content. The business name should have sufficient clearance from the badge.

### Actual Behavior
The badge positioned at `top-0` overlapped with the business name text directly below it, making 1-2 lines of the name unreadable.

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: Mobile viewport (375px width)
- Node: v18+
- Next.js: 14.2.33

### Root Cause
The recommended badge was absolutely positioned at the top-right corner (`absolute right-0 top-0`) without adding any padding to the card content below it. The Link element containing the business name started at `p-3` (12px), which wasn't enough clearance for the badge height.

### Solution
Added conditional top padding to the Link element when a business is pinned. The padding (`pt-8` = 32px) creates sufficient space for the absolutely-positioned badge, preventing any overlap with the business name.

### Code Changes
```typescript
// Before (broken) - components/client/BusinessCard.tsx:88
<Link href={`/${locale}/business/${slug}`} className="block p-3 pe-3 ps-4 md:p-4 md:ps-5">

// After (fixed) - components/client/BusinessCard.tsx:88
<Link href={`/${locale}/business/${slug}`} className={`block p-3 pe-3 ps-4 md:p-4 md:ps-5 ${business.is_pinned ? 'pt-8' : ''}`}>
```

### Files Changed
- `components/client/BusinessCard.tsx` (line 88)

### Commits
- `eb130ad` - fix(business-card): prevent badge overlap with business name on mobile

### Prevention Tips
1. **Always account for absolutely-positioned elements** - Add padding/margin to surrounding content
2. **Test on mobile viewports** - Visual bugs often appear only on narrow screens
3. **Use conditional spacing** - Apply padding only when the overlapping element is present
4. **Consider z-index layering** - Ensure badges don't cover critical content

---

## BUG-003: Hydration Error from Non-Deterministic Random Shuffle

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-16
**Date Fixed**: 2025-11-16
**Component**: getSearchResults (lib/queries/businesses.ts)
**Severity**: 🔴 Critical

### Description
Critical hydration error occurring after admin updates to businesses (pinning/unpinning). The error required 10+ page refreshes to resolve and completely broke the search results page:

```
TypeError: can't access property "call", originalFactory is undefined
Warning: An error occurred during hydration. The entire root will switch to client rendering.
```

### Steps to Reproduce
1. Go to admin panel (`/admin/businesses`)
2. Pin or unpin a business using the "📌 הצמד" button
3. Navigate to search results page
4. Page crashes with hydration error in browser console
5. Refresh page 10+ times until it randomly works

### Expected Behavior
Search results should render consistently on first load without hydration errors, even after admin changes.

### Actual Behavior
Page crashed with React hydration error. Server-rendered HTML didn't match client's first render due to random ordering differences.

### Error Messages/Logs
```
TypeError: can't access property "call", originalFactory is undefined
    at Webpack [runtime code]

Warning: An error occurred during hydration. The application will switch to client rendering.
Warning: Expected server HTML to contain a matching <div> in <div>
```

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: Chrome/Safari (all browsers affected)
- Node: v18+
- Next.js: 14.2.33
- React: 18.3.0

### Root Cause
The `getSearchResults` function used `Math.random()` to shuffle the "random 5" businesses:

```typescript
const shuffled = [...businessesWithRatings].sort(() => Math.random() - 0.5)
```

**Why this caused hydration errors:**
1. Server renders component → calls `Math.random()` → produces Order A: [B1, B3, B2, B5, B4]
2. HTML sent to client with businesses in Order A
3. Client hydrates → calls `Math.random()` → produces Order B: [B2, B1, B4, B3, B5]
4. React compares server HTML (Order A) vs client output (Order B) → **MISMATCH!**
5. React throws hydration error and crashes

This is a **non-deterministic operation** - same input produces different output on server vs client.

### Solution
Replaced `Math.random()` with a **deterministic seeded shuffle** using a hash function. The seed is created from `categoryId + neighborhoodId`, ensuring the same search parameters always produce the same "random" order on both server and client.

### Code Changes
```typescript
// Before (broken) - lib/queries/businesses.ts:79
const shuffled = [...businessesWithRatings].sort(() => Math.random() - 0.5)

// After (fixed) - lib/queries/businesses.ts:78-94
// 3. Deterministic shuffle based on search params (prevents hydration errors)
// Create a seed from categoryId + neighborhoodId for consistent "random" ordering
const seed = `${categoryId}-${neighborhoodId || 'all'}`
const seededRandom = (str: string, index: number) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i) + index
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647 // Normalize to 0-1
}

const shuffled = [...businessesWithRatings].sort((a, b) => {
  const hashA = seededRandom(seed + a.id, 0)
  const hashB = seededRandom(seed + b.id, 0)
  return hashA - hashB
})
const random5 = shuffled.slice(0, 5)
const rest = shuffled.slice(5)
```

### Files Changed
- `lib/queries/businesses.ts` (lines 78-94)

### Commits
- `b689c5e` - fix(critical): resolve hydration error from non-deterministic shuffle

### Prevention Tips
1. **Never use Math.random() in SSR contexts** - Server and client will produce different values
2. **Use deterministic algorithms** - Same input must produce same output on server/client
3. **Seed random functions** - Use request parameters (IDs, slugs) as seeds for consistency
4. **Test hydration thoroughly** - Always refresh pages multiple times after changes
5. **Watch for "Expected server HTML" warnings** - These indicate hydration mismatches

### Related Issues
- React: Hydration errors from non-deterministic operations
- Next.js: Server/Client mismatch in App Router

---

## BUG-004: Hydration Error from Client-Side Re-Sorting on Initial Render

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-16
**Date Fixed**: 2025-11-16
**Component**: SearchResultsClient
**Severity**: 🔴 Critical

### Description
Even after fixing the random shuffle hydration error (BUG-003), the same hydration error persisted. Investigation revealed a **second source** of hydration mismatch: the client component was re-sorting all businesses immediately on mount, breaking the server's carefully crafted order.

### Steps to Reproduce
1. Navigate to search results page after BUG-003 fix was deployed
2. Hydration error still occurs on page load
3. Browser console shows same "Expected server HTML" warning
4. Server rendered order: Pinned → Random 5 → Rest (by rating)
5. Client immediately re-sorted: ALL businesses by rating → Random 5 in wrong positions

### Expected Behavior
Client should preserve server's initial ordering during hydration. Sorting should only apply when user explicitly changes the sort option.

### Actual Behavior
Client immediately re-sorted businesses on mount, causing hydration mismatch:
- **Server order**: [Pinned1, Pinned2, Random1, Random2, Random3, Random4, Random5, Rest...]
- **Client order**: [Pinned1, Random3, Pinned2, Random5, Random1, Rest...]

### Error Messages/Logs
```
Warning: An error occurred during hydration
Warning: Expected server HTML to contain a matching <div> in <div>
TypeError: can't access property "call", originalFactory is undefined
```

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: All browsers affected
- Node: v18+
- Next.js: 14.2.33
- React: 18.3.0

### Root Cause
The `SearchResultsClient` component is a client component that:
1. Receives `businesses` prop from server (already in correct order)
2. Has `sortOption` state defaulting to `'rating-high'`
3. Immediately ran sorting logic in `useMemo` on first render
4. This re-sorted businesses BEFORE React finished hydration

**The flow:**
1. Server: Renders businesses in order: Pinned → Random 5 → Rest (by rating)
2. Server: Sends HTML to client
3. Client: Starts hydration, receives `businesses` prop
4. Client: `useMemo` runs → sees `sortOption='rating-high'` → **re-sorts ALL businesses**
5. Client: Now has different order than server HTML → **HYDRATION ERROR!**

Even though BUG-003 fixed the server-side randomness, the client was still causing mismatches by re-sorting.

### Solution
Added an `isInitialRender` flag that:
1. Starts as `true` on both server and client
2. Skips sorting during initial render
3. Changes to `false` after first render via `useEffect`
4. Only allows sorting after user explicitly changes sort option

This ensures server and client produce **identical output** during hydration.

### Code Changes
```typescript
// Before (broken) - components/client/SearchResultsClient.tsx
import { useState, useMemo } from 'react'

export default function SearchResultsClient({ businesses, locale }) {
  const [sortOption, setSortOption] = useState<SortOption>('rating-high')

  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses]

    // This ran immediately on first render, breaking server order!
    result.sort((a, b) => {
      switch (sortOption) {
        case 'rating-high':
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        // ...
      }
    })

    return result
  }, [businesses, sortOption, locale])
}

// After (fixed) - components/client/SearchResultsClient.tsx
import { useState, useMemo, useEffect } from 'react' // Added useEffect

export default function SearchResultsClient({ businesses, locale }) {
  const [sortOption, setSortOption] = useState<SortOption>('rating-high')
  const [isInitialRender, setIsInitialRender] = useState(true) // NEW

  // Mark as not initial render after first client-side update
  useEffect(() => {
    setIsInitialRender(false)
  }, [])

  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses]

    // Only apply sorting after initial render to prevent hydration errors
    // Server already provides optimized ordering (pinned → random 5 → rest by rating)
    if (!isInitialRender) { // NEW CHECK
      result.sort((a, b) => {
        switch (sortOption) {
          case 'rating-high':
            return (b.avg_rating || 0) - (a.avg_rating || 0)
          // ...
        }
      })
    }

    return result
  }, [businesses, sortOption, filters, locale, isInitialRender]) // Added isInitialRender
}
```

### Files Changed
- `components/client/SearchResultsClient.tsx` (lines 3, 22-27, 41-62, 65)

### Commits
- `c6a5e66` - fix(critical): prevent client-side re-sorting on initial render

### Prevention Tips
1. **Always preserve server order during hydration** - Don't transform data on first render
2. **Use `isInitialRender` pattern** - Skip client-only logic until after hydration
3. **Trust server-side ordering** - Server can provide optimized initial state
4. **Test with React DevTools** - Enable "Highlight updates" to see re-renders
5. **Watch useMemo dependencies** - Ensure they don't cause unintended re-computations
6. **Remember useEffect timing** - It runs AFTER first render, perfect for post-hydration flags

### Related Issues
- BUG-003: Non-deterministic shuffle (fixed together)
- Next.js: Client component hydration with state-dependent rendering

---

## Bug Statistics

| Status | Count |
|--------|-------|
| 🔴 OPEN | 0 |
| ✅ RESOLVED | 5 |
| **TOTAL** | 5 |

---

## Common Issues & Quick Fixes

### Hydration Errors (Critical)
**Symptom**: "Expected server HTML to contain matching" errors, page requires multiple refreshes
**Quick Fix**:
- Never use `Math.random()` in server/client shared code - use seeded randomization
- Skip client-side transformations on initial render using `isInitialRender` flag
- Ensure server and client produce identical output during first render
**Reference**: See BUG-003 and BUG-004 for detailed solutions

### RTL Layout Issues
**Symptom**: Layout breaks in Hebrew (RTL) mode
**Quick Fix**: Use Tailwind logical properties (`ms-4` instead of `ml-4`)
**Reference**: See `05-component-architecture.md` accessibility guidelines

### Service Worker Caching WhatsApp Links
**Symptom**: WhatsApp links don't work offline or open cached version
**Quick Fix**: Add `wa.me/*` to NetworkOnly strategy in PWA config
**Reference**: See `01-tech-stack.md` PWA configuration

### Search Ordering Random Results Not Changing
**Symptom**: Random 5 businesses always show in same order
**Quick Fix**: Ensure Fisher-Yates shuffle is called on every request (not cached)
**Reference**: See `04-api-endpoints.md` getSearchResults function

### Phone/WhatsApp Validation Failing
**Symptom**: Form rejects valid submissions with error
**Quick Fix**: Check Zod refine - should be OR logic, not AND
**Reference**: See `02-database-schema.md` validation rules

---

## Notes for Future Developers

### When Adding Bugs
1. Always include reproduction steps
2. Include full error messages (don't truncate)
3. Note the exact version of all dependencies
4. Add screenshots if UI-related
5. Link to related issues or PRs

### When Fixing Bugs
1. Document root cause (helps prevent recurrence)
2. Include before/after code snippets
3. List all files changed
4. Update any related documentation
5. Add prevention tips for similar bugs
6. Consider adding a test case to prevent regression

### Bug Severity Guidelines
- 🔴 **Critical**: Blocks core functionality, data loss, security issue
- 🟡 **High**: Major feature broken, workaround exists
- 🟢 **Medium**: Minor feature issue, doesn't block workflow
- ⚪ **Low**: Cosmetic issue, typo, minor UX improvement

---

**Last Updated**: 2025-11-16
**Maintained By**: Development Team
