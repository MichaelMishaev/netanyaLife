# Locked Screens

**ALL COMPONENTS AND PAGES ARE LOCKED** - Do NOT modify without explicit user permission.

## How to Use
- Before modifying ANY UI component or page, Claude MUST ask for explicit permission
- This lock applies to ALL files listed below
- Only modify if user explicitly requests changes to a specific file

---

## All Pages (LOCKED)

### Public Pages
- `app/[locale]/page.tsx` - Home page
- `app/[locale]/search/[category]/[neighborhood]/page.tsx` - Search results page
- `app/[locale]/business/[slug]/page.tsx` - Business detail page
- `app/[locale]/business/[slug]/write-review/page.tsx` - Write review page
- `app/[locale]/add-business/page.tsx` - Public business submission form
- `app/[locale]/contact/page.tsx` - Contact page
- `app/[locale]/terms/page.tsx` - Terms of service
- `app/[locale]/privacy/page.tsx` - Privacy policy
- `app/[locale]/accessibility/page.tsx` - Accessibility statement

### Authentication Pages
- `app/[locale]/(auth)/admin-login/page.tsx` - Admin login
- `app/[locale]/business-login/page.tsx` - Business owner login

### Business Portal Pages (Owner Interface)
- `app/[locale]/business-portal/page.tsx` - Business portal dashboard
- `app/[locale]/business-portal/add/page.tsx` - Owner add business
- `app/[locale]/business-portal/business/[id]/page.tsx` - Owner business management
- `app/[locale]/business-portal/resubmit/[id]/page.tsx` - Owner resubmit rejected business

### Admin Pages
- `app/[locale]/admin/page.tsx` - Admin dashboard
- `app/[locale]/admin/businesses/page.tsx` - Business management
- `app/[locale]/admin/businesses/new/page.tsx` - Add new business (admin)
- `app/[locale]/admin/businesses/[id]/edit/page.tsx` - Edit business (admin)
- `app/[locale]/admin/pending/page.tsx` - Pending business approvals
- `app/[locale]/admin/pending-edits/page.tsx` - Pending edit approvals
- `app/[locale]/admin/categories/page.tsx` - Category management
- `app/[locale]/admin/category-requests/page.tsx` - Category requests
- `app/[locale]/admin/neighborhoods/page.tsx` - Neighborhood management
- `app/[locale]/admin/reviews/page.tsx` - Review moderation
- `app/[locale]/admin/analytics/page.tsx` - Analytics dashboard
- `app/[locale]/admin/business-map/page.tsx` - Business map view
- `app/[locale]/admin/settings/page.tsx` - Admin settings

### Test Pages
- `app/[locale]/test/page.tsx` - Test page

---

## All Components (LOCKED)

### Server Components
- `components/server/Header.tsx` - Main header
- `components/server/Footer.tsx` - Footer (CRITICAL - DO NOT MODIFY)
- `components/server/Breadcrumbs.tsx` - Breadcrumb navigation

### Client Components - UI/UX
- `components/client/BackButton.tsx` - Back navigation button
- `components/client/LanguageSwitcher.tsx` - Language toggle (HE/RU)
- `components/client/AccessibilityPanel.tsx` - Accessibility controls
- `components/client/PWAInstaller.tsx` - PWA installation prompt
- `components/client/PWAInstallButton.tsx` - PWA install button
- `components/client/ShareButton.tsx` - Share functionality
- `components/client/BusinessLoginLink.tsx` - Business login link

### Client Components - Search & Discovery
- `components/client/SearchForm.tsx` - Home page search form
- `components/client/CategoriesListWithSearch.tsx` - Category list with search
- `components/client/SearchResultsClient.tsx` - Search results display
- `components/client/BusinessCard.tsx` - Business card component
- `components/client/BusinessFilters.tsx` - Business filtering
- `components/client/FilterSheet.tsx` - Filter modal/sheet
- `components/client/RecentlyViewed.tsx` - Recently viewed businesses
- `components/client/BusinessViewTracker.tsx` - View tracking

### Client Components - Business Management
- `components/client/BusinessManagementCard.tsx` - Business management card
- `components/client/BusinessEditForm.tsx` - Business edit form
- `components/client/AdminBusinessForm.tsx` - Admin business form
- `components/client/AdminBusinessEditForm.tsx` - Admin edit form
- `components/client/AddBusinessForm.tsx` - Public add business form
- `components/client/OwnerAddBusinessForm.tsx` - Owner add business form
- `components/client/OwnerResubmitBusinessForm.tsx` - Owner resubmit form
- `components/client/PendingBusinessCard.tsx` - Pending business card
- `components/client/PendingEditCard.tsx` - Pending edit card
- `components/client/DismissRejectedEditButton.tsx` - Dismiss rejected edit
- `components/client/OpeningHoursInput.tsx` - Opening hours input

### Client Components - Admin Interface
- `components/client/CategoryManagementCard.tsx` - Category management
- `components/client/CategoryForm.tsx` - Category form
- `components/client/SubcategoryForm.tsx` - Subcategory form
- `components/client/CategoryRequestCard.tsx` - Category request card
- `components/client/CategoryRequestModal.tsx` - Category request modal
- `components/client/NeighborhoodManagementCard.tsx` - Neighborhood management
- `components/client/NeighborhoodForm.tsx` - Neighborhood form
- `components/client/MoveBusinessesModal.tsx` - Move businesses modal
- `components/client/ReviewManagement.tsx` - Review moderation
- `components/client/AdminSettingsForm.tsx` - Admin settings form
- `components/client/AdminMobileMenu.tsx` - Admin mobile menu

### Client Components - Business Portal
- `components/client/BusinessPortalMobileMenu.tsx` - Business portal mobile menu
- `components/client/BusinessPortalUserMenu.tsx` - Business portal user menu

### Client Components - Analytics
- `components/client/AnalyticsDashboard.tsx` - Analytics dashboard
- `components/client/AnalyticsDrillDown.tsx` - Analytics drill-down
- `components/client/TimelineSelector.tsx` - Timeline selector
- `components/client/BusinessMapDashboard.tsx` - Business map dashboard

### Client Components - Authentication
- `components/client/AdminLoginForm.tsx` - Admin login form
- `components/client/AdminLogoutButton.tsx` - Admin logout button
- `components/client/BusinessOwnerLoginForm.tsx` - Business owner login form

### Client Components - Reviews & CTA
- `components/client/ReviewForm.tsx` - Review submission form
- `components/client/CTAButton.tsx` - Call-to-action button
- `components/client/CTAButtons.tsx` - Multiple CTA buttons

### Client Components - Forms & Inputs
- `components/client/SimpleSelect.tsx` - Simple select dropdown
- `components/client/SearchableSelect.tsx` - Searchable select

### Client Components - Headers & Navigation
- `components/client/ConditionalHeader.tsx` - Conditional header display

### Client Components - Testing
- `components/client/PublicTestToggle.tsx` - Public test toggle

### Providers
- `components/providers/ClientProviders.tsx` - Client-side providers

### UI Components
- `components/ui/Skeleton.tsx` - Loading skeleton

---

## Exceptions

The following may be modified as needed:
- Database queries (`lib/queries/**`)
- API routes (`app/api/**`)
- Server actions (`lib/actions/**`)
- Utilities (`lib/utils/**`)
- Configuration files (`*.config.js`, `*.config.ts`)
- Documentation files (`docs/**/*.md` except this file)

However, ALWAYS ask before making significant architectural changes.

---

*Last updated: 2025-11-25*
*Total locked files: 28 pages + 58 components = 86 files*
