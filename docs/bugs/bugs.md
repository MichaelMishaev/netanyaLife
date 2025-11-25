# Bug Tracking & Solutions

**Purpose**: Document bugs encountered during development and their working solutions
**Last Updated**: 2025-11-25

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

## BUG-007: Logout Redirecting to Business Login Instead of Home Page

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-25
**Date Fixed**: 2025-11-25
**Component**: Business Owner Logout API (app/api/auth/owner/logout/route.ts)
**Severity**: 🟢 Medium

### Description
When business owners logged out from the business portal, they were redirected to the business login page (`/he/business-login`) instead of the home page. This prevented users from continuing to browse the public site after logout.

### Steps to Reproduce
1. Log in as a business owner at `/he/business-login`
2. Navigate to business portal (`/he/business-portal`)
3. Click logout button
4. Observe redirect to `/he/business-login`
5. Expected: Redirect to home page (`/he`)

### Expected Behavior
After logout, users should be redirected to the home page (`/${locale}`) so they can continue browsing the public business directory without needing to log back in.

### Actual Behavior
The logout API endpoint hardcoded a redirect to `/he/business-login`, forcing users back to the login page even if they didn't want to log in again.

### Error Messages/Logs
```json
// API Response
{
  "success": true,
  "redirect": "/he/business-login"
}
```

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: All browsers
- Node: v18+
- Next.js: 14.2.33

### Root Cause
The logout endpoint had a hardcoded redirect path to `/he/business-login` without considering:
1. User's current locale (Hebrew vs Russian)
2. Standard UX pattern of returning to home page after logout
3. Allowing users to continue browsing the public site

The logout flow was designed for admin-style panels where quick re-login is expected, not for a public-facing business directory where users may want to browse after logout.

### Solution
Modified the logout endpoint to:
1. Detect the current locale from the request `referer` header
2. Extract whether user was on `/he/` or `/ru/` routes
3. Redirect to home page (`/${locale}`) instead of login page
4. Default to `'he'` if locale detection fails

This follows standard UX patterns for public-facing applications and maintains language consistency.

### Code Changes
```typescript
// Before (broken) - app/api/auth/owner/logout/route.ts:4-17
export async function POST(request: NextRequest) {
  try {
    // Clear owner session cookie
    await clearOwnerSession()

    return NextResponse.json({
      success: true,
      redirect: '/he/business-login',
    })
  } catch (error) {
    console.error('Business owner logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    )
  }
}

// After (fixed) - app/api/auth/owner/logout/route.ts:4-24
export async function POST(request: NextRequest) {
  try {
    // Clear owner session cookie
    await clearOwnerSession()

    // Get locale from referer or default to 'he'
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ru/') ? 'ru' : 'he'

    return NextResponse.json({
      success: true,
      redirect: `/${locale}`,
    })
  } catch (error) {
    console.error('Business owner logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

### Files Changed
- `app/api/auth/owner/logout/route.ts` (lines 9-15)

### Prevention Tips
1. **Follow standard UX patterns** - Public-facing apps should redirect to home after logout, not login
2. **Detect user locale** - Use referer header or request context to maintain language
3. **Consider user intent** - Users logging out may want to continue browsing, not re-authenticate
4. **Test full user flows** - Verify logout behavior matches expected UX patterns
5. **Document redirect behavior** - Make it clear where users land after authentication actions

### Related Issues
- UX Pattern: Post-logout navigation in public vs admin applications
- i18n: Maintaining locale across authentication state changes

---

## BUG-006: Generic Error Messages on Business Creation Failure

**Status**: ✅ RESOLVED
**Date Found**: 2025-11-25
**Date Fixed**: 2025-11-25
**Component**: createOwnerBusiness (lib/actions/business-owner.ts)
**Severity**: 🟡 High

### Description
When business owners attempted to add a new business through the business portal (`/he/business-portal/add`), form submission failures showed a generic "Failed to create business" error message without any explanation of what went wrong. This left users confused and unable to fix validation errors or data issues.

### Steps to Reproduce
1. Log in as a business owner
2. Navigate to `/he/business-portal/add`
3. Fill out the business form with any invalid data (e.g., invalid category ID, missing required fields)
4. Submit the form
5. Observe generic error message: "Failed to create business"
6. No specific information about what field failed or how to fix it

### Expected Behavior
Users should receive specific, actionable error messages that explain:
- Which field has an issue
- What the problem is (e.g., "Invalid category selected")
- How to fix it (e.g., "Please refresh the page and select a valid category")

### Actual Behavior
All database errors, validation failures, and constraint violations were caught in a generic try-catch block and returned the same unhelpful message: "Failed to create business". The actual error details were only logged to the server console, invisible to the user.

### Error Messages/Logs
```
Error creating pending business: [various Prisma errors]
Response to client: { error: 'Failed to create business' }
```

### Environment
- OS: macOS 14.5 (Darwin 24.5.0)
- Browser: All browsers (server-side issue)
- Node: v18+
- Next.js: 14.2.33
- Prisma: Latest

### Root Cause
The `createOwnerBusiness` function in `lib/actions/business-owner.ts` had a generic catch block that:
1. Logged the actual error to console (line 413)
2. Returned a generic error message to the user (line 414)
3. Did not parse Prisma error codes
4. Did not validate foreign key references before insertion

This meant users couldn't understand:
- If their category/subcategory/neighborhood selection was invalid
- If they had duplicate business data
- If their input was too long for database fields
- Any other specific validation failures

### Solution
Implemented comprehensive error handling with:

1. **Pre-validation**: Check that category, subcategory, and neighborhood exist before attempting database insertion
2. **Prisma error parsing**: Parse specific Prisma error codes and return user-friendly messages:
   - `P2002`: Unique constraint violation → "A business with similar details already exists"
   - `P2003`: Foreign key constraint → "Invalid category/subcategory/neighborhood"
   - `P2000`: Value too long → "One or more fields contain too much text"
   - `P2001`: Required field missing → "Required data is missing"
3. **Actionable guidance**: Each error message includes instructions on how to fix the issue

### Code Changes
```typescript
// Before (broken) - lib/actions/business-owner.ts:413-414
} catch (error) {
  console.error('Error creating pending business:', error)
  return { error: 'Failed to create business' }
}

// After (fixed) - lib/actions/business-owner.ts:378-470
// Validate category exists
const categoryExists = await prisma.category.findUnique({
  where: { id: data.category_id },
})

if (!categoryExists) {
  return { error: 'Invalid category selected. Please refresh the page and try again.' }
}

// Validate subcategory exists (if provided)
if (data.subcategory_id) {
  const subcategoryExists = await prisma.subcategory.findUnique({
    where: { id: data.subcategory_id },
  })

  if (!subcategoryExists) {
    return { error: 'Invalid subcategory selected. Please refresh the page and try again.' }
  }
}

// Validate neighborhood exists
const neighborhoodExists = await prisma.neighborhood.findUnique({
  where: { id: data.neighborhood_id },
})

if (!neighborhoodExists) {
  return { error: 'Invalid neighborhood selected. Please refresh the page and try again.' }
}

// ... business creation ...

} catch (error) {
  console.error('Error creating pending business:', error)

  // Parse Prisma errors for user-friendly messages
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } }

    // Handle specific Prisma error codes
    if (prismaError.code === 'P2002') {
      return { error: 'A business with similar details already exists. Please check your information.' }
    } else if (prismaError.code === 'P2003') {
      const target = prismaError.meta?.target?.[0]
      if (target === 'category_id') {
        return { error: 'Invalid category. Please refresh the page and select a valid category.' }
      } else if (target === 'subcategory_id') {
        return { error: 'Invalid subcategory. Please refresh the page and select a valid subcategory.' }
      } else if (target === 'neighborhood_id') {
        return { error: 'Invalid neighborhood. Please refresh the page and select a valid neighborhood.' }
      }
      return { error: 'Invalid selection. Please refresh the page and try again.' }
    } else if (prismaError.code === 'P2000') {
      return { error: 'One or more fields contain too much text. Please shorten your input.' }
    } else if (prismaError.code === 'P2001') {
      return { error: 'Required data is missing. Please fill in all required fields.' }
    }
  }

  return { error: 'Failed to create business. Please try again or contact support if the problem persists.' }
}
```

### Files Changed
- `lib/actions/business-owner.ts` (lines 378-470)

### Commits
- `c5f1a7d` - fix: improve error handling for business creation with detailed messages

### Prevention Tips
1. **Always validate foreign key references** before insertion to catch invalid IDs early
2. **Parse database-specific error codes** (Prisma, SQL, etc.) for user-friendly messages
3. **Never show generic error messages** - Users need to know what went wrong and how to fix it
4. **Include actionable guidance** - Tell users what to do next (e.g., "refresh the page")
5. **Log detailed errors server-side** while showing safe messages to users (don't expose internals)
6. **Test error scenarios** - Try submitting invalid data to ensure errors are helpful

### Related Issues
- Prisma Error Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
- User Experience: Actionable error messages improve conversion rates

---

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
| ✅ RESOLVED | 7 |
| **TOTAL** | 7 |

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

**Last Updated**: 2025-11-25
**Maintained By**: Development Team
