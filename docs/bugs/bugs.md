# Bug Tracking & Solutions

**Purpose**: Document bugs encountered during development and their working solutions
**Last Updated**: 2025-11-14

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

## Bug Statistics

| Status | Count |
|--------|-------|
| 🔴 OPEN | 0 |
| ✅ RESOLVED | 1 |
| **TOTAL** | 1 |

---

## Common Issues & Quick Fixes

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

**Last Updated**: 2025-11-14
**Maintained By**: Development Team
