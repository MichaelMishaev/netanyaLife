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

  // Get search results with CRITICAL ordering logic
  const businesses = await getSearchResults({
    categoryId: category.id,
    neighborhoodId: neighborhood?.id,
    cityId: city.id,
    locale,
  })

  // Get total count
  const totalCount = await getSearchResultsCount({
    categoryId: category.id,
    neighborhoodId: neighborhood?.id,
    cityId: city.id,
  })

  const categoryName = locale === 'he' ? category.name_he : category.name_ru
  const neighborhoodName = neighborhood
    ? locale === 'he'
      ? neighborhood.name_he
      : neighborhood.name_ru
    : locale === 'he'
    ? 'כל נתניה'
    : 'Вся Нетания'

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
          {categoryName} {locale === 'he' ? 'ב' : 'в '}{neighborhoodName}
        </h1>
        <p className="text-sm text-gray-600 md:text-base">
          {totalCount} {t('results', { count: totalCount })}
        </p>
      </div>

      {/* No Results */}
      {businesses.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="mb-4 text-lg text-gray-600">{t('noResults')}</p>
          {neighborhood && (
            <Link
              href={`/${locale}/search/${categorySlug}/all`}
              className="inline-block rounded-lg bg-primary-600 px-6 py-2 text-white hover:bg-primary-700"
            >
              {t('searchAllCity')}
            </Link>
          )}
        </div>
      )}

      {/* Results with Filtering/Sorting */}
      {businesses.length > 0 && (
        <SearchResultsClient businesses={businesses} locale={locale} />
      )}
    </div>
  )
}
