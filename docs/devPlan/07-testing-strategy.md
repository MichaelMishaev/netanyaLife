# Testing Strategy & Structure

## Overview

**Philosophy**: Test during development, not after
**Location**: Dedicated `tests/` folder (NOT spread across project)
**Coverage Target**: 80%+ for critical paths
**Tools**: Vitest (unit/integration), Playwright (E2E), axe DevTools (accessibility)

---

## Folder Structure

```
tests/
├── unit/                           # Fast, isolated tests
│   ├── components/
│   │   ├── SearchForm.test.tsx
│   │   ├── FilterSheet.test.tsx
│   │   ├── BusinessCard.test.tsx
│   │   ├── ShareButton.test.tsx
│   │   ├── ReviewForm.test.tsx
│   │   ├── AddBusinessForm.test.tsx
│   │   ├── AccessibilityPanel.test.tsx
│   │   └── Rating.test.tsx
│   │
│   ├── lib/
│   │   ├── queries/
│   │   │   ├── getSearchResults.test.ts    # ⚠️ CRITICAL
│   │   │   ├── getBusiness.test.ts
│   │   │   └── getCategories.test.ts
│   │   │
│   │   ├── validations/
│   │   │   ├── business.test.ts            # ⚠️ CRITICAL (phone/whatsapp)
│   │   │   ├── review.test.ts
│   │   │   └── admin.test.ts
│   │   │
│   │   └── utils/
│   │       ├── ordering.test.ts            # ⚠️ CRITICAL (search ordering)
│   │       ├── slugify.test.ts
│   │       ├── security.test.ts            # IP hashing
│   │       └── formatting.test.ts
│   │
│   └── contexts/
│       ├── AccessibilityContext.test.tsx
│       ├── RecentlyViewedContext.test.tsx
│       └── AnalyticsContext.test.tsx
│
├── integration/                    # Multi-component tests
│   ├── search-flow.test.tsx        # Home → Search → Results
│   ├── business-detail.test.tsx    # Business page with all features
│   ├── review-submission.test.tsx  # Full review flow
│   ├── business-submission.test.tsx # Add business flow
│   ├── admin-approval.test.tsx     # Admin approve → appears in results
│   ├── filter-sort.test.tsx        # Filter sheet functionality
│   └── share-functionality.test.tsx # Share button flows
│
├── e2e/                            # Full user journeys (Playwright)
│   ├── specs/
│   │   ├── user-journey.spec.ts    # Complete user flow
│   │   ├── admin-journey.spec.ts   # Admin operations
│   │   ├── accessibility.spec.ts   # Keyboard nav, ARIA
│   │   ├── pwa.spec.ts             # PWA install, offline
│   │   ├── rtl-ltr.spec.ts         # Hebrew/Russian switching
│   │   └── mobile.spec.ts          # Mobile-specific tests
│   │
│   └── fixtures/
│       ├── test-data.ts            # Seed data for tests
│       └── test-users.ts           # Admin credentials
│
├── visual/                         # Visual regression tests
│   ├── snapshots/
│   │   ├── home-he.png
│   │   ├── home-ru.png
│   │   ├── results-he.png
│   │   └── business-detail-he.png
│   └── visual-regression.spec.ts
│
├── performance/                    # Performance tests
│   ├── lighthouse.config.js
│   ├── lighthouse-ci.yml
│   └── load-testing.spec.ts        # k6 or Artillery
│
├── fixtures/                       # Shared test data
│   ├── businesses.ts
│   ├── categories.ts
│   ├── neighborhoods.ts
│   └── reviews.ts
│
├── helpers/                        # Test utilities
│   ├── setup.ts                    # Global setup
│   ├── db-helpers.ts               # Database utilities
│   ├── render-helpers.tsx          # React Testing Library wrappers
│   └── api-mocks.ts                # MSW handlers
│
└── README.md                       # Testing documentation

vitest.config.ts                    # Vitest configuration
playwright.config.ts                # Playwright configuration
.playwright/                        # Playwright cache
coverage/                           # Coverage reports (gitignored)
```

---

## Configuration Files

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.{js,ts}',
        'app/api/',  // API routes tested with E2E
        '.next/',
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4700',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4700',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Critical Test Cases

### 1. Search Ordering Logic ⚠️ HIGHEST PRIORITY

**File**: `tests/unit/lib/utils/ordering.test.ts`

```typescript
import { describe, test, expect } from 'vitest'
import { orderSearchResults } from '@/lib/utils/ordering'

describe('Search Results Ordering', () => {
  test('should show pinned businesses first', () => {
    const businesses = [
      { id: '1', is_pinned: false, pinned_order: null, avgRating: 5, created_at: new Date() },
      { id: '2', is_pinned: true, pinned_order: 1, avgRating: 3, created_at: new Date() },
      { id: '3', is_pinned: true, pinned_order: 2, avgRating: 4, created_at: new Date() },
    ]

    const result = orderSearchResults(businesses, 4)

    expect(result[0].id).toBe('2') // pinned_order 1
    expect(result[1].id).toBe('3') // pinned_order 2
  })

  test('should respect topPinnedCount setting', () => {
    const businesses = [
      { id: '1', is_pinned: true, pinned_order: 1 },
      { id: '2', is_pinned: true, pinned_order: 2 },
      { id: '3', is_pinned: true, pinned_order: 3 },
      { id: '4', is_pinned: true, pinned_order: 4 },
      { id: '5', is_pinned: true, pinned_order: 5 },
    ]

    const result = orderSearchResults(businesses, 2) // Only show top 2

    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
    // Business 3, 4, 5 should be in random section
  })

  test('should randomize 5 businesses after top pinned', () => {
    const businesses = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      is_pinned: i < 2,
      pinned_order: i < 2 ? i + 1 : null,
      avgRating: 5,
      created_at: new Date(),
    }))

    const result1 = orderSearchResults(businesses, 2)
    const result2 = orderSearchResults(businesses, 2)

    // First 2 are always the same (pinned)
    expect(result1[0].id).toBe(result2[0].id)
    expect(result1[1].id).toBe(result2[1].id)

    // Next 5 should be random (very unlikely to be identical)
    const random1 = result1.slice(2, 7).map(b => b.id).join(',')
    const random2 = result2.slice(2, 7).map(b => b.id).join(',')
    expect(random1).not.toBe(random2) // May fail occasionally (1/120 chance)
  })

  test('should sort remaining by rating desc, then newest', () => {
    const oldDate = new Date('2024-01-01')
    const newDate = new Date('2024-12-01')

    const businesses = [
      { id: '1', is_pinned: false, avgRating: 3, created_at: newDate },
      { id: '2', is_pinned: false, avgRating: 5, created_at: oldDate },
      { id: '3', is_pinned: false, avgRating: 4, created_at: newDate },
    ]

    const result = orderSearchResults(businesses, 0)

    // Should be: 5-star first, then 4-star, then 3-star
    expect(result[0].id).toBe('2') // 5 rating
    expect(result[1].id).toBe('3') // 4 rating
    expect(result[2].id).toBe('1') // 3 rating
  })

  test('with 0 businesses, return empty array', () => {
    const result = orderSearchResults([], 4)
    expect(result).toEqual([])
  })

  test('with 1-4 businesses all pinned, show all in order', () => {
    const businesses = [
      { id: '1', is_pinned: true, pinned_order: 2 },
      { id: '2', is_pinned: true, pinned_order: 1 },
    ]

    const result = orderSearchResults(businesses, 4)

    expect(result.length).toBe(2)
    expect(result[0].id).toBe('2') // pinned_order 1
    expect(result[1].id).toBe('1') // pinned_order 2
  })
})
```

---

### 2. Phone/WhatsApp Validation ⚠️ CRITICAL

**File**: `tests/unit/lib/validations/business.test.ts`

```typescript
import { describe, test, expect } from 'vitest'
import { addBusinessSchema } from '@/lib/validations/business'

describe('Business Validation', () => {
  test('should pass with only phone', () => {
    const data = {
      name: 'Test Business',
      category_id: 'cat123',
      neighborhood_id: 'neigh123',
      phone: '+972501234567',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  test('should pass with only whatsapp_number', () => {
    const data = {
      name: 'Test Business',
      category_id: 'cat123',
      neighborhood_id: 'neigh123',
      whatsapp_number: '+972501234567',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  test('should pass with both phone and whatsapp_number', () => {
    const data = {
      name: 'Test Business',
      category_id: 'cat123',
      neighborhood_id: 'neigh123',
      phone: '+972501111111',
      whatsapp_number: '+972502222222',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  test('should fail with neither phone nor whatsapp_number', () => {
    const data = {
      name: 'Test Business',
      category_id: 'cat123',
      neighborhood_id: 'neigh123',
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe(
      'חובה למלא טלפון או מספר ווטסאפ אחד לפחות'
    )
  })

  test('should validate Israeli phone format', () => {
    const data = {
      name: 'Test',
      category_id: 'cat123',
      neighborhood_id: 'neigh123',
      phone: '0501234567', // Wrong format (missing +972)
    }

    const result = addBusinessSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
```

---

### 3. E2E User Journey

**File**: `tests/e2e/specs/user-journey.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('search → results → business detail → review', async ({ page }) => {
    // Home page
    await page.goto('/he')
    await expect(page.locator('h1')).toContainText('רק לתושבי נתניה')

    // Select category and neighborhood
    await page.click('text=בחרו סוג שירות')
    await page.click('text=חשמלאים')

    await page.click('text=בחרו שכונה')
    await page.click('text=צפון')

    // Search
    await page.click('button:has-text("חיפוש")')

    // Results page
    await expect(page).toHaveURL(/\/he\/netanya\/tsafon\/electricians/)
    await expect(page.locator('h1')).toContainText('תוצאות')

    // Verify result count is shown
    await expect(page.locator('h1')).toContainText('(')

    // Click first business card
    await page.click('.business-card >> nth=0 >> text=פרטים')

    // Business detail page
    await expect(page.locator('h1')).toBeVisible()

    // Verify conditional CTAs (WhatsApp only shows if exists)
    const whatsappBtn = page.locator('a[href^="https://wa.me/"]')
    if (await whatsappBtn.count() > 0) {
      expect(await whatsappBtn.getAttribute('href')).toContain('wa.me')
    }

    // Click "כתיבת חוות דעת"
    await page.click('text=כתיבת חוות דעת')

    // Review form
    await expect(page).toHaveURL(/\/review/)

    // Fill review
    await page.click('text=⭐ >> nth=3') // 4 stars
    await page.fill('textarea[name="comment"]', 'שירות מעולה!')
    await page.fill('input[name="author_name"]', 'יוסי')

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect back to business page
    await expect(page).toHaveURL(/\/he\/business\//)
    await expect(page.locator('text=שירות מעולה!')).toBeVisible()
  })

  test('add business flow', async ({ page }) => {
    await page.goto('/he/add-business')

    await page.fill('input[name="name"]', 'עסק בדיקה')
    await page.selectOption('select[name="category_id"]', { index: 1 })
    await page.selectOption('select[name="neighborhood_id"]', { index: 1 })
    await page.fill('input[name="phone"]', '+972501234567')

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/he/add-business/success')
    await expect(page.locator('text=נשלח בהצלחה')).toBeVisible()
  })

  test('validation: must have phone OR whatsapp', async ({ page }) => {
    await page.goto('/he/add-business')

    await page.fill('input[name="name"]', 'עסק ללא טלפון')
    await page.selectOption('select[name="category_id"]', { index: 1 })
    await page.selectOption('select[name="neighborhood_id"]', { index: 1 })
    // Don't fill phone or whatsapp

    await page.click('button[type="submit"]')

    await expect(page.locator('text=חובה למלא טלפון או מספר ווטסאפ')).toBeVisible()
  })
})
```

---

### 4. Accessibility Tests

**File**: `tests/e2e/specs/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Compliance', () => {
  test('home page should have no accessibility violations', async ({ page }) => {
    await page.goto('/he')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/he')

    // Tab to skip link
    await page.keyboard.press('Tab')
    const skipLink = page.locator('a:has-text("דלג לתוכן")')
    await expect(skipLink).toBeFocused()

    // Press Enter to skip
    await page.keyboard.press('Enter')

    // Should focus main content
    const main = page.locator('main')
    await expect(main).toBeFocused()
  })

  test('accessibility panel works', async ({ page }) => {
    await page.goto('/he')

    // Open accessibility panel
    await page.click('button[aria-label*="נגישות"]')

    // Change font size
    await page.click('text=A++')

    // Verify font size changed
    const html = page.locator('html')
    await expect(html).toHaveClass(/font-large/)

    // Close panel
    await page.click('text=סגור')

    // Font size should persist after page reload
    await page.reload()
    await expect(html).toHaveClass(/font-large/)
  })

  test('all form inputs have labels', async ({ page }) => {
    await page.goto('/he/add-business')

    const inputs = page.locator('input, select, textarea')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const label = page.locator(`label[for="${id}"]`)

      await expect(label).toBeVisible()
    }
  })
})
```

---

### 5. PWA Tests

**File**: `tests/e2e/specs/pwa.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('PWA Functionality', () => {
  test('manifest is valid', async ({ page }) => {
    await page.goto('/he')

    const manifest = await page.evaluate(() =>
      fetch('/manifest.json').then(r => r.json())
    )

    expect(manifest.name).toBe('Netanya Local – מדריך עסקים בנתניה')
    expect(manifest.short_name).toBe('NetanyaLocal')
    expect(manifest.lang).toBe('he')
    expect(manifest.dir).toBe('rtl')
    expect(manifest.display).toBe('standalone')
  })

  test('service worker registers', async ({ page }) => {
    await page.goto('/he')

    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        return !!registration
      }
      return false
    })

    expect(swRegistered).toBe(true)
  })

  test('offline fallback shows when offline', async ({ page, context }) => {
    await page.goto('/he')

    // Wait for service worker to be ready
    await page.waitForTimeout(2000)

    // Go offline
    await context.setOffline(true)

    // Try to navigate to a new page
    await page.goto('/he/netanya/tsafon/electricians')

    // Should show offline message
    await expect(page.locator('text=אין חיבור לאינטרנט')).toBeVisible()
  })
})
```

---

## Testing Workflow

### During Development (Per Component)

```bash
# Create component
$ touch components/client/MyComponent.tsx

# Create test file (IMMEDIATELY)
$ touch tests/unit/components/MyComponent.test.tsx

# Write test first (TDD approach)
# Then implement component
# Run tests
$ npm test MyComponent
```

### Before Committing

```bash
# Run all unit tests
$ npm test

# Run linter
$ npm run lint

# Check types
$ npm run type-check

# If all pass, commit
$ git commit -m "feat: add MyComponent with tests"
```

### Before Merging to Main

```bash
# Run full test suite
$ npm run test:all

# Run E2E tests
$ npm run test:e2e

# Run accessibility audit
$ npm run test:a11y

# Check coverage
$ npm run test:coverage

# All must pass before merge
```

### CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Coverage Requirements

### By Category

| Category | Target | Critical Paths Target |
|----------|--------|----------------------|
| Core Logic (ordering, validation) | 100% | 100% |
| API Endpoints/Server Actions | 90% | 100% |
| Components (server) | 80% | - |
| Components (client) | 80% | - |
| Utilities | 90% | - |
| Overall | 80% | - |

### Critical Paths (Must be 100%)

1. ✅ Search ordering logic
2. ✅ Phone/WhatsApp validation
3. ✅ Admin authentication
4. ✅ Business approval workflow
5. ✅ Review submission
6. ✅ PWA service worker caching
7. ✅ Rate limiting

---

## Test Data Management

### Fixtures

**File**: `tests/fixtures/businesses.ts`

```typescript
export const mockBusinesses = [
  {
    id: 'bus1',
    name_he: 'יוסי החשמלאי',
    name_ru: 'Йоси Электрик',
    slug_he: 'yossi-electrician',
    slug_ru: 'yosi-elektrik',
    phone: '+972501234567',
    whatsapp_number: '+972501234567',
    is_visible: true,
    is_verified: true,
    is_pinned: true,
    pinned_order: 1,
    avgRating: 4.5,
    reviewCount: 12,
  },
  // ... more mock data
]
```

### Database Helpers

**File**: `tests/helpers/db-helpers.ts`

```typescript
import { prisma } from '@/lib/prisma'

export async function seedTestData() {
  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.business.deleteMany()
  await prisma.category.deleteMany()
  await prisma.neighborhood.deleteMany()
  await prisma.city.deleteMany()

  // Seed test data
  const city = await prisma.city.create({
    data: { name_he: 'נתניה', name_ru: 'Нетания', slug: 'netanya' },
  })

  // ... seed more data
}

export async function cleanupTestData() {
  await prisma.$executeRaw`TRUNCATE TABLE businesses, reviews, categories, neighborhoods, cities CASCADE`
}
```

---

## Performance Testing

### Lighthouse CI

**File**: `tests/performance/lighthouse.config.js`

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4700/he',
        'http://localhost:4700/he/netanya/tsafon/electricians',
        'http://localhost:4700/he/business/test-business',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 1.0 }],
      },
    },
  },
}
```

---

## Visual Regression Testing

**File**: `tests/visual/visual-regression.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('home page (HE) matches snapshot', async ({ page }) => {
    await page.goto('/he')
    await expect(page).toHaveScreenshot('home-he.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('business card looks correct', async ({ page }) => {
    await page.goto('/he/netanya/tsafon/electricians')
    const card = page.locator('.business-card').first()
    await expect(card).toHaveScreenshot('business-card.png')
  })
})
```

---

## Testing Commands (package.json)

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "playwright test tests/e2e/specs/accessibility.spec.ts",
    "test:pwa": "playwright test tests/e2e/specs/pwa.spec.ts",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "lighthouse": "lhci autorun",
    "test:visual": "playwright test tests/visual --update-snapshots"
  }
}
```

---

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good
test('should show error when phone and whatsapp are missing', () => {})

// ❌ Bad
test('test1', () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
test('should order results correctly', () => {
  // Arrange
  const businesses = createMockBusinesses()
  const topPinnedCount = 4

  // Act
  const result = orderSearchResults(businesses, topPinnedCount)

  // Assert
  expect(result[0].is_pinned).toBe(true)
})
```

### 3. Don't Test Implementation Details

```typescript
// ✅ Good - Test behavior
test('search form submits on button click', async () => {
  render(<SearchForm />)
  fireEvent.click(screen.getByText('חיפוש'))
  expect(mockRouter.push).toHaveBeenCalled()
})

// ❌ Bad - Test implementation
test('useState is called', () => {
  // Don't test React internals
})
```

### 4. Isolate Tests

```typescript
// ✅ Good - Each test is independent
beforeEach(() => {
  mockReset()
})

// ❌ Bad - Tests depend on each other
let sharedState
test('test 1', () => { sharedState = 'foo' })
test('test 2', () => { expect(sharedState).toBe('foo') })
```

---

## Debugging Failed Tests

### Unit Tests

```bash
# Run single test file
$ npm test SearchForm

# Run with debugging
$ node --inspect-brk ./node_modules/.bin/vitest run SearchForm

# Show console.logs
$ npm test -- --reporter=verbose
```

### E2E Tests

```bash
# Run in headed mode (see browser)
$ npm run test:e2e -- --headed

# Debug specific test
$ npm run test:e2e -- --debug user-journey.spec.ts

# Run with UI mode
$ npm run test:e2e:ui
```

---

## Documentation

### tests/README.md

```markdown
# Testing Guide

## Quick Start

1. Run all tests: `npm test`
2. Run E2E tests: `npm run test:e2e`
3. Check coverage: `npm run test:coverage`

## Writing Tests

- Create tests in `tests/` folder (NOT next to components)
- Write tests as you develop (TDD approach)
- Aim for 80%+ coverage
- Test behavior, not implementation

## Critical Tests

- Search ordering logic: `tests/unit/lib/utils/ordering.test.ts`
- Phone/WhatsApp validation: `tests/unit/lib/validations/business.test.ts`

## Resources

- Vitest: https://vitest.dev
- Playwright: https://playwright.dev
- Testing Library: https://testing-library.com
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Related**: 05-component-architecture-UPDATED.md, 06-implementation-priorities.md
