import { notFound } from 'next/navigation'
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

  // Get city (Netanya)
  const city = await getNetanyaCity()
  if (!city) notFound()

  // Get category
  const category = await getCategoryBySlug(categorySlug)
  if (!category) notFound()

  // Get neighborhood (or null for "all Netanya")
  const neighborhood =
    neighborhoodSlug === 'all'
      ? null
      : await getNeighborhoodBySlug('netanya', neighborhoodSlug)

  if (neighborhoodSlug !== 'all' && !neighborhood) notFound()

  // Get subcategory slug from query params
  const subcategorySlug = searchParams.subcategory

  // Find subcategory if provided
  const subcategory = subcategorySlug
    ? category.subcategories?.find(s => s.slug === subcategorySlug)
    : null

  // First, try to get results with subcategory filter
  let businesses = await getSearchResults({
    categoryId: category.id,
    subcategoryId: subcategory?.id,
    neighborhoodId: neighborhood?.id,
    cityId: city.id,
    locale,
  })

  // Track if we auto-expanded the search (removed subcategory filter)
  let autoExpandedSubcategory = false

  // If no results with subcategory, auto-expand to show all category results
  if (businesses.length === 0 && subcategory) {
    businesses = await getSearchResults({
      categoryId: category.id,
      subcategoryId: undefined, // Remove subcategory filter
      neighborhoodId: neighborhood?.id,
      cityId: city.id,
      locale,
    })
    autoExpandedSubcategory = businesses.length > 0
  }

  // Get total count (with current filters)
  const totalCount = await getSearchResultsCount({
    categoryId: category.id,
    subcategoryId: autoExpandedSubcategory ? undefined : subcategory?.id,
    neighborhoodId: neighborhood?.id,
    cityId: city.id,
  })

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

  // Display name includes subcategory if selected
  const displayName = subcategoryName
    ? `${categoryName} - ${subcategoryName}`
    : categoryName

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
        <p className="text-sm text-gray-600 md:text-base">
          {totalCount} {t('results', { count: totalCount })}
        </p>
      </div>

      {/* Auto-Expanded Search Banner */}
      {autoExpandedSubcategory && subcategoryName && (
        <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            {/* Info Icon */}
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <div className="flex-1">
              <p className="font-medium text-blue-900">
                {locale === 'he'
                  ? `לא נמצאו תוצאות עבור "${subcategoryName}"`
                  : `Не найдено результатов для "${subcategoryName}"`
                }
              </p>
              <p className="mt-1 text-sm text-blue-800">
                {locale === 'he'
                  ? `מוצגים כל ה${categoryName} ב${neighborhoodName}`
                  : `Показаны все ${categoryName} в ${neighborhoodName}`
                }
              </p>
            </div>

            {/* Reapply Filter Link */}
            <Link
              href={`/${locale}/search/${categorySlug}/${neighborhoodSlug}?subcategory=${subcategorySlug}`}
              className="flex-shrink-0 text-sm font-medium text-blue-700 underline hover:text-blue-900"
            >
              {locale === 'he' ? 'חזור לסינון' : 'Вернуть фильтр'}
            </Link>
          </div>
        </div>
      )}

      {/* No Results - Improved Empty State */}
      {businesses.length === 0 && (
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
                href={`/${locale}/search/${categorySlug}/all`}
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

      {/* Results with Filtering/Sorting */}
      {businesses.length > 0 && (
        <SearchResultsClient businesses={businesses} locale={locale} />
      )}
    </div>
  )
}
