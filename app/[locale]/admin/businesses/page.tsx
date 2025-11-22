import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import BusinessManagementCard from '@/components/client/BusinessManagementCard'
import BusinessFilters from '@/components/client/BusinessFilters'
import PublicTestToggle from '@/components/client/PublicTestToggle'

interface AdminBusinessesPageProps {
  params: {
    locale: string
  }
  searchParams: {
    neighborhood?: string
    category?: string
    showTest?: string
  }
}

export default async function AdminBusinessesPage({
  params: { locale },
  searchParams,
}: AdminBusinessesPageProps) {
  const t = await getTranslations('admin.businesses')

  // Check if showing test businesses
  const showTestBusinesses = searchParams?.showTest === 'true'

  // Build filter conditions
  const whereConditions: any = {
    deleted_at: null,
    // Toggle switches between test and real businesses
    is_test: showTestBusinesses ? true : false,
  }

  if (searchParams?.neighborhood) {
    whereConditions.neighborhood_id = searchParams.neighborhood
  }

  if (searchParams?.category) {
    whereConditions.category_id = searchParams.category
  }

  // Get filtered businesses
  const businesses = await prisma.business.findMany({
    where: whereConditions,
    include: {
      category: true,
      subcategory: true,
      neighborhood: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  // Get counts for the toggle and public setting
  const [testBusinessCount, realBusinessCount, showTestOnPublicSetting] = await Promise.all([
    prisma.business.count({ where: { deleted_at: null, is_test: true } }),
    prisma.business.count({ where: { deleted_at: null, is_test: false } }),
    prisma.adminSettings.findUnique({ where: { key: 'show_test_on_public' } }),
  ])
  const showTestOnPublic = showTestOnPublicSetting?.value === 'true'

  // Get all neighborhoods and categories for filters
  const [neighborhoods, categories] = await Promise.all([
    prisma.neighborhood.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name_he: true,
        name_ru: true,
      },
      orderBy: { display_order: 'asc' },
    }),
    prisma.category.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name_he: true,
        name_ru: true,
      },
      orderBy: { display_order: 'asc' },
    }),
  ])

  return (
    <div className="relative pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 px-4 py-2 font-medium text-blue-800">
            {businesses.length} {locale === 'he' ? 'עסקים' : 'предприятий'}
          </div>
          {/* Desktop Add Button */}
          <a
            href={`/${locale}/admin/businesses/new`}
            className="hidden rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition hover:bg-primary-700 sm:block"
          >
            + {locale === 'he' ? 'הוסף עסק' : 'Добавить бизнес'}
          </a>
        </div>
      </div>

      {/* Public Test Toggle - Controls if test businesses show on public pages */}
      <div className="mb-4">
        <PublicTestToggle locale={locale} initialValue={showTestOnPublic} />
      </div>

      {/* Filters */}
      <BusinessFilters
        locale={locale}
        neighborhoods={neighborhoods}
        categories={categories}
        testBusinessCount={testBusinessCount}
        realBusinessCount={realBusinessCount}
      />

      {/* Business List */}
      {businesses.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-lg text-gray-600">
            {locale === 'he' ? 'אין עסקים עדיין' : 'Нет предприятий'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <BusinessManagementCard
              key={business.id}
              business={business}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Mobile FAB (Floating Action Button) */}
      <a
        href={`/${locale}/admin/businesses/new`}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-2xl text-white shadow-lg transition hover:bg-primary-700 active:scale-95 sm:hidden"
        aria-label={locale === 'he' ? 'הוסף עסק' : 'Добавить бизнес'}
      >
        +
      </a>
    </div>
  )
}
