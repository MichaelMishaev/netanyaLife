import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { getSearchResults, getSearchResultsCount } from '@/lib/queries/businesses'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getNeighborhoodBySlug, getNetanyaCity } from '@/lib/queries/neighborhoods'
import SearchResultsClient from '@/components/client/SearchResultsClient'
import Breadcrumbs from '@/components/server/Breadcrumbs'
import BackButton from '@/components/client/BackButton'

interface SearchResultsPageProps {
  params: {
    locale: string
    category: string
    neighborhood: string
  }
  searchParams: {
    subcategory?: string
  }
}

export async function generateMetadata({
  params: { locale, category: categorySlug, neighborhood: neighborhoodSlug },
  searchParams,
}: SearchResultsPageProps): Promise<Metadata> {
  const city = await getNetanyaCity()
  const category = await getCategoryBySlug(categorySlug)
  const neighborhood =
    neighborhoodSlug === 'all'
      ? null
      : await getNeighborhoodBySlug('netanya', neighborhoodSlug)

  if (!city || !category) {
    return {
      title: 'Search Results',
    }
  }

  // Get subcategory if provided in search params (ensure it's valid or null)
  const subcategorySlug = searchParams?.subcategory
  const subcategory = subcategorySlug
    ? category.subcategories?.find(s => s.slug === subcategorySlug) || null
    : null

  const categoryName = locale === 'he' ? category.name_he : category.name_ru
  const neighborhoodName = neighborhood
    ? locale === 'he'
      ? neighborhood.name_he
      : neighborhood.name_ru
    : locale === 'he'
      ? 'כל נתניה'
      : 'Вся Нетания'

  const totalCount = await getSearchResultsCount({
    categoryId: category.id,
    subcategoryId: subcategory?.id,
    neighborhoodId: neighborhood?.id,
    cityId: city.id,
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'
  const url = `${baseUrl}/${locale}/search/${categorySlug}/${neighborhoodSlug}`

  const title = locale === 'he'
    ? `${categoryName} ב${neighborhoodName} - ${totalCount} תוצאות`
    : `${categoryName} в ${neighborhoodName} - ${totalCount} результатов`

  const description = locale === 'he'
    ? `מצא את ה${categoryName} הכי טובים ב${neighborhoodName}, נתניה. ${totalCount} עסקים מומלצים עם ביקורות אמיתיות.`
    : `Найдите лучших ${categoryName} в ${neighborhoodName}, Нетания. ${totalCount} рекомендуемых предприятий с настоящими отзывами.`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        he: `${baseUrl}/he/search/${categorySlug}/${neighborhoodSlug}`,
        ru: `${baseUrl}/ru/search/${categorySlug}/${neighborhoodSlug}`,
        'x-default': `${baseUrl}/he/search/${categorySlug}/${neighborhoodSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Netanya Local',
      locale: locale === 'he' ? 'he_IL' : 'ru_RU',
      alternateLocale: locale === 'he' ? 'ru_RU' : 'he_IL',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Netanya Local',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function SearchResultsPage({
  params: { locale, category: categorySlug, neighborhood: neighborhoodSlug },
  searchParams,
}: SearchResultsPageProps) {
  const t = await getTranslations('results')

  // Wrap all database queries in try-catch
  let city, category, neighborhood

  try {
    // Get city (Netanya)
    city = await getNetanyaCity()
    if (!city) notFound()

    // Get category
    category = await getCategoryBySlug(categorySlug)
    if (!category) notFound()

    // Get neighborhood (or null for "all Netanya")
    neighborhood =
      neighborhoodSlug === 'all'
        ? null
        : await getNeighborhoodBySlug('netanya', neighborhoodSlug)

    if (neighborhoodSlug !== 'all' && !neighborhood) notFound()
  } catch (error) {
    console.error('Database error in search page:', error)
    // Return a user-friendly error page
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-8 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-800">
            {locale === 'he' ? 'שגיאה בטעינת התוצאות' : 'Ошибка загрузки результатов'}
          </h1>
          <p className="mb-6 text-red-600">
            {locale === 'he'
              ? 'אנא נסה שוב מאוחר יותר או חזור לדף הבית'
              : 'Пожалуйста, попробуйте позже или вернитесь на главную'}
          </p>
          <a
            href={`/${locale}`}
            className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
          >
            {locale === 'he' ? 'חזרה לדף הבית' : 'На главную'}
          </a>
        </div>
      </div>
    )
  }

  // Get subcategory slug from query params
  const subcategorySlug = searchParams.subcategory

  // Find subcategory if provided (validate it exists)
  const subcategory = subcategorySlug
    ? category.subcategories?.find(s => s.slug === subcategorySlug) || null
    : null

  // If subcategory slug is provided but not found, redirect without it
  if (subcategorySlug && !subcategory) {
    // Invalid subcategory - redirect to search without subcategory param
    redirect(`/${locale}/search/${categorySlug}/${neighborhoodSlug}`)
  }

  // Initialize search results variables
  let businesses: Awaited<ReturnType<typeof getSearchResults>> = []
  let primaryFallbackBusinesses: Awaited<ReturnType<typeof getSearchResults>> = []
  let secondaryFallbackBusinesses: Awaited<ReturnType<typeof getSearchResults>> = []
  let hasPrimaryFallback = false
  let hasSecondaryFallback = false
  let totalCount = 0

  try {
    // First, try to get results with subcategory filter
    businesses = await getSearchResults({
      categoryId: category.id,
      subcategoryId: subcategory?.id,
      neighborhoodId: neighborhood?.id,
      cityId: city.id,
      locale,
    })

    // If no results with subcategory in neighborhood, implement two-tier fallback
    if (businesses.length === 0 && subcategory && neighborhood) {
      // PRIMARY FALLBACK: Same subcategory + All city (intent priority)
      primaryFallbackBusinesses = await getSearchResults({
        categoryId: category.id,
        subcategoryId: subcategory.id, // Keep subcategory
        neighborhoodId: undefined, // Expand to all city
        cityId: city.id,
        locale,
      })
      hasPrimaryFallback = primaryFallbackBusinesses.length > 0

      // SECONDARY FALLBACK: Other subcategories + Same neighborhood (location priority)
      secondaryFallbackBusinesses = await getSearchResults({
        categoryId: category.id,
        subcategoryId: undefined, // Remove subcategory filter
        neighborhoodId: neighborhood.id, // Keep neighborhood
        cityId: city.id,
        locale,
      })
      hasSecondaryFallback = secondaryFallbackBusinesses.length > 0
    }

    // Get total count (with current filters)
    totalCount = await getSearchResultsCount({
      categoryId: category.id,
      subcategoryId: subcategory?.id,
      neighborhoodId: neighborhood?.id,
      cityId: city.id,
    })
  } catch (searchError) {
    console.error('Error fetching search results:', searchError)
    // Continue with empty results rather than crashing
  }

  const categoryName = locale === 'he' ? category.name_he : category.name_ru
  const subcategoryName = subcategory
    ? locale === 'he' ? subcategory.name_he : subcategory.name_ru
    : null
  const neighborhoodName = neighborhood
    ? locale === 'he'
      ? neighborhood.name_he
      : neighborhood.name_ru
    : locale === 'he'
    ? 'כל נתניה'
    : 'Вся Нетания'

  // Display name - category only (subcategory shown separately)
  const displayName = categoryName

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: locale === 'he' ? 'בית' : 'Главная',
      href: `/${locale}`,
    },
    {
      label: categoryName,
      href: `/${locale}/search/${categorySlug}/${neighborhoodSlug}`,
    },
    ...(neighborhood
      ? [
          {
            label: neighborhoodName,
            href: `/${locale}/search/${categorySlug}/${neighborhoodSlug}`,
          },
        ]
      : []),
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} locale={locale} />

      {/* Header - Compact on mobile */}
      <div className="mb-4 md:mb-8">
        <BackButton href={`/${locale}`} locale={locale} label={t('back')} />
        <h1 className="mb-1 text-2xl font-bold md:mb-2 md:text-3xl">
          {displayName} {locale === 'he' ? 'ב' : 'в '}{neighborhoodName}
        </h1>

        {/* Subcategory Badge */}
        {subcategoryName && !hasPrimaryFallback && !hasSecondaryFallback && (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <span>{subcategoryName}</span>
            </span>
          </div>
        )}

        {!hasPrimaryFallback && !hasSecondaryFallback && (
          <p className="text-sm text-gray-600 md:text-base">
            {t('results', { count: totalCount })}
          </p>
        )}
      </div>

      {/* Two-Tier Fallback System */}
      {(hasPrimaryFallback || hasSecondaryFallback) && subcategoryName && neighborhood && (
        <>
          {/* Alert Banner - No results in original search */}
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  {locale === 'he'
                    ? `לא נמצאו תוצאות עבור "${subcategoryName}" ב${neighborhoodName}`
                    : `Не найдено результатов для "${subcategoryName}" в ${neighborhoodName}`}
                </p>
              </div>
            </div>
          </div>

          {/* PRIMARY FALLBACK: Same subcategory + All city */}
          {hasPrimaryFallback && (
            <div className="mb-8">
              {/* Section Header */}
              <div className="mb-4 flex items-center gap-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-blue-900">
                    {subcategoryName} {locale === 'he' ? 'בכל נתניה' : 'во всей Нетании'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {locale === 'he'
                      ? `מציג ${primaryFallbackBusinesses.length} תוצאות`
                      : `Показано ${primaryFallbackBusinesses.length} результатов`}
                  </p>
                </div>
              </div>

              {/* Primary Results Grid */}
              <SearchResultsClient
                businesses={primaryFallbackBusinesses}
                locale={locale}
                showSubcategories={false}
                showNeighborhoodBadges={true}
              />
            </div>
          )}

          {/* SECONDARY FALLBACK: Other subcategories + Same neighborhood */}
          {hasSecondaryFallback && (
            <details className="group mb-8" open={!hasPrimaryFallback}>
              <summary className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 transition hover:bg-purple-100">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-purple-900">
                    {locale === 'he'
                      ? `עסקים נוספים בקטגוריית "${categoryName}" ב${neighborhoodName}`
                      : `Дополнительные предприятия в категории "${categoryName}" в ${neighborhoodName}`}
                  </p>
                  <p className="text-sm text-purple-700">
                    {locale === 'he'
                      ? `${secondaryFallbackBusinesses.length} תוצאות זמינות`
                      : `${secondaryFallbackBusinesses.length} результатов доступно`}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-600 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>

              {/* Secondary Results Grid */}
              <div className="rounded-lg border-2 border-purple-200 bg-white p-4">
                <SearchResultsClient
                  businesses={secondaryFallbackBusinesses}
                  locale={locale}
                  showSubcategories={true}
                  showNeighborhoodBadges={false}
                />
              </div>
            </details>
          )}
        </>
      )}

      {/* No Results - Improved Empty State - Only show if no fallback results either */}
      {businesses.length === 0 && !hasPrimaryFallback && !hasSecondaryFallback && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 py-12 text-center sm:p-12 sm:py-16">
          {/* Icon */}
          <div className="mb-6 rounded-full bg-gray-100 p-6">
            <svg
              className="h-16 w-16 text-gray-400 sm:h-20 sm:w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
              />
            </svg>
          </div>

          {/* Message */}
          <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
            {t('noResults')}
          </h3>
          <p className="mb-6 max-w-md text-sm text-gray-600 sm:text-base">
            {locale === 'he'
              ? `לא מצאנו ${categoryName.toLowerCase()} ב${neighborhoodName}. נסה לחפש בכל העיר או לבחור קטגוריה אחרת.`
              : `Мы не нашли ${categoryName.toLowerCase()} в ${neighborhoodName}. Попробуйте поискать по всему городу или выберите другую категорию.`}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {neighborhood && (
              <Link
                href={`/${locale}/search/${categorySlug}/all${subcategorySlug ? `?subcategory=${subcategorySlug}` : ''}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-primary-700 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span>{t('searchAllCity')}</span>
              </Link>
            )}
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span>{locale === 'he' ? 'חזור לעמוד הבית' : 'Вернуться на главную'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Normal Results with Filtering/Sorting (when not in fallback mode) */}
      {businesses.length > 0 && !hasPrimaryFallback && !hasSecondaryFallback && (
        <SearchResultsClient
          businesses={businesses}
          locale={locale}
          showSubcategories={false}
          showNeighborhoodBadges={false}
        />
      )}
    </div>
  )
}
