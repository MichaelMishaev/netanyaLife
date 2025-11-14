# Tech Stack Analysis & Recommendations

## Executive Summary

**Project**: Netanya Local - Hyper-local business directory
**Target**: Israeli market (Hebrew RTL primary, Russian LTR secondary)
**Key Requirements**: Mobile-first PWA, SEO, Accessibility (WCAG AA), Analytics, Bilingual

---

## Recommended Tech Stack

### 🎯 Frontend Framework: **Next.js 14+ (App Router)**

**Why Next.js?**
- ✅ **Native i18n routing** - Perfect for `/he/...` and `/ru/...` URLs
- ✅ **Server Components** - Better SEO, faster initial loads
- ✅ **Built-in SEO** - Metadata API, sitemap generation, robots.txt
- ✅ **RTL Support** - Works seamlessly with `dir="rtl"` attribute
- ✅ **Edge Runtime** - Fast responses for international users
- ✅ **Image Optimization** - Critical for mobile performance
- ✅ **API Routes** - Backend API in same codebase
- ✅ **PWA Ready** - Easy integration with `next-pwa`

**Alternatives Considered**:
- ❌ Remix - Less mature i18n, smaller ecosystem
- ❌ Vite + React Router - More manual setup for SEO/i18n
- ❌ Astro - Overkill for this level of interactivity

---

### 🎨 Styling: **Tailwind CSS 3.4+**

**Why Tailwind?**
- ✅ **RTL Plugin** - `@tailwindcss/rtl` for automatic RTL support
- ✅ **Mobile-first** - Default responsive design approach
- ✅ **Performance** - Purges unused CSS automatically
- ✅ **Accessibility** - Focus-visible utilities, semantic color system
- ✅ **Dark Mode** - Easy high-contrast mode implementation
- ✅ **DX** - Fast iteration, no CSS file switching

**Configuration**:
```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'system-ui'], // Hebrew-optimized font
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-rtl'),
  ],
}
```

**Font Choice**: **Heebo** or **Rubik** (both support Hebrew + Latin + Cyrillic)

---

### 🗄️ Database: **PostgreSQL 15+**

**Why PostgreSQL?**
- ✅ **Relational integrity** - Perfect for cities → neighborhoods → businesses
- ✅ **Full-text search** - For future search enhancements (Hebrew/Russian)
- ✅ **JSON support** - For flexible analytics events
- ✅ **GIS extension** (PostGIS) - For future location-based features
- ✅ **Mature ecosystem** - Vercel Postgres, Supabase, Neon, Railway
- ✅ **Free tier options** - Multiple hosting providers

**Alternatives Considered**:
- ❌ MySQL - Weaker full-text search for non-Latin scripts
- ❌ MongoDB - Overkill for this structured data
- ❌ SQLite - Not suitable for production multi-user app

**Hosting Recommendation**: **Vercel Postgres** or **Supabase**
- Vercel Postgres: Best if deploying to Vercel
- Supabase: More features (auth, storage, realtime if needed later)

---

### 🔧 ORM: **Prisma 5+**

**Why Prisma?**
- ✅ **Type Safety** - Auto-generated TypeScript types
- ✅ **Schema Migrations** - Version-controlled database changes
- ✅ **Prisma Studio** - Visual database browser
- ✅ **N+1 Prevention** - Smart query optimization
- ✅ **Middleware** - For soft deletes, timestamps, audit logs
- ✅ **Seeding** - Easy initial data setup

**Sample Schema Preview**:
```prisma
model Business {
  id              String   @id @default(cuid())
  name_he         String
  name_ru         String?
  slug_he         String   @unique
  slug_ru         String?  @unique
  phone           String?
  whatsapp_number String?
  is_visible      Boolean  @default(true)
  is_verified     Boolean  @default(false)
  is_pinned       Boolean  @default(false)

  category        Category     @relation(fields: [category_id], references: [id])
  category_id     String
  neighborhood    Neighborhood @relation(fields: [neighborhood_id], references: [id])
  neighborhood_id String
  reviews         Review[]

  @@index([category_id, neighborhood_id, is_visible])
  @@index([is_pinned, is_visible])
}
```

---

### 🔴 Cache & Sessions: **Redis (Upstash or Vercel KV)**

**Why Redis?**
- ✅ **Bug tracking** - Per user requirement (WhatsApp bug reports)
- ✅ **Session management** - Admin login sessions
- ✅ **Rate limiting** - Prevent review spam
- ✅ **Analytics buffer** - Batch write events to DB
- ✅ **Caching** - Frequently accessed data (categories, neighborhoods)

**Hosting**: **Upstash Redis** (serverless, pay-per-request, free tier)

**Use Cases**:
```typescript
// Bug tracking
await redis.lpush('user_messages', JSON.stringify({
  timestamp: new Date().toISOString(),
  messageText: '#bug - show only future events',
  status: 'pending'
}))

// Cache categories (1 hour TTL)
await redis.setex('categories:active', 3600, JSON.stringify(categories))

// Rate limit reviews (5 per hour per IP)
const key = `ratelimit:review:${ip}`
const count = await redis.incr(key)
if (count === 1) await redis.expire(key, 3600)
if (count > 5) throw new Error('Rate limit exceeded')
```

---

### 📊 Analytics: **Vercel Analytics + Custom Events Table**

**Approach**: Hybrid
1. **Vercel Web Analytics** - Page views, vitals, user flow (free, privacy-friendly)
2. **Custom events table in PostgreSQL** - Business-specific tracking

**Why Hybrid?**
- Vercel Analytics: Fast, compliant, no cookies needed
- Custom DB: Full control, custom queries, business insights

**Custom Events Schema**:
```prisma
model Event {
  id         String   @id @default(cuid())
  type       String   // 'search_performed', 'cta_clicked', etc.
  properties Json     // Flexible payload
  session_id String?
  user_agent String?
  ip_hash    String?  // Hashed for privacy
  created_at DateTime @default(now())

  @@index([type, created_at])
  @@index([created_at])
}
```

**Events to Track**:
- `search_performed` - { service_type, neighborhood, language, results_count }
- `business_viewed` - { business_id, source }
- `cta_clicked` - { type: 'whatsapp'|'call'|'directions'|'website', business_id }
- `review_submitted` - { business_id, rating }
- `business_submitted` - { category_id, neighborhood_id }
- `pwa_installed` - {}
- `accessibility_opened` - {}
- `accessibility_font_changed` - { size: 'medium'|'large' }
- `accessibility_contrast_toggled` - { enabled: true|false }

---

### 🌍 Internationalization: **next-intl**

**Why next-intl?**
- ✅ **Best Next.js integration** - Works seamlessly with App Router
- ✅ **Type-safe translations** - Auto-complete for translation keys
- ✅ **Namespace support** - Organize by page/component
- ✅ **Number/date formatting** - Locale-aware
- ✅ **RTL support** - Built-in direction handling

**Structure**:
```
messages/
  he.json
  ru.json

// In component
import {useTranslations} from 'next-intl';
const t = useTranslations('Home');
<h1>{t('hero.title')}</h1>
```

**Alternative**: `next-international` (lighter, but less features)

---

### 📱 PWA: **next-pwa**

**Configuration**:
```js
// next.config.js
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
      urlPattern: /^https:\/\/wa\.me\/.*/i,
      handler: 'NetworkOnly', // Never cache WhatsApp links
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
```

---

### 🔐 Authentication: **NextAuth.js (v5 - Auth.js)**

**Why NextAuth?**
- ✅ **Simple setup** - For single admin user
- ✅ **Credentials provider** - Email/password login
- ✅ **Session management** - JWT or database sessions
- ✅ **CSRF protection** - Built-in
- ✅ **Expandable** - Can add OAuth later if needed

**Admin Config**:
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (
          credentials.email === '345287@gmail.com' &&
          credentials.password === 'admin1'
        ) {
          return { id: '1', email: '345287@gmail.com', role: 'superadmin' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
})
```

**Security Note**: In production, replace hardcoded credentials with:
- Hashed password in environment variable
- Or database lookup with bcrypt

---

### 🧪 Testing Stack

**Unit & Integration**: **Vitest** (faster than Jest, better ESM support)
**E2E**: **Playwright** (best for multi-language testing)
**Component Testing**: **React Testing Library**

**Why Vitest?**
- ✅ 10x faster than Jest
- ✅ Native ESM support
- ✅ Compatible with Vite (Next.js uses Turbopack, but Vitest works)
- ✅ Same API as Jest (easy migration from tutorials)

---

### 📦 Package Management: **pnpm**

**Why pnpm?**
- ✅ **Fastest** - Faster than npm/yarn
- ✅ **Disk efficient** - Hard links instead of duplicating
- ✅ **Strict** - Prevents phantom dependencies
- ✅ **Monorepo support** - If you expand later

---

### 🚀 Deployment: **Vercel**

**Why Vercel?**
- ✅ **Made for Next.js** - Zero-config deployment
- ✅ **Edge network** - Fast globally (important for Israel + Russian users)
- ✅ **Preview deployments** - Every PR gets a URL
- ✅ **Analytics** - Built-in Web Analytics
- ✅ **Postgres** - Integrated database option
- ✅ **KV (Redis)** - Integrated Redis option
- ✅ **Free tier** - Generous for MVP

**Alternative**: **Netlify** (if you need edge functions) or **Railway** (if self-hosting)

---

### 🎨 UI Components: **Headless UI** (by Tailwind Labs)

**Why Headless UI?**
- ✅ **Unstyled** - Full control over appearance
- ✅ **Accessible** - ARIA compliant out of the box
- ✅ **RTL support** - Works with Tailwind RTL
- ✅ **Lightweight** - No bloat

**Components to Use**:
- `Listbox` - For service type & neighborhood dropdowns
- `Dialog` - For accessibility panel, review form
- `Disclosure` - For filters bottom sheet
- `Menu` - For admin actions

**Alternative**: **Radix UI** (more comprehensive, slightly heavier)

---

### 📐 Form Management: **React Hook Form + Zod**

**Why This Combo?**
- ✅ **Performance** - Minimal re-renders
- ✅ **Type safety** - Zod schemas = TypeScript types
- ✅ **Validation** - Client + server with same schema
- ✅ **Error handling** - Granular field errors
- ✅ **i18n friendly** - Custom error messages per locale

**Example**:
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment_he: z.string().optional(),
  author_name: z.string().optional(),
})

const form = useForm({
  resolver: zodResolver(reviewSchema),
})
```

---

## Development Tools

### Code Quality
- **ESLint** - With `eslint-config-next` + accessibility plugin
- **Prettier** - With Tailwind plugin for class sorting
- **TypeScript 5.3+** - Strict mode
- **Husky** - Pre-commit hooks (lint, type check)

### VSCode Extensions (Recommended)
- Tailwind CSS IntelliSense
- Prisma
- ESLint
- Prettier
- Hebrew Language Pack
- Error Lens

---

## Infrastructure Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js 14 App Router                    │   │
│  │  ┌────────────┐  ┌──────────────┐               │   │
│  │  │   Server   │  │   Client     │               │   │
│  │  │ Components │  │  Components  │               │   │
│  │  │            │  │              │               │   │
│  │  │  • SEO     │  │ • Interactivity              │   │
│  │  │  • i18n    │  │ • PWA        │               │   │
│  │  │  • API     │  │ • Accessibility              │   │
│  │  └─────┬──────┘  └──────────────┘               │   │
│  │        │                                          │   │
│  └────────┼──────────────────────────────────────────┘   │
└───────────┼──────────────────────────────────────────────┘
            │
   ┌────────┴─────────┐
   │                  │
   ▼                  ▼
┌──────────┐    ┌──────────┐
│PostgreSQL│    │  Redis   │
│  Vercel  │    │ Upstash  │
│ Postgres │    │   KV     │
│          │    │          │
│ • cities │    │ • bugs   │
│ • neighb │    │ • cache  │
│ • categ  │    │ • sessions│
│ • busins │    │ • ratelimit│
│ • reviews│    │          │
│ • events │    │          │
└──────────┘    └──────────┘
```

---

## Cost Estimation (Monthly)

### MVP Phase (First 3 months)
- **Vercel Pro**: $20/month (or stay on Hobby - free)
- **Vercel Postgres**: Free tier (60 hours compute) → $24/month if exceeded
- **Upstash Redis**: Free tier (10K requests/day) → $0.20 per 100K if exceeded
- **Domain**: $12/year (~$1/month)
- **Fonts** (Google Fonts): Free
- **Monitoring** (Sentry): Free tier

**Total MVP**: $0-$45/month depending on traffic

### Production (1000+ daily users)
- **Vercel Pro**: $20/month
- **Vercel Postgres**: $24/month
- **Upstash Redis**: ~$5/month
- **Domain**: $1/month
- **Analytics** (PostHog or similar): $0-$50/month

**Total Production**: $50-$100/month

---

## Technology Decision Matrix

| Requirement | Solution | Confidence | Risk |
|-------------|----------|------------|------|
| Mobile-first | Next.js + Tailwind | 🟢 High | Low |
| RTL/LTR support | next-intl + Tailwind RTL | 🟢 High | Low |
| SEO | Next.js App Router | 🟢 High | Low |
| PWA | next-pwa | 🟡 Medium | Medium (SW caching can be tricky) |
| Accessibility | Headless UI + Semantic HTML | 🟢 High | Low (needs thorough testing) |
| i18n | next-intl | 🟢 High | Low |
| Database | PostgreSQL + Prisma | 🟢 High | Low |
| Redis | Upstash Redis | 🟢 High | Low |
| Auth | NextAuth v5 | 🟡 Medium | Low (simple use case) |
| Analytics | Custom + Vercel | 🟢 High | Low |
| Deployment | Vercel | 🟢 High | Low |

---

## Next Steps

1. **Project Initialization**:
   ```bash
   npx create-next-app@latest netanya-local \
     --typescript \
     --tailwind \
     --app \
     --src-dir \
     --import-alias "@/*"
   ```

2. **Install Core Dependencies**:
   ```bash
   pnpm add next-intl next-pwa @headlessui/react
   pnpm add prisma @prisma/client
   pnpm add @upstash/redis
   pnpm add next-auth@beta
   pnpm add react-hook-form @hookform/resolvers zod
   pnpm add -D @types/node typescript eslint
   ```

3. **Initialize Prisma**:
   ```bash
   npx prisma init --datasource-provider postgresql
   ```

4. **Configure i18n** (see devPlan/02-database-schema.md for routing setup)

5. **Set up environment variables** (see `.env.example` template)

---

## Risks & Mitigations

### Risk 1: RTL/LTR Edge Cases
**Mitigation**:
- Use Tailwind's logical properties (`ms-4` instead of `ml-4`)
- Test every component in both directions
- Use browser DevTools to toggle `dir` attribute

### Risk 2: PWA Service Worker Caching
**Mitigation**:
- Use `NetworkFirst` strategy for dynamic content
- Never cache WhatsApp/tel: links
- Provide clear "Update Available" UI
- Test offline scenarios early

### Risk 3: Accessibility Compliance
**Mitigation**:
- Run axe DevTools on every page
- Manual keyboard navigation testing
- Screen reader testing (NVDA for Hebrew)
- Get legal review of WCAG checklist

### Risk 4: Hebrew/Russian Search
**Mitigation**:
- Start with exact dropdown matching (no free text)
- Phase 2: Add PostgreSQL full-text search with Hebrew stemming
- Consider Algolia/Meilisearch if needed (phase 3)

---

## Technology Alternatives (For Future Consideration)

| Feature | Current | Alternative | When to Switch |
|---------|---------|-------------|----------------|
| Database | PostgreSQL | MongoDB | If data becomes unstructured |
| ORM | Prisma | Drizzle ORM | If need more SQL control |
| Auth | NextAuth | Supabase Auth | If add social login |
| Analytics | Custom | PostHog | If need user recordings |
| Search | PostgreSQL FTS | Algolia/Meilisearch | If >10K businesses |
| Payments | N/A | Stripe | If add premium listings |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-13
**Next Review**: After Phase 1 (MVP) completion
