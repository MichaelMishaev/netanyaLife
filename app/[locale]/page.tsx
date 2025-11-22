import { getTranslations } from 'next-intl/server'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import SearchForm from '@/components/client/SearchForm'
import RecentlyViewed from '@/components/client/RecentlyViewed'
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
      ? 'Netanya Local - מדריך עסקים מקומיים בנתניה | חיפוש לפי שכונות'
      : 'Netanya Local - Местный бизнес-справочник Нетании | Поиск по районам'

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

  return (
    <>
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient">
        {/* Decorative floating elements */}
        <div className="absolute top-10 start-10 h-32 w-32 rounded-full bg-blue-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-20 end-20 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 start-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <section className="mb-12 text-center animate-fade-in">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-gray-700 md:text-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t('hero.subtitle')}
            </p>
          </section>

          {/* Search Section with Card */}
          <section className="mb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-full max-w-2xl rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl md:p-8">
              <SearchForm
                categories={categories}
                neighborhoods={neighborhoods}
                locale={locale}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Recently Viewed Section */}
      <div className="container mx-auto px-4 py-12">
        <RecentlyViewed locale={locale} />
      </div>
    </>
  )
}
