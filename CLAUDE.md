# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL RULES

**DO NOT CHANGE THE FOOTER** (`components/server/Footer.tsx`) unless explicitly instructed by the user.

## Project Overview

**Netanya Local** - Hyper-local business directory exclusively for Netanya residents, divided by neighborhoods.

- **Target City**: נתניה (Netanya, Israel)
- **Primary Language**: Hebrew (RTL)
- **Secondary Language**: Russian (LTR)
- **Core Focus**: Mobile-first PWA with neighborhood-based service discovery

## Project Structure & Architecture

### Tech Stack (To Be Implemented)
This is a greenfield project. Recommended stack based on requirements:
- **Frontend**: Next.js 14+ (App Router for RTL/LTR routing, SEO, i18n)
- **Database**: PostgreSQL (structured data, neighborhoods, categories)
- **Cache/Sessions**: Redis (for analytics, pending messages)
- **Styling**: Tailwind CSS (RTL support with `dir` utilities)
- **PWA**: next-pwa or Workbox
- **Deployment**: Vercel or similar with edge functions

### Core Data Models

```
cities → neighborhoods → categories → businesses → reviews
                                   ↓
                          pending_businesses
```

**Key Tables**:
1. `cities` - Single city: נתניה
2. `neighborhoods` - מרכז, צפון, דרום, מזרח העיר (admin-managed, 4 neighborhoods)
3. `categories` - Service types with Hebrew/Russian names (חשמלאים, אינסטלטורים, etc.)
4. `businesses` - Approved business listings with:
   - `is_visible`, `is_verified`, `is_pinned` flags
   - Bilingual content (name, description, address, opening_hours)
   - Contact: `phone`, `whatsapp_number`, `website_url`
   - **Validation Rule**: Must have phone OR whatsapp (at least one)
5. `reviews` - Star ratings (1-5) with optional comment and author
6. `pending_businesses` - Public submissions awaiting approval
7. `events` - Analytics tracking

### Critical Business Logic

#### 1. Search Results Ordering (docs/sysAnal.md:87-91)
```
1. Pinned businesses (is_pinned=true & is_visible=true) - show first X (admin-configurable)
2. Next 5 random businesses from remaining visible matches
3. Rest sorted by rating DESC, then newest
```

#### 2. Phone/WhatsApp Validation (docs/sysAnal.md:153-161)
- **Must have at least one**: phone OR whatsapp_number
- **Never auto-copy**: Show buttons only for provided contacts
- Error message: "חובה למלא טלפון או מספר ווטסאפ אחד לפחות"

#### 3. No Results Flow (docs/sysAnal.md:93-97)
When results_count == 0 for chosen neighborhood:
- Show: "לא נמצאו תוצאות בשכונה שנבחרה"
- Button: "חיפוש בכל נתניה" (expands search to all neighborhoods)

#### 4. Admin Access (docs/sysAnal.md:205-206)
- **Single SuperAdmin**: email = "345287@gmail.com", password = "admin1"
- Controls: categories, neighborhoods, business approval, visibility, verification badges, pinned results

### URL Structure & Routing

```
Client (Public):
/he/netanya/tsafon/instalatorim              # Hebrew results page
/ru/netanya/sever/santehniki                 # Russian results page
/he/business/netanya/tsafon/yossi-plumber    # Business detail
/add-business                                 # Public submission form
/write-review/:businessId                     # Review submission

Admin (Protected):
/admin                                        # Login
/admin/businesses                             # Business management
/admin/pending                                # Approval queue
/admin/categories                             # Service types CRUD
/admin/neighborhoods                          # Neighborhoods CRUD
/admin/settings                               # Top X count, etc.
```

### Accessibility Requirements (docs/sysAnal.md:164-202)

**Fixed Accessibility Panel** (bottom-right icon ♿):
- **Font Size**: Normal / Medium / Large (16/18/20px)
- **High Contrast Mode**: Toggle for darker text, pure white background
- **Underline Links**: Toggle for all links
- **Keyboard Focus**: Always visible focus states
- **Persistence**: Save preferences in localStorage

**Technical Compliance** (Israeli W3C/WCAG AA):
- Semantic HTML (`<main>`, `<nav>`, `<header>`, `<label>`)
- `aria-label` for icon buttons (WhatsApp, Call, Directions)
- Skip-link: "דלג לתוכן" at top
- Color contrast meets WCAG AA
- Logical tab order

### PWA Requirements (docs/sysAnal.md:281-294)

**manifest.webmanifest**:
```json
{
  "name": "Netanya Local – מדריך עסקים בנתניה",
  "short_name": "NetanyaLocal",
  "lang": "he",
  "start_url": "/he",
  "display": "standalone",
  "dir": "rtl"
}
```

**Service Worker**:
- Cache: static assets, visited pages (home, results, business detail)
- Offline fallback: "אין חיבור לאינטרנט. אפשר לראות חלק מהתוכן שנשמר מהביקור האחרון"

### SEO & Structured Data (docs/sysAnal.md:296-304)

**Every business detail page must include**:
```json
{
  "@type": "LocalBusiness",
  "name": "...",
  "address": {...},
  "telephone": "...",
  "geo": {...},
  "openingHours": "...",
  "aggregateRating": {...},
  "review": [...]
}
```

- `hreflang` tags for HE/RU versions
- Slugs for SEO: `/he/netanya/tsafon/instalatorim`
- Meta descriptions with neighborhood keywords

### Analytics Tracking (docs/sysAnal.md:306-325)

**Events to log**:
- `search_performed` (service_type, neighborhood, language, results_count)
- `business_viewed` (business_id, source)
- `cta_clicked` (type: whatsapp/call/directions/website, business_id)
- `review_submitted` (business_id, rating)
- `business_submitted` (category_id, neighborhood_id)
- `pwa_installed`
- `search_all_city_clicked` (original_neighborhood)
- `language_changed` (from, to)
- `accessibility_opened`
- `accessibility_font_changed` (size)
- `accessibility_contrast_toggled` (enabled)

### Redis-Based Bug Reporting (User's CLAUDE.md)

**How it works**:
1. User reports bugs in WhatsApp with `#` prefix (e.g., "#bug - show only future events")
2. Messages saved to Redis `user_messages` list with `status: "pending"`
3. When user says "fix all # bugs", search Redis for `status === 'pending'` only
4. After fixing, mark as `status: 'fixed'` with `fixedAt` timestamp and `commitHash`

**Redis Operations**:
```javascript
// Find pending bugs
redis.lrange('user_messages', 0, -1)
  .filter(msg => msg.startsWith('#') && msg.status === 'pending')

// Mark as fixed
redis.lset(index, {
  ...bug,
  status: 'fixed',
  fixedAt: new Date().toISOString(),
  commitHash: '<git-hash>'
})
```

**Data Structure**:
```json
{
  "timestamp": "2025-10-17T09:08:00Z",
  "messageText": "#bug - show only future events",
  "userId": "...",
  "phone": "...",
  "direction": "incoming",
  "status": "pending" // or "fixed"
}
```

## Development Commands

*(To be added when project setup is complete)*

```bash
# Initial setup
npm install                    # Install dependencies
npm run db:migrate            # Run database migrations
npm run db:seed               # Seed initial data (neighborhoods, categories)

# Development
npm run dev                   # Start dev server
npm run dev:redis             # Start Redis locally (or use Docker)

# Database
npm run db:studio             # Open Prisma Studio / DB GUI
npm run db:migrate:create     # Create new migration

# Testing
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm run test:e2e              # End-to-end tests

# Build & Deploy
npm run build                 # Production build
npm run start                 # Start production server
npm run analyze               # Analyze bundle size

# Linting
npm run lint                  # Run ESLint
npm run format                # Format with Prettier
```

## Key Implementation Notes

1. **Always check both phone AND whatsapp_number** - Never assume they're the same
2. **Pinned results logic is critical** - Must respect `topPinnedCount` setting from admin
3. **RTL/LTR switching** - Use `dir` attribute and Tailwind's RTL directives
4. **Accessibility is mandatory** - Israeli compliance requires WCAG AA
5. **Redis bug tracking** - Always filter by `status !== 'fixed'` when searching bugs
6. **No free-text search** - Only dropdowns for service type and neighborhood
7. **Mobile-first** - All designs must work on 375px width minimum
8. **Offline support** - Service worker must cache critical paths

## Important Files

- `docs/sysAnal.md` - Complete system requirements and user flows
- *(To be created)* `prisma/schema.prisma` - Database schema
- *(To be created)* `lib/redis.ts` - Redis client and bug tracking utilities
- *(To be created)* `middleware.ts` - i18n routing (he/ru)
- *(To be created)* `app/[lang]/layout.tsx` - Root layout with accessibility provider
- while developing create automation i  parallel
- when have bugs, documante in '/Users/michaelmishayev/Desktop/Projects/netanyaBusiness/docs/bugs/bugs.md' the bug and the woring solution