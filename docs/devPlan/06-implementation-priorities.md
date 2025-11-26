# Implementation Priorities & Dependencies (V2.0)

## Overview

This document provides a prioritized task list with dependencies, critical paths, and risk mitigation strategies. Use this as your daily execution guide.

**Version 2.0 Updates**:
- ✅ Added "כל נתניה" dropdown option
- ✅ Complete FilterSheet specification
- ✅ Business card description preview
- ✅ ShareButton with WhatsApp/Copy
- ✅ ResultsHeader with back button and count
- ✅ Breadcrumb navigation
- ✅ Recently Viewed tracking
- ✅ Print stylesheet
- ✅ Social media meta tags
- ✅ Dedicated testing structure

---

## Critical Path Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                        CRITICAL PATH                             │
│  (These tasks MUST be completed in order)                       │
└─────────────────────────────────────────────────────────────────┘

Week 1: Setup (Phase 0)
  └─> Database Schema
      └─> Seed Data
          └─> i18n Configuration
              └─> Base Layout
                  └─> Testing Structure Setup (NEW)

Week 2-3: Core Client (Phase 1)
  └─> Home Page (with "כל נתניה" option)
      └─> Search Results (CRITICAL: Ordering logic + FilterSheet)
          └─> Business Detail (with Share + Breadcrumbs)
              └─> Review Submission

Week 4: Accessibility (Phase 2)
  └─> Accessibility Panel
      └─> Recently Viewed (NEW)
      └─> PWA Configuration

Week 5-6: Admin (Phase 3)
  └─> Admin Auth
      └─> Business Management
          └─> Pending Approvals

Week 7: Analytics (Phase 4)
  └─> Event Tracking
      └─> Admin Dashboard
      └─> Social Meta Tags (NEW)

Week 8: Polish (Phase 5)
  └─> Testing & Optimization
      └─> Print Stylesheet (NEW)
```

---

## Week-by-Week Implementation Plan (Updated)

### Week 1: Foundation (Phase 0)

#### Day 1: Project Initialization + Testing Setup
**Tasks**:
- [ ] Create Next.js project
- [ ] Install dependencies (see `01-tech-stack.md`)
- [ ] Set up Git repository
- [ ] Connect Vercel project
- [ ] **NEW**: Create `tests/` folder structure
- [ ] **NEW**: Configure `vitest.config.ts`
- [ ] **NEW**: Configure `playwright.config.ts`
- [ ] **NEW**: Create test helpers and fixtures folders

**Testing Setup**:
```bash
mkdir -p tests/{unit,integration,e2e/specs,visual,performance,fixtures,helpers}
mkdir -p tests/unit/{components,lib/queries,lib/validations,lib/utils,contexts}
```

**Validation**:
- Project runs locally on `localhost:4700`
- Vercel preview URL works
- `npm test` runs successfully (even with 0 tests)
- Playwright installed: `npx playwright install`

---

#### Day 2: Database Setup
**Tasks**:
- [ ] Create Prisma schema (copy from `02-database-schema.md`)
- [ ] Set up Vercel Postgres (or Supabase)
- [ ] Run initial migration: `npx prisma migrate dev --name init`
- [ ] Verify in Prisma Studio: `npx prisma studio`

**Validation**:
- All tables created
- No migration errors

---

#### Day 3: Seed Data
**Tasks**:
- [ ] Create seed script (`prisma/seed.ts`)
- [ ] Seed city (נתניה)
- [ ] Seed 4 neighborhoods (מרכז, צפון, דרום, מזרח העיר)
- [ ] Seed 10+ categories
- [ ] Seed admin user (with hashed password)
- [ ] Seed admin settings (top_pinned_count = 4)
- [ ] **NEW**: Create test fixtures from seed data for tests

**Validation**:
- Prisma Studio shows all seed data
- Categories and neighborhoods appear in dropdowns

---

#### Day 4: Redis & i18n
**Tasks**:
- [ ] Set up Upstash Redis account
- [ ] Create Redis client (`lib/redis.ts`)
- [ ] Test Redis connection (set/get)
- [ ] Configure next-intl
- [ ] Create `middleware.ts` for locale routing
- [ ] Create `messages/he.json` and `messages/ru.json`
- [ ] **NEW**: Add translations for new V2.0 components
- [ ] Test `/he` and `/ru` routes

**New Translations** (add to `messages/he.json`):
```json
{
  "home": {
    "search": {
      "allNetanya": "כל נתניה"
    }
  },
  "filters": {
    "title": "פילטרים ומיון",
    "sortBy": "מיון לפי",
    "sort": {
      "recommended": "מומלץ",
      "rating": "דירוג",
      "newest": "חדשים"
    }
  },
  "share": {
    "shareButton": "שיתוף",
    "shareWhatsApp": "שיתוף ב-WhatsApp",
    "copyLink": "העתק קישור"
  },
  "results": {
    "back": "חזור",
    "results": "תוצאות"
  }
}
```

**Validation**:
- `/he` loads with Hebrew content (RTL)
- `/ru` loads with Russian content (LTR)
- Language switcher works

---

#### Day 5: Base Layout & Styling
**Tasks**:
- [ ] Configure Tailwind for RTL
- [ ] Add Heebo font
- [ ] Create root layout with AccessibilityProvider
- [ ] **NEW**: Add RecentlyViewedProvider to layout
- [ ] Create header with logo + language switcher
- [ ] Create footer
- [ ] Add skip link ("דלג לתוכן")
- [ ] Test in both HE and RU

**Validation**:
- RTL layout works in Hebrew
- LTR layout works in Russian
- Skip link appears on tab focus

---

### Week 2-3: Core Client Pages (Phase 1)

#### Days 6-7: Home Page (UPDATED)
**Tasks**:
- [ ] Create `HeroSection` component
- [ ] Create `SearchForm` client component
  - [ ] Category dropdown (Headless UI Listbox)
  - [ ] Neighborhood dropdown
  - [ ] **NEW**: Add "כל נתניה" as first option in neighborhoods
  - [ ] Validation: both required
- [ ] Create `PopularCategories` component
- [ ] Create `NeighborhoodGrid` component
- [ ] Fetch categories and neighborhoods (Server Component)
- [ ] Test search submission (redirects to results page)
- [ ] **NEW**: Write unit test for SearchForm

**New Feature Details**:
```typescript
// "כל נתניה" option
const neighborhoodsWithAll = [
  { id: 'all-netanya', name: t('allNetanya'), slug: 'all' },
  ...neighborhoods,
]
```

**Testing** (create `tests/unit/components/SearchForm.test.tsx`):
- [ ] Search button disabled without selections
- [ ] "כל נתניה" option present and selectable
- [ ] Redirects to correct URL on submit

**Validation**:
- Home page loads in <2 seconds
- Search requires both category + neighborhood
- "כל נתניה" appears as first dropdown option (bold)
- Clicking popular category navigates to results
- Clicking neighborhood navigates to results
- **NEW**: SearchForm tests pass

**Critical**: Test with BOTH Hebrew and Russian content

---

#### Days 8-10: Search Results Page (UPDATED) ⚠️ CRITICAL
**Tasks**:
- [ ] Create dynamic route: `app/[locale]/netanya/[neighborhood]/[category]/page.tsx`
- [ ] Implement `getSearchResults` query (see `04-api-endpoints.md`)
- [ ] **CRITICAL**: Implement ordering logic:
  - [ ] Separate pinned from regular businesses
  - [ ] Get top X pinned (from admin settings)
  - [ ] Random 5 from remaining
  - [ ] Rest sorted by rating DESC, then newest
- [ ] **NEW**: Create `ResultsHeader` component
  - [ ] Back button with router.back()
  - [ ] Title with result count: "{category} ב{neighborhood} ({count} תוצאות)"
  - [ ] Filter/Sort button
- [ ] Create `BusinessCard` component (UPDATED)
  - [ ] **NEW**: Add description preview (100 chars, truncated)
  - [ ] Conditional rendering: WhatsApp button (only if whatsapp_number exists)
  - [ ] Conditional rendering: Call button (only if phone exists)
  - [ ] Show rating or "היו הראשונים לדרג"
- [ ] Create `NoResults` component with "search all city" button
- [ ] **NEW**: Create complete `FilterSheet` component
  - [ ] Sort options: Recommended / Rating / Newest
  - [ ] Category filter dropdown
  - [ ] Neighborhood filter buttons (including "כל נתניה")
  - [ ] Reset and Apply actions
- [ ] Track search event (analytics)
- [ ] **NEW**: Write unit tests for ordering logic

**Testing** (create `tests/unit/lib/utils/ordering.test.ts`):
```typescript
describe('Search Results Ordering', () => {
  test('should show pinned businesses first')
  test('should respect topPinnedCount setting')
  test('should randomize 5 businesses after top pinned')
  test('should sort remaining by rating desc, then newest')
  test('with 0 businesses, return empty array')
})
```

**Validation**:
- [ ] Results show in correct order (pinned first, then random 5, then rest)
- [ ] Top X count matches admin setting (default 4)
- [ ] Random 5 changes on page refresh
- [ ] **NEW**: Back button returns to previous page
- [ ] **NEW**: Result count displays correctly
- [ ] **NEW**: Business cards show description preview (if exists)
- [ ] Business cards show correct CTAs (no WhatsApp button if no whatsapp_number)
- [ ] No results flow works (shows button, redirects to all neighborhoods)
- [ ] **NEW**: FilterSheet opens and filters/sorts correctly
- [ ] Rating calculation is accurate
- [ ] Verified badge shows for verified businesses
- [ ] **NEW**: All ordering tests pass (100% coverage required)

**Testing Checklist**:
- [ ] Create 10 test businesses in DB
- [ ] Mark 4 as pinned with pinned_order 1-4
- [ ] Verify first 4 results are those exact businesses in that order
- [ ] Verify next 5 are random (refresh page, order changes)
- [ ] Verify rest are sorted by rating
- [ ] **NEW**: Test FilterSheet sort options change order
- [ ] **NEW**: Test FilterSheet filter options re-filter results

**Risk Mitigation**:
- Write unit test for ordering logic before implementing
- Console.log each step of ordering to debug
- Use Prisma Studio to verify business flags

---

#### Days 11-12: Business Detail Page (UPDATED)
**Tasks**:
- [ ] Create `app/[locale]/business/[slug]/page.tsx`
- [ ] Implement `getBusiness` query
- [ ] **NEW**: Add `generateMetadata` with Open Graph and Twitter Cards
- [ ] **NEW**: Create `Breadcrumbs` component
- [ ] Create `BusinessDetail` component
  - [ ] **NEW**: Breadcrumbs at top
  - [ ] Header (name, category, neighborhood, rating)
  - [ ] **NEW**: ShareButton component
  - [ ] CTA grid (2x2 on mobile)
    - [ ] WhatsApp (only if whatsapp_number)
    - [ ] Call (only if phone)
    - [ ] Directions (only if address)
    - [ ] Website (only if website_url)
  - [ ] Info section (description, address, opening hours) - **conditional**
  - [ ] Reviews list
- [ ] **NEW**: Create `ShareButton` component
  - [ ] WhatsApp share with attribution
  - [ ] Copy link with attribution
  - [ ] Web Share API (native mobile)
  - [ ] Custom dialog fallback
- [ ] Create `ReviewsList` component
- [ ] Add structured data (LocalBusiness schema)
- [ ] Track business_viewed event
- [ ] **NEW**: Track to Recently Viewed (localStorage)

**ShareButton Attribution Text**:
```
🏙️ {Business Name}
{Category} • {Neighborhood}

✨ נמצא ב-קהילת נתניה - מדריך העסקים של נתניה
{URL}
```

**Social Meta Tags** (in generateMetadata):
```typescript
openGraph: {
  type: 'business.business',
  locale: 'he_IL',
  title: '...',
  description: '...',
  images: [{ url: '...', width: 1200, height: 630 }],
}
twitter: {
  card: 'summary_large_image',
  title: '...',
  images: ['...'],
}
```

**Validation**:
- [ ] All conditional fields work correctly (hide section if no data)
- [ ] CTA buttons only show if data exists
- [ ] **NEW**: Breadcrumbs show correct path
- [ ] **NEW**: ShareButton opens WhatsApp with correct text
- [ ] **NEW**: ShareButton copy includes attribution
- [ ] **NEW**: Web Share API works on mobile
- [ ] Clicking WhatsApp opens wa.me link
- [ ] Clicking Call opens tel: link
- [ ] Clicking Directions opens Google Maps
- [ ] Reviews show in reverse chronological order
- [ ] Average rating calculated correctly
- [ ] **NEW**: Facebook debugger shows correct OG tags
- [ ] **NEW**: Twitter Card Validator shows correct card
- [ ] Google Rich Results Test passes for structured data
- [ ] **NEW**: Business added to Recently Viewed list

---

#### Days 13-14: Review Submission
**Tasks**:
- [ ] Create `app/[locale]/business/[slug]/review/page.tsx`
- [ ] Create `ReviewForm` client component (React Hook Form + Zod)
  - [ ] Star rating selector (1-5)
  - [ ] Comment textarea (optional)
  - [ ] Name input (optional)
- [ ] Create `submitReview` server action
  - [ ] Validation
  - [ ] Rate limiting (5 per hour per IP)
  - [ ] Save to reviews table (with correct comment_he/comment_ru)
  - [ ] Track event
  - [ ] Revalidate business page
- [ ] Success state (redirect to business page)
- [ ] Error handling
- [ ] **NEW**: Write integration test for review flow

**Testing** (create `tests/integration/review-submission.test.tsx`):
- [ ] Can submit review with just rating
- [ ] Can submit with rating + comment
- [ ] Rate limiting works

**Validation**:
- [ ] Can submit review with just rating
- [ ] Can submit review with rating + comment
- [ ] Anonymous reviews work (no name provided)
- [ ] Rate limiting works (try 6 submissions in 1 hour)
- [ ] Review appears on business page immediately
- [ ] Average rating updates
- [ ] **NEW**: Integration tests pass

---

#### Days 15-16: Add Business Form
**Tasks**:
- [ ] Create `app/[locale]/add-business/page.tsx`
- [ ] Create `AddBusinessForm` client component (React Hook Form + Zod)
  - [ ] All fields from `sysAnal.md:143-161`
  - [ ] **CRITICAL**: Validation: must have phone OR whatsapp_number
  - [ ] Error message: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות"
- [ ] Create `submitBusiness` server action
  - [ ] Validation with Zod refine
  - [ ] Rate limiting (3 per day per IP)
  - [ ] Save to pending_businesses
  - [ ] Track event
- [ ] Create success page
- [ ] Error handling
- [ ] **NEW**: Write unit tests for validation

**Testing** (create `tests/unit/lib/validations/business.test.ts`):
```typescript
test('should pass with only phone')
test('should pass with only whatsapp_number')
test('should pass with both')
test('should fail with neither')
```

**Validation**:
- [ ] Form validation works (required fields)
- [ ] **CRITICAL**: Cannot submit without phone OR whatsapp
- [ ] Error shows on correct field if both missing
- [ ] Submission creates pending_business record
- [ ] Rate limiting works (try 4 submissions in 1 day)
- [ ] Success page shows confirmation
- [ ] **NEW**: Validation tests pass (100% coverage)

---

### Week 4: Accessibility & PWA (Phase 2)

#### Days 17-18: Accessibility Panel
**Tasks**:
- [ ] Create `AccessibilityContext` (font size, contrast, underline links)
- [ ] Create `AccessibilityButton` (fixed bottom-right)
- [ ] Create `AccessibilityPanel` (Dialog with Headless UI)
  - [ ] Font size toggle (Normal / Medium / Large)
  - [ ] High contrast toggle
  - [ ] Underline links toggle
- [ ] Add global CSS for accessibility classes
- [ ] Persist settings in localStorage
- [ ] Track accessibility events

**Validation**:
- [ ] Panel opens on button click
- [ ] Font size changes apply immediately
- [ ] High contrast mode works (dark text, white bg, strong outlines)
- [ ] Underline links works
- [ ] Settings persist across page reloads
- [ ] Settings persist across sessions

---

#### Days 19-20: Recently Viewed + Semantic HTML (UPDATED)
**Tasks**:
- [ ] **NEW**: Create `RecentlyViewedContext`
  - [ ] Track last 10 businesses
  - [ ] Store in localStorage
  - [ ] Timestamp tracking
- [ ] **NEW**: Create `RecentlyViewed` component
  - [ ] Horizontal scroll carousel
  - [ ] Clear history button
- [ ] **NEW**: Add to home page (if has history)
- [ ] Audit all pages for semantic HTML
  - [ ] Replace divs with main, header, nav, footer, button
- [ ] Add aria-labels to all icon buttons
- [ ] Add labels to all form inputs (with htmlFor)
- [ ] Ensure logical tab order
- [ ] Add focus-visible styles (never remove outlines!)
- [ ] Run axe DevTools on all pages
- [ ] **NEW**: Write accessibility E2E tests

**Testing** (create `tests/e2e/specs/accessibility.spec.ts`):
```typescript
test('home page should have no accessibility violations')
test('keyboard navigation works')
test('all form inputs have labels')
```

**Validation**:
- [ ] **NEW**: Recently Viewed appears on home page with history
- [ ] **NEW**: Clicking recently viewed business navigates correctly
- [ ] **NEW**: Clear history removes all items
- [ ] axe DevTools: 0 critical issues
- [ ] Can navigate entire site with keyboard only
- [ ] Tab order is logical
- [ ] All buttons have visible focus states
- [ ] Screen reader test (NVDA or VoiceOver)
- [ ] **NEW**: Accessibility E2E tests pass

---

#### Day 21: PWA Configuration
**Tasks**:
- [ ] Install next-pwa
- [ ] Configure `next.config.js` with caching strategies
- [ ] Create `public/manifest.json`
- [ ] Add PWA meta tags to layout
- [ ] Create offline fallback page
- [ ] Test PWA install on iOS Safari and Android Chrome
- [ ] Track pwa_installed event
- [ ] **NEW**: Write PWA E2E tests

**Testing** (create `tests/e2e/specs/pwa.spec.ts`):
```typescript
test('manifest is valid')
test('service worker registers')
test('offline fallback shows when offline')
```

**Validation**:
- [ ] PWA installs on iOS Safari
- [ ] PWA installs on Android Chrome
- [ ] Offline mode shows fallback page (turn off wifi, reload)
- [ ] Service worker caches static assets
- [ ] Google Maps, WhatsApp links never cached (NetworkOnly)
- [ ] **NEW**: PWA E2E tests pass

---

### Week 5-6: Admin Panel (Phase 3)

#### Days 22-23: Admin Authentication
**Tasks**:
- [ ] Configure NextAuth (see `04-api-endpoints.md`)
- [ ] Create `app/admin/login/page.tsx`
- [ ] Create login form (email + password)
- [ ] Create `auth.ts` with Credentials provider
- [ ] **MVP**: Hardcoded check (email === "345287@gmail.com" && password === "admin1")
- [ ] **Production**: Hash password, store in DB
- [ ] Create `app/admin/layout.tsx` with auth check
- [ ] Create admin sidebar navigation

**Validation**:
- [ ] Can log in with correct credentials
- [ ] Cannot log in with incorrect credentials
- [ ] Cannot access /admin pages without login
- [ ] After login, redirected to /admin dashboard

---

#### Days 24-26: Business Management
**Tasks**:
- [ ] Create `app/admin/businesses/page.tsx`
- [ ] Create `BusinessTable` component
  - [ ] Show all businesses (paginated)
  - [ ] Columns: Name, Category, Neighborhood, IsVisible, IsVerified, IsPinned, CreatedAt
- [ ] Create server actions:
  - [ ] `toggleVisible`
  - [ ] `toggleVerified`
  - [ ] `togglePinned` (assign pinned_order automatically)
  - [ ] `deleteBusiness` (soft delete)
- [ ] Create edit business page
- [ ] Test all actions

**Validation**:
- [ ] Toggle visible: business disappears from search results
- [ ] Toggle verified: "מאומת" badge appears on business card
- [ ] Toggle pinned: business moves to top X in search results
- [ ] Pinned order is automatically assigned
- [ ] Soft delete: business not shown but still in DB

---

#### Days 27-28: Pending Business Approvals
**Tasks**:
- [ ] Create `app/admin/pending/page.tsx`
- [ ] Create `PendingTable` component
  - [ ] Show all pending businesses
  - [ ] Columns: Name, Category, Neighborhood, Phone/WhatsApp, Submitted At
- [ ] Create server actions:
  - [ ] `approveBusiness` (create new business, update pending status)
  - [ ] `rejectBusiness` (update status, add admin notes)
- [ ] Test approval flow
- [ ] **NEW**: Write integration test for admin approval flow

**Testing** (create `tests/integration/admin-approval.test.tsx`):
- [ ] Approve creates business
- [ ] Reject doesn't create business
- [ ] Approved business appears in search

**Validation**:
- [ ] Approve creates new business in businesses table
- [ ] Approved business is visible in search results (if is_visible = true)
- [ ] Reject updates status but doesn't create business
- [ ] Pending list shows badge count in sidebar
- [ ] **NEW**: Integration tests pass

---

#### Days 29-30: Category & Neighborhood Management
**Tasks**:
- [ ] Create `app/admin/categories/page.tsx`
  - [ ] CRUD operations (create, update, delete)
  - [ ] Toggle active/inactive
  - [ ] Mark as popular
- [ ] Create `app/admin/neighborhoods/page.tsx`
  - [ ] CRUD operations
  - [ ] Toggle active/inactive
- [ ] Invalidate Redis cache on updates

**Validation**:
- [ ] Creating category: appears in search dropdown
- [ ] Deactivating category: removed from dropdown but existing businesses still work
- [ ] Popular category: appears in "Popular Categories" section
- [ ] Redis cache invalidates on update (verify in Redis)

---

#### Day 31: Admin Settings
**Tasks**:
- [ ] Create `app/admin/settings/page.tsx`
- [ ] Add setting: Top Pinned Count (default 4)
- [ ] Create `updateSetting` server action
- [ ] Test updating setting

**Validation**:
- [ ] Changing top pinned count affects search results
- [ ] If set to 2, only first 2 pinned businesses show in "Top X" section

---

### Week 7: Analytics & SEO (Phase 4)

#### Days 32-33: Event Tracking
**Tasks**:
- [ ] Create `app/api/events/route.ts`
- [ ] Create `AnalyticsContext` with `trackEvent` method
- [ ] Add tracking to all key actions:
  - [ ] Search performed (on search submit)
  - [ ] Business viewed (on business detail mount)
  - [ ] CTA clicked (on WhatsApp/Call/Directions/Website click)
  - [ ] Review submitted
  - [ ] Business submitted
  - [ ] PWA installed
  - [ ] Accessibility opened
  - [ ] Font/contrast changed
  - [ ] **NEW**: Share button clicked
  - [ ] **NEW**: Recently viewed clicked
- [ ] Rate limit events endpoint (100 per minute per IP)

**Validation**:
- [ ] Events saved to database
- [ ] Prisma Studio shows events with correct type and properties
- [ ] Rate limiting works
- [ ] **NEW**: Share events tracked with correct properties

---

#### Days 34-35: SEO & Structured Data (UPDATED)
**Tasks**:
- [ ] Add LocalBusiness schema to business detail pages
- [ ] **NEW**: Add Open Graph tags (already done in Day 11-12)
- [ ] **NEW**: Add Twitter Cards (already done in Day 11-12)
- [ ] Add hreflang tags for HE/RU versions
- [ ] Create sitemap.ts (dynamic sitemap)
- [ ] Create robots.ts
- [ ] Add meta descriptions to all pages
- [ ] **NEW**: Create default OG image (1200x630px)
- [ ] Test with Google Rich Results Test
- [ ] **NEW**: Test with Facebook Debugger
- [ ] **NEW**: Test with Twitter Card Validator

**Validation**:
- [ ] Google Rich Results Test passes
- [ ] **NEW**: Facebook Debugger shows correct preview
- [ ] **NEW**: Twitter Card Validator shows correct card
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Robots.txt accessible at /robots.txt
- [ ] hreflang tags present on all pages
- [ ] **NEW**: Default OG image loads correctly

---

#### Days 36-37: Admin Analytics Dashboard
**Tasks**:
- [ ] Create `app/admin/analytics/page.tsx`
- [ ] Create queries for analytics data (see `04-api-endpoints.md`)
  - [ ] Top categories (last 7 days)
  - [ ] Top neighborhoods
  - [ ] Total searches, views, reviews
  - [ ] CTA distribution
  - [ ] Language distribution
  - [ ] Accessibility usage
  - [ ] **NEW**: Share button usage
  - [ ] **NEW**: Recently viewed usage
- [ ] Create simple charts (can use Chart.js or Recharts)
- [ ] Add date range filter

**Validation**:
- [ ] Dashboard shows correct data
- [ ] Date range filter works
- [ ] Charts render correctly
- [ ] **NEW**: Share events show in analytics

---

### Week 8: Polish & Launch (Phase 5)

#### Days 38-40: Performance Optimization (UPDATED)
**Tasks**:
- [ ] Run Lighthouse on all pages
- [ ] Optimize images (use Next.js Image component)
- [ ] Lazy load below-fold components
- [ ] Add loading skeletons
- [ ] Analyze bundle size (next/bundle-analyzer)
- [ ] **NEW**: Add print stylesheet to globals.css
- [ ] Fix any performance issues

**Print Stylesheet** (add to `app/globals.css`):
```css
@media print {
  header, footer, nav, .accessibility-button, .share-button {
    display: none !important;
  }
  .business-detail:after {
    content: "מקור: קהילת נתניה - netanyalocal.com";
  }
}
```

**Target**:
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 100
- [ ] Lighthouse Best Practices: 100
- [ ] Lighthouse SEO: 100
- [ ] **NEW**: Print layout looks professional

---

#### Days 41-42: Cross-Browser Testing
**Tasks**:
- [ ] Test on Chrome (desktop + mobile)
- [ ] Test on Safari (desktop + iOS)
- [ ] Test on Firefox
- [ ] Test on Edge
- [ ] Fix any browser-specific issues
- [ ] **NEW**: Run visual regression tests

**Testing** (create `tests/visual/visual-regression.spec.ts`):
```typescript
test('home page (HE) matches snapshot')
test('business card looks correct')
```

**Checklist**:
- [ ] RTL/LTR switching works
- [ ] Accessibility panel works
- [ ] PWA installs
- [ ] All forms submit correctly
- [ ] Search flow works end-to-end
- [ ] **NEW**: ShareButton works on all browsers
- [ ] **NEW**: Recently Viewed persists
- [ ] **NEW**: Visual regression tests pass

---

#### Days 43-44: Security Audit
**Tasks**:
- [ ] Review all environment variables (not exposed to client)
- [ ] Hash admin password (bcrypt)
- [ ] Verify rate limiting on all public endpoints
- [ ] Verify CSRF protection (NextAuth default)
- [ ] Verify no SQL injection vulnerabilities (Prisma handles this)
- [ ] Verify no XSS vulnerabilities (React escapes by default)
- [ ] Add security headers (Vercel does this by default, but verify)

**Validation**:
- [ ] No secrets in client-side code
- [ ] Admin password is hashed
- [ ] Rate limiting works on all endpoints
- [ ] HTTPS enforced

---

#### Days 45-46: Final Testing & Bug Fixes (UPDATED)
**Tasks**:
- [ ] E2E test full user journey:
  - [ ] Home → Search → Results → Business Detail → Review
  - [ ] Home → Add Business → Success
  - [ ] **NEW**: Test FilterSheet functionality
  - [ ] **NEW**: Test ShareButton flows
  - [ ] **NEW**: Test Recently Viewed
- [ ] E2E test admin journey:
  - [ ] Login → Approve Business → Edit Business → Toggle Flags
- [ ] Fix any remaining bugs
- [ ] Test with real data (not seed data)
- [ ] **NEW**: Run full test suite (unit + integration + E2E)
- [ ] **NEW**: Check test coverage (80%+ required)

**Full Test Suite**:
```bash
npm run test:all  # Runs unit, integration, E2E
npm run test:coverage  # Check coverage
npm run lighthouse  # Run Lighthouse CI
```

**Validation**:
- [ ] All E2E tests pass
- [ ] **NEW**: Test coverage ≥ 80%
- [ ] **NEW**: Critical paths have 100% coverage
- [ ] No console errors
- [ ] No broken links

---

#### Day 47: Launch 🚀
**Tasks**:
- [ ] Final deployment to Vercel
- [ ] Verify production environment variables
- [ ] Test production URL
- [ ] Monitor Vercel logs for errors
- [ ] **NEW**: Set up error tracking (Sentry)
- [ ] Announce launch!

---

## Updated Priority Matrix (V2.0)

### P0 - Must Have (MVP Blockers)

| Task | V2.0 Updates | Risk | Phase |
|------|--------------|------|-------|
| Database schema & migrations | - | Low | 0 |
| Testing structure setup | **NEW** | Low | 0 |
| Seed data | - | Low | 0 |
| i18n routing setup | - | Medium | 0 |
| Home page with search | + "כל נתניה" option | Low | 1 |
| Search results with ordering | + FilterSheet, ResultsHeader, description | **High** | 1 |
| Business detail page | + ShareButton, Breadcrumbs, OG tags | Low | 1 |
| Review submission | - | Low | 1 |
| Add business form | - | Low | 1 |
| Admin login | - | Low | 3 |
| Pending business approval | - | Low | 3 |
| Admin business management | - | Low | 3 |

### P1 - Should Have (Post-MVP Priority)

| Task | V2.0 Updates | Risk | Phase |
|------|--------------|------|-------|
| Accessibility panel | - | Low | 2 |
| Recently Viewed | **NEW** | Low | 2 |
| PWA configuration | - | Medium | 2 |
| Category management | - | Low | 3 |
| Neighborhood management | - | Low | 3 |
| Event tracking | + Share events | Low | 4 |
| Structured data (SEO) | + OG tags, Twitter Cards | Low | 4 |

### P2 - Nice to Have (Phase 6+)

| Task | V2.0 Updates | Risk | Phase |
|------|--------------|------|-------|
| Admin analytics dashboard | + Share/Recently Viewed stats | Low | 4 |
| Print stylesheet | **NEW** | Low | 5 |
| Sitemap generation | - | Low | 4 |
| Visual regression tests | **NEW** | Low | 5 |

---

## Testing Requirements (NEW)

### Unit Tests (Write During Development)

**Critical Coverage (100% required)**:
- `tests/unit/lib/utils/ordering.test.ts` - Search ordering logic
- `tests/unit/lib/validations/business.test.ts` - Phone/WhatsApp validation

**Standard Coverage (80% required)**:
- All component tests
- All utility function tests
- All context tests

### Integration Tests

**Required Tests**:
- Search flow (home → results)
- Review submission (form → submit → display)
- Business submission (form → pending → admin approval)
- Admin approval (pending → approve → appears in search)
- FilterSheet (filter/sort changes results)

### E2E Tests (Playwright)

**Required Tests**:
- Complete user journey
- Admin journey
- Accessibility compliance (axe)
- PWA functionality
- Cross-browser compatibility

### Commands

```bash
# During development
npm test                    # Run unit tests
npm test:watch             # Watch mode

# Before committing
npm run test:unit          # All unit tests
npm run lint               # ESLint
npm run type-check         # TypeScript

# Before merging
npm run test:all           # Unit + Integration + E2E
npm run test:coverage      # Check coverage (≥80%)
npm run lighthouse         # Performance audit

# CI Pipeline
npm run test:ci            # Runs all tests + coverage + lighthouse
```

---

## Daily Workflow

### Morning Routine
1. Pull latest changes
2. Review today's tasks (from this doc)
3. Create test file(s) for components you'll build today
4. Write tests first (TDD approach)

### During Development
1. Implement component/feature
2. Run tests: `npm test ComponentName`
3. Fix until tests pass
4. Test manually in browser (both HE and RU)

### Before Committing
1. Run `npm run test:unit`
2. Run `npm run lint`
3. Run `npm run type-check`
4. If all pass: `git commit`

### End of Day
1. Update this checklist (mark completed tasks)
2. Note any blockers
3. Plan tomorrow's tasks

---

## Success Metrics (Updated)

### Phase 0 (Week 1)
- [ ] Database migrated with 0 errors
- [ ] Seed data visible in Prisma Studio
- [ ] Both /he and /ru routes work
- [ ] RTL/LTR switching works
- [ ] **NEW**: Testing structure set up, `npm test` works

### Phase 1 (Week 2-3)
- [ ] Can complete full search flow (home → results → detail → review)
- [ ] Search results ordering matches requirements
- [ ] **NEW**: "כל נתניה" option works
- [ ] **NEW**: FilterSheet filters and sorts correctly
- [ ] **NEW**: ShareButton shares with attribution
- [ ] **NEW**: Recently Viewed tracks businesses
- [ ] No results flow works
- [ ] Can submit business
- [ ] **NEW**: Ordering tests pass (100%)
- [ ] **NEW**: Validation tests pass (100%)

### Phase 2 (Week 4)
- [ ] Accessibility panel works and persists
- [ ] **NEW**: Recently Viewed appears on home page
- [ ] PWA installs on mobile
- [ ] axe DevTools: 0 critical issues
- [ ] **NEW**: Accessibility E2E tests pass

### Phase 3 (Week 5-6)
- [ ] Admin can log in
- [ ] Admin can approve pending businesses
- [ ] Admin can edit businesses and toggle flags
- [ ] Admin can manage categories/neighborhoods
- [ ] **NEW**: Admin approval integration tests pass

### Phase 4 (Week 7)
- [ ] All events tracked (including share, recently viewed)
- [ ] Business pages have LocalBusiness schema
- [ ] **NEW**: Open Graph tags work
- [ ] **NEW**: Twitter Cards work
- [ ] Sitemap generated
- [ ] Admin analytics dashboard shows data

### Phase 5 (Week 8)
- [ ] Lighthouse: 90+ performance, 100 accessibility
- [ ] Works on all major browsers
- [ ] **NEW**: Print layout looks professional
- [ ] No security issues
- [ ] **NEW**: Test coverage ≥ 80%
- [ ] **NEW**: Visual regression tests pass
- [ ] Production deployed

---

## V2.0 Additions Summary

**New Components** (7):
1. "כל נתניה" option in SearchForm
2. Complete FilterSheet
3. ResultsHeader (with back button + count)
4. ShareButton (WhatsApp + Copy)
5. Breadcrumbs
6. RecentlyViewed provider + component
7. Print stylesheet

**New Tests** (6 test files):
1. `tests/unit/lib/utils/ordering.test.ts`
2. `tests/unit/lib/validations/business.test.ts`
3. `tests/unit/components/SearchForm.test.tsx`
4. `tests/integration/admin-approval.test.tsx`
5. `tests/e2e/specs/accessibility.spec.ts`
6. `tests/e2e/specs/pwa.spec.ts`

**New Features**:
- Open Graph tags
- Twitter Cards
- Print stylesheet
- Visual regression testing
- Recently Viewed tracking
- Share with attribution

**Total Additional Work**: ~15.5 hours (spread across 8 weeks)

---

**Document Version**: 2.0
**Last Updated**: 2025-11-14
**Related Docs**: All devPlan documents, especially `05-component-architecture.md` and `07-testing-strategy.md`
