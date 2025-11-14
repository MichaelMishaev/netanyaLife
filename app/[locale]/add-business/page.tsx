import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods } from '@/lib/queries/neighborhoods'
import AddBusinessForm from '@/components/client/AddBusinessForm'

interface AddBusinessPageProps {
  params: {
    locale: string
  }
}

export default async function AddBusinessPage({
  params: { locale },
}: AddBusinessPageProps) {
  const t = useTranslations('addBusiness')
  const tCommon = useTranslations('common')

  // Fetch categories and neighborhoods for the form
  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(),
  ])

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/${locale}`}
        className="mb-4 inline-block text-primary-600 hover:text-primary-700"
      >
        ← {tCommon('back')}
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl rounded-lg border bg-white p-8">
        <AddBusinessForm
          categories={categories}
          neighborhoods={neighborhoods}
          locale={locale}
        />
      </div>
    </main>
  )
}
