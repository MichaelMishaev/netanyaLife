# קהילת נתניה - קהילת נתניה

**Status**: 🚧 In Development (Day 1/47 Complete)
**Version**: 0.1.0

Hyper-local business directory exclusively for Netanya residents, divided by neighborhoods.

## Project Overview

- **Target City**: נתניה (Netanya, Israel)
- **Primary Language**: Hebrew (RTL)
- **Secondary Language**: Russian (LTR)
- **Core Focus**: Mobile-first PWA with neighborhood-based service discovery

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (Upstash)
- **Auth**: NextAuth v5
- **i18n**: next-intl
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database
- Redis instance

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations (Week 1, Day 2)
npm run prisma:migrate

# Seed the database (Week 1, Day 3)
npm run prisma:seed

# Start development server
npm run dev
```

The app will be available at [http://localhost:4700](http://localhost:4700)

## Development Commands

```bash
# Development
npm run dev                    # Start dev server (port 4700)
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check             # TypeScript checks
npm run format                 # Format with Prettier

# Testing
npm test                       # Run unit tests
npm test:watch                 # Watch mode
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e               # E2E tests (Playwright)
npm run test:e2e:ui            # E2E with UI
npm run test:all               # All tests
npm run test:coverage          # Coverage report (≥80%)

# Database
npm run prisma:studio          # Open Prisma Studio
npm run prisma:migrate         # Run migrations
npm run prisma:seed            # Seed data
npm run prisma:generate        # Generate Prisma client

# Performance
npm run lighthouse             # Lighthouse audit
```

## Project Structure

```
netanyaBusiness/
├── app/                      # Next.js App Router
│   ├── [lang]/              # Internationalized routes
│   ├── api/                 # API routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── client/             # Client components
│   └── server/             # Server components
├── lib/                     # Utilities and libraries
│   ├── queries/            # Database queries
│   ├── validations/        # Zod schemas
│   └── utils/              # Helper functions
├── contexts/               # React contexts
├── prisma/                 # Database schema & seeds
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # E2E tests
│   ├── fixtures/          # Test data
│   └── helpers/           # Test utilities
├── docs/                   # Documentation
│   ├── devPlan/           # Development plan (8 weeks)
│   └── sysAnal.md         # System requirements
└── public/                 # Static assets
```

## Development Progress

### ✅ Day 1: Project Initialization (Complete)
- [x] Next.js 14 project setup
- [x] TypeScript & ESLint configuration
- [x] Tailwind CSS setup
- [x] Testing infrastructure (Vitest + Playwright)
- [x] Test folder structure
- [x] Dev server running on port 4700

### ✅ Day 2: Database Setup (Complete)
- [x] Prisma schema created (9 tables + 3 enums)
- [x] PostgreSQL database connected
- [x] Initial migration applied
- [x] Prisma Client generated
- [x] Database connection utility created
- [x] All 10 tables verified ✓

### ✅ Day 3: Seed Data + Docker Setup (Complete)
- [x] Docker Compose configured (PostgreSQL + Redis)
- [x] Migrated to Docker databases
- [x] Comprehensive seed script created
- [x] 1 city seeded (Netanya)
- [x] 4 neighborhoods seeded
- [x] 12 service categories seeded
- [x] 8 sample businesses seeded (with pinned examples)
- [x] 4 sample reviews seeded
- [x] Admin user created (345287@gmail.com)
- [x] Admin settings configured

### 🚧 Week 1: Foundation (Days 1-5)
- [ ] Day 4: Redis + i18n setup
- [ ] Day 5: Base layout + providers

**Total Timeline**: 8 weeks (47 working days)

## Key Features (Planned)

### Public Features
- Search businesses by neighborhood + service type
- View business details with smart ordering
- Submit reviews (star rating + comment)
- Add business (pending approval)
- Accessibility panel (WCAG AA compliant)
- PWA (install on mobile, offline mode)

### Admin Features
- Approve/reject pending businesses
- Manage businesses (edit, visibility, verification)
- Manage categories and neighborhoods
- Analytics dashboard

## Documentation

Comprehensive development documentation is available in `/docs/devPlan/`:

1. **[00-QUICK-REFERENCE.md](docs/devPlan/00-QUICK-REFERENCE.md)** - 5-minute overview
2. **[01-tech-stack.md](docs/devPlan/01-tech-stack.md)** - Technology decisions
3. **[02-database-schema.md](docs/devPlan/02-database-schema.md)** - Database schema
4. **[03-development-phases.md](docs/devPlan/03-development-phases.md)** - 8-week timeline
5. **[04-api-endpoints.md](docs/devPlan/04-api-endpoints.md)** - API specification
6. **[05-component-architecture.md](docs/devPlan/05-component-architecture.md)** - UI components
7. **[06-implementation-priorities.md](docs/devPlan/06-implementation-priorities.md)** - Daily roadmap
8. **[07-testing-strategy.md](docs/devPlan/07-testing-strategy.md)** - Testing guide
9. **[08-brave-search-integration.md](docs/devPlan/08-brave-search-integration.md)** - Brave Search API

## Testing

This project follows a TDD (Test-Driven Development) approach:

- **Coverage Target**: 80%+ overall, 100% for critical paths
- **Unit Tests**: Fast, isolated component/function tests
- **Integration Tests**: Multi-component flow tests
- **E2E Tests**: Full user journey tests with Playwright

Run tests during development:
```bash
npm test:watch
```

## Contributing

This is a private project. For the development team:

1. Read `/docs/devPlan/00-QUICK-REFERENCE.md` first
2. Follow the daily roadmap in `/docs/devPlan/06-implementation-priorities.md`
3. Write tests during development (TDD)
4. Test in both Hebrew (RTL) and Russian (LTR)
5. Run `npm run test:unit && npm run lint` before commits

## License

Private project - All rights reserved

## Contact

For questions or issues, contact the project maintainer.

---

**Current Status**: Day 3/47 Complete ✅
**Database**: Docker PostgreSQL (5433) + Redis (6380)
**Seed Data**: ✓ 1 city, 4 neighborhoods, 12 categories, 8 businesses, 4 reviews
**Next Step**: Day 4 - Redis Client + i18n Configuration (next-intl)
