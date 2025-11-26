import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import { getCategoryIcon } from '@/lib/utils/categoryIcons'
import { Metadata } from 'next'
import CategorySelectionGrid from '@/components/client/CategorySelectionGrid'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'
  const url = `${baseUrl}/${locale}/categories`

  const title =
    locale === 'he'
      ? 'כל הקטגוריות - קהילת נתניה'
      : 'Все категории - Сообщество Нетании'

  const description =
    locale === 'he'
      ? 'עיין בכל קטגוריות השירותים הזמינות בנתניה: חשמלאים, אינסטלטורים, מורי נהיגה, מסגרים ועוד. בחר קטגוריה ושכונה למציאת העסק המושלם.'
      : 'Просмотрите все доступные категории услуг в Нетании: электрики, сантехники, инструкторы по вождению, слесари и многое другое. Выберите категорию и район для поиска идеального бизнеса.'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        he: `${baseUrl}/he/categories`,
        ru: `${baseUrl}/ru/categories`,
        'x-default': `${baseUrl}/he/categories`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: locale === 'he' ? 'קהילת נתניה' : 'Сообщество Нетании',
      locale: locale === 'he' ? 'he_IL' : 'ru_RU',
      type: 'website',
    },
  }
}

export default async function CategoriesPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const city = await getNetanyaCity()
  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(city!.id),
  ])

  // Add icons to categories and sort alphabetically by Hebrew name
  const categoriesWithIcons = categories
    .map((category) => ({
      ...category,
      icon: getCategoryIcon(category.slug),
    }))
    .sort((a, b) => a.name_he.localeCompare(b.name_he, 'he'))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
            {locale === 'he' ? 'כל הקטגוריות' : 'Все категории'}
          </h1>
          <p className="text-lg text-gray-600">
            {locale === 'he'
              ? 'בחר קטגוריה ושכונה למציאת השירות שאתה צריך'
              : 'Выберите категорию и район для поиска нужной услуги'}
          </p>
        </div>

        {/* Categories Grid */}
        <CategorySelectionGrid
          categories={categoriesWithIcons}
          neighborhoods={neighborhoods}
          locale={locale}
        />
      </div>
    </div>
  )
}
