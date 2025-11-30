# ✅ Customer Automation Tests - Complete Guide

## 📋 Overview

This directory contains **comprehensive end-to-end automation tests** for all customer-facing screens in the **קהילת נתניה (Netanya Community)** business directory.

Tests validate **EVERY clickable element, UI interaction, and critical business logic** as a real customer would experience.

---

## 🎯 Test Coverage

### ✅ New Customer Validation Tests (2025)

#### 1. **customer-complete-validation.spec.ts** - MASTER SUITE
Complete validation of all customer screens:
- ✅ Homepage (Hebrew + Russian)
- ✅ Language Switcher (RTL ↔ LTR)
- ✅ Search Flow (category + neighborhood)
- ✅ Search Results Page (all elements)
- ✅ Business Cards (clickable, display data)
- ✅ No Results Fallback Flow
- ✅ Business Detail Page (all CTAs)
- ✅ Add Business Form (validation)
- ✅ Review Submission Flow
- ✅ Accessibility Panel (all features + localStorage)
- ✅ Mobile Responsiveness (375px+)
- ✅ Categories Page

**Run:** `npm run test:e2e -- customer-complete-validation`

---

#### 2. **search-result-ordering.spec.ts** - CRITICAL BUSINESS LOGIC
Validates search result ordering per docs/sysAnal.md:87-91:
1. ✅ Pinned businesses appear first (is_pinned=true)
2. ✅ Next 5 random businesses
3. ✅ Rest sorted by rating DESC, then newest
4. ✅ Respects topPinnedCount admin setting
5. ✅ Consistent ordering across multiple searches

**Run:** `npm run test:e2e -- search-result-ordering`

---

#### 3. **business-cta-validation.spec.ts** - CRITICAL VALIDATION
Tests all Call-To-Action buttons on business detail pages:
- ✅ **CRITICAL:** Must have phone OR WhatsApp (never both missing)
- ✅ Phone button: `tel:` format, accessible
- ✅ WhatsApp button: `wa.me` format, opens in new tab
- ✅ Website button: opens in new tab with `rel="noopener noreferrer"`
- ✅ Directions button: Google Maps/Waze links
- ✅ Share button: opens share dialog
- ✅ **No auto-copy:** Only show buttons for provided contacts
- ✅ Accessibility: All buttons have aria-labels
- ✅ Multi-business consistency check

**Run:** `npm run test:e2e -- business-cta-validation`

---

#### 4. **pwa-offline.spec.ts** - PWA FUNCTIONALITY
Progressive Web App features per docs/sysAnal.md:281-294:
- ✅ Manifest.json validation (name, lang=he, dir=rtl)
- ✅ Service Worker registration
- ✅ Cache population after first visit
- ✅ Offline mode fallback message
- ✅ Cached pages work offline
- ✅ PWA install prompt
- ✅ Mobile meta tags (viewport, theme-color, apple-touch-icon)
- ✅ Standalone mode detection
- ✅ Static asset caching
- ✅ Performance metrics (FCP, load time)

**Run:** `npm run test:e2e -- pwa-offline`

---

### 📁 Existing Tests (Still Valid)

- `home.spec.ts` - Homepage basics
- `add-business.spec.ts` - Add business form
- `user-journey.spec.ts` - Complete user flows
- `cross-browser.spec.ts` - Multi-browser compatibility
- `validation-i18n.spec.ts` - i18n validation
- `header-navigation.spec.ts` - Navigation tests
- And 17 more existing test files...

---

## 🚀 Quick Start

### Run ALL Customer Tests

```bash
npm run test:e2e -- customer-complete-validation search-result-ordering business-cta-validation pwa-offline
```

### Run Individual Test Suites

```bash
# Master validation suite
npm run test:e2e -- customer-complete-validation

# Search ordering logic
npm run test:e2e -- search-result-ordering

# CTA buttons validation
npm run test:e2e -- business-cta-validation

# PWA & offline features
npm run test:e2e -- pwa-offline
```

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests with UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Run Tests in Specific Browser

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

---

## 📊 Test Results & Reports

After running tests:

```bash
# View HTML report
npx playwright show-report

# Screenshots are saved to:
test-results/customer-validation/
test-results/ordering/
test-results/cta/
test-results/screenshots/
```

---

## 🛠️ Test Utilities

### Helper Functions (`tests/e2e/helpers/test-utils.ts`)

All tests use shared utilities for consistency:

#### Navigation
- `navigateToHome(page, 'he' | 'ru')` - Go to homepage
- `navigateToFirstBusiness(page)` - Navigate through search to business
- `performSearch(page, categoryIndex, neighborhoodIndex)` - Execute search
- `selectNeighborhood(page, index)` - Handles dropdown/buttons

#### UI Interactions
- `openAccessibilityPanel(page)` - Open accessibility menu
- `switchLanguage(page, 'he' | 'ru')` - Change language
- `setFontSize(page, 'גדול')` - Change font size
- `toggleHighContrast(page)` - Toggle contrast mode

#### Data Extraction
- `getAllCategories(page)` - Get all service categories
- `getAllNeighborhoods(page)` - Get all neighborhoods
- `extractBusinessCards(page)` - Get search result data
- `extractCTAButtons(page)` - Get CTA button info

#### Validation
- `verifyURL(page, /pattern/)` - Check URL matches
- `verifyNoHorizontalScroll(page)` - Mobile responsiveness
- `verifyClickable(element)` - Element is visible + enabled
- `verifyDirection(page, 'rtl')` - RTL/LTR check

#### Forms
- `fillAddBusinessForm(page, {...})` - Fill add business form
- `submitReview(page, 5, 'comment', 'name')` - Submit review

#### Utilities
- `takeScreenshot(page, 'name')` - Save screenshot
- `waitForServiceWorker(page)` - Wait for SW ready
- `generateTestId()` - Unique test identifier

**Example usage:**

```typescript
import { navigateToFirstBusiness, extractCTAButtons } from '../helpers/test-utils'

test('My test', async ({ page }) => {
  const hasBusinesses = await navigateToFirstBusiness(page)
  if (!hasBusinesses) return

  const ctas = await extractCTAButtons(page)
  expect(ctas.hasPhone || ctas.hasWhatsApp).toBe(true)
})
```

---

## 🎯 Critical Business Logic Tests

### 1. Search Result Ordering (docs/sysAnal.md:87-91)

**MUST validate:**
1. Pinned businesses (is_pinned=true) appear FIRST
2. Next 5 businesses are random
3. Remaining businesses sorted by rating DESC

**Test file:** `search-result-ordering.spec.ts`

---

### 2. Phone/WhatsApp Requirement (docs/sysAnal.md:153-161)

**MUST validate:**
- Business has phone OR whatsapp_number (at least one)
- NEVER auto-copy (don't show WhatsApp if only phone provided)
- Error message: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות"

**Test file:** `business-cta-validation.spec.ts`

---

### 3. No Results Fallback (docs/sysAnal.md:93-97)

**MUST validate:**
- When results_count == 0 for selected neighborhood
- Show: "לא נמצאו תוצאות בשכונה שנבחרה"
- Button: "חיפוש בכל נתניה" (expands search)

**Test file:** `customer-complete-validation.spec.ts`

---

### 4. PWA Requirements (docs/sysAnal.md:281-294)

**MUST validate:**
- Manifest: lang=he, dir=rtl, name="קהילת נתניה"
- Service worker caches visited pages
- Offline fallback: "אין חיבור לאינטרנט"

**Test file:** `pwa-offline.spec.ts`

---

## 🌐 Multi-Language Testing

All tests support both Hebrew (RTL) and Russian (LTR):

```typescript
// Hebrew (RTL)
await navigateToHome(page, 'he')
await verifyDirection(page, 'rtl')

// Russian (LTR)
await navigateToHome(page, 'ru')
await verifyDirection(page, 'ltr')
```

---

## 📱 Mobile Testing

Tests run on:
- Desktop Chrome (1280x720)
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

**Mobile-specific validations:**
- No horizontal scroll at 375px width
- Touch-friendly buttons (44x44px minimum)
- Responsive layout

---

## ♿ Accessibility Testing

All tests validate WCAG AA compliance:

- Semantic HTML (`<main>`, `<nav>`, `<header>`)
- `aria-label` for icon buttons
- Keyboard navigation (tab order)
- Focus states visible
- Color contrast
- Screen reader compatibility

**Accessibility panel features tested:**
- Font size: Normal / Medium / Large
- High contrast mode
- Underline links
- LocalStorage persistence

---

## 🐛 Debugging Tests

### Run Single Test

```bash
npx playwright test -g "CTA - MUST have phone OR WhatsApp"
```

### Debug Mode

```bash
npx playwright test --debug
```

### Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Show Traces

```bash
npx playwright show-trace trace.zip
```

### Console Logs

All tests include detailed console output:

```
🏠 Testing Hebrew Homepage
✅ RTL direction confirmed
✅ Header and logo visible
✅ Language switcher visible and enabled
✅ Search form visible
```

---

## 📸 Screenshots

Tests automatically capture screenshots:

- **On success:** Key validation points
- **On failure:** Error state for debugging
- **Full page:** All important screens

**Locations:**
- `test-results/customer-validation/`
- `test-results/ordering/`
- `test-results/cta/`
- `test-results/screenshots/`

---

## 🔄 CI/CD Integration

Tests are configured for Railway deployment:

**playwright.config.ts:**
```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
```

**In CI:**
- 2 retries for flaky tests
- 1 worker (sequential execution)
- Screenshots + videos on failure

---

## 📊 Test Execution Time

**Estimated times:**

| Test Suite | Duration | Browser Count | Total Time |
|-----------|----------|---------------|------------|
| customer-complete-validation | ~2 min | 6 | ~12 min |
| search-result-ordering | ~1 min | 6 | ~6 min |
| business-cta-validation | ~1.5 min | 6 | ~9 min |
| pwa-offline | ~2 min | 6 | ~12 min |
| **TOTAL** | **~6.5 min** | **6 browsers** | **~40 min** |

**Optimization:**
- Run in parallel: `fullyParallel: true`
- Single browser for dev: `--project=chromium`
- Specific tests only: `-g "test name"`

---

## ✅ Success Criteria

All customer tests MUST pass before deployment:

- ✅ All clickable elements are visible and enabled
- ✅ All navigation flows work correctly
- ✅ Search result ordering matches business logic
- ✅ CTA buttons follow phone/WhatsApp rules
- ✅ No results fallback displays correctly
- ✅ Accessibility panel persists settings
- ✅ Language switching (RTL ↔ LTR) works
- ✅ Mobile responsive (no horizontal scroll)
- ✅ PWA manifest and service worker valid
- ✅ All forms validate inputs

---

## 🚨 Common Issues & Solutions

### Issue: "No businesses found to test"

**Solution:** Run database seed:
```bash
npm run db:seed
```

### Issue: "Service Worker not registering"

**Solution:** Ensure dev server is running with HTTPS or localhost.

### Issue: "Timeout waiting for URL"

**Solution:** Increase timeout or check network:
```typescript
await page.waitForURL(/\/search\//, { timeout: 15000 })
```

### Issue: "Element not visible"

**Solution:** Add waitForLoadState:
```typescript
await page.waitForLoadState('networkidle')
```

---

## 📚 Resources

- **Playwright Docs:** https://playwright.dev
- **Project Docs:** `/docs/sysAnal.md`
- **Test Utils:** `/tests/e2e/helpers/test-utils.ts`
- **Playwright Config:** `/playwright.config.ts`

---

## 🎉 Summary

You now have **4 comprehensive test suites** covering:

1. ✅ **customer-complete-validation.spec.ts** - All screens (homepage, search, business detail, forms, accessibility)
2. ✅ **search-result-ordering.spec.ts** - Critical search ordering logic
3. ✅ **business-cta-validation.spec.ts** - CTA buttons (phone, WhatsApp, website, directions, share)
4. ✅ **pwa-offline.spec.ts** - PWA features (manifest, service worker, offline mode)

Plus **reusable utilities** in `test-utils.ts` for maintainability.

**Run everything:**
```bash
npm run test:e2e -- customer-complete-validation search-result-ordering business-cta-validation pwa-offline
```

**Happy Testing! 🚀**
