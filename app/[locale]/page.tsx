import { useTranslations } from 'next-intl'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import SearchForm from '@/components/client/SearchForm'

export default async function Home({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = useTranslations('home')

  // Fetch data for search form
  const city = await getNetanyaCity()
  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(city!.id),
  ])

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="text-lg text-gray-600 md:text-xl">
          {t('hero.subtitle')}
        </p>
      </section>

      {/* Search Section */}
      <section className="mb-16 flex justify-center">
        <SearchForm
          categories={categories}
          neighborhoods={neighborhoods}
          locale={locale}
        />
      </section>

      {/* Popular Categories - TODO: Add in next iteration */}
      <section className="text-center">
        <p className="text-sm text-gray-500">
          Popular categories coming soon...
        </p>
      </section>
    </main>
  )
}
