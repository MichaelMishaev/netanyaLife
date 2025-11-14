import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { getSearchResults, getSearchResultsCount } from '@/lib/queries/businesses'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getNeighborhoodBySlug, getNetanyaCity } from '@/lib/queries/neighborhoods'
import BusinessCard from '@/components/client/BusinessCard'

interface SearchResultsPageProps {
  params: {
    locale: string
    category: string
    neighborhood: string
  }
}

export default async function SearchResultsPage({
  params: { locale, category: categorySlug, neighborhood: neighborhoodSlug },
}: SearchResultsPageProps) {
  const t = useTranslations('results')

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

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}`}
          className="mb-4 inline-block text-primary-600 hover:text-primary-700"
        >
          ← {t('back')}
        </Link>
        <h1 className="mb-2 text-3xl font-bold">
          {categoryName} {locale === 'he' ? 'ב' : 'в '}{neighborhoodName}
        </h1>
        <p className="text-gray-600">
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

      {/* Results Grid */}
      {businesses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              locale={locale}
            />
          ))}
        </div>
      )}
    </main>
  )
}
