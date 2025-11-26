import { getTranslations } from 'next-intl/server'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import SearchForm from '@/components/client/SearchForm'
import RecentlyViewed from '@/components/client/RecentlyViewed'
import HomepageStats from '@/components/server/HomepageStats'
import PopularCategoryCard from '@/components/client/PopularCategoryCard'
import Link from 'next/link'
import { getCategoryIcon } from '@/lib/utils/categoryIcons'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'
  const url = `${baseUrl}/${locale}`

  const title =
    locale === 'he'
      ? 'קהילת נתניה - מדריך עסקים מקומיים בנתניה | חיפוש לפי שכונות'
      : 'Сообщество Нетании - Местный бизнес-справочник Нетании | Поиск по районам'

  const description =
    locale === 'he'
      ? 'מצאו עסקים ושירותים מקומיים בנתניה לפי שכונות: צפון, מרכז, דרום, מזרח. חשמלאים, אינסטלטורים, מורי נהיגה ועוד. חיפוש מהיר ונוח במדריך המקיף של נתניה.'
      : 'Найдите местные предприятия и услуги в Нетании по районам: Север, Центр, Юг, Восток города. Электрики, сантехники, инструкторы по вождению и многое другое. Быстрый и удобный поиск в полном справочнике Нетании.'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        he: `${baseUrl}/he`,
        ru: `${baseUrl}/ru`,
        'x-default': `${baseUrl}/he`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании',
      locale: locale === 'he' ? 'he_IL' : 'ru_RU',
      alternateLocale: locale === 'he' ? 'ru_RU' : 'he_IL',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании',
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

export default async function Home({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('home')

  // Fetch data for search form
  const city = await getNetanyaCity()
  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(city!.id),
  ])

  // Get popular categories (is_popular = true, limit 6)
  const popularCategories = categories.filter(cat => cat.is_popular).slice(0, 6)

  return (
    <>
      {/* Hero Section - Simplified Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Simplified decorative element - single subtle circle */}
        <div className="absolute top-20 end-20 h-64 w-64 rounded-full bg-primary-100/40 blur-2xl" aria-hidden="true" />

        <div className="container relative mx-auto px-4 py-12 md:py-20">
          {/* Hero Section */}
          <section className="mb-10 text-center animate-fade-in">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl text-primary-700">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-gray-700 md:text-xl mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('hero.subtitle')}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{t('trustBadges.verified')}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{t('trustBadges.local')}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{t('trustBadges.noAds')}</span>
              </div>
            </div>
          </section>

          {/* Search Section with Card */}
          <section className="mb-10 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 md:p-8">
              <SearchForm
                categories={categories}
                neighborhoods={neighborhoods}
                locale={locale}
              />
            </div>
          </section>

          {/* Homepage Stats Section */}
          <section className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <HomepageStats locale={locale} />
          </section>
        </div>
      </div>

      {/* Main Content Area - White Background */}
      <div className="bg-white">
        <div className="container mx-auto px-4">

          {/* Popular Categories Section */}
          {popularCategories.length > 0 && (
            <section className="py-12 md:py-16">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                  {t('categories.title')}
                </h2>
                <p className="text-gray-600">
                  {t('categories.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {popularCategories.map((category) => {
                  const icon = getCategoryIcon(category.slug)
                  const name = locale === 'he' ? category.name_he : category.name_ru

                  return (
                    <PopularCategoryCard
                      key={category.id}
                      categoryId={category.id}
                      categorySlug={category.slug}
                      categoryName={name}
                      icon={icon}
                      locale={locale}
                      defaultNeighborhoodSlug={neighborhoods[0]?.slug || ''}
                    />
                  )
                })}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href={`/${locale}/categories`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  {t('categories.viewAll')}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'he' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </Link>
              </div>
            </section>
          )}

          {/* Recently Viewed Section */}
          <section className="py-12">
            <RecentlyViewed locale={locale} />
          </section>

          {/* Testimonials Section */}
          <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                {t('testimonials.title')}
              </h2>
              <p className="text-gray-600">
                {t('testimonials.subtitle')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 text-gray-700">
                  &ldquo;{t('testimonials.testimonial1.text')}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">
                    {t('testimonials.testimonial1.author')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('testimonials.testimonial1.location')}
                  </p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 text-gray-700">
                  &ldquo;{t('testimonials.testimonial2.text')}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">
                    {t('testimonials.testimonial2.author')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('testimonials.testimonial2.location')}
                  </p>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 text-gray-700">
                  &ldquo;{t('testimonials.testimonial3.text')}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">
                    {t('testimonials.testimonial3.author')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('testimonials.testimonial3.location')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
