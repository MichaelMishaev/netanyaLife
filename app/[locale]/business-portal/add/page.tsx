import { getTranslations } from 'next-intl/server'
import { getOwnerSession } from '@/lib/auth-owner.server'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import OwnerAddBusinessForm from '@/components/client/OwnerAddBusinessForm'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.addBusiness' })

  return {
    title: `${params.locale === 'he' ? 'הוסף עסק חדש' : 'Добавить бизнес'} | Netanya Local`,
  }
}

export default async function OwnerAddBusinessPage({ params }: PageProps) {
  const locale = params.locale
  const session = await getOwnerSession()

  if (!session) {
    return null // Layout will redirect to login
  }

  // Fetch categories and neighborhoods for the form
  const city = await getNetanyaCity()

  if (!city) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-800">
        {locale === 'he' ? 'שגיאה בטעינת הנתונים' : 'Ошибка загрузки данных'}
      </div>
    )
  }

  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(city.id),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'he' ? 'הוסף עסק חדש' : 'Добавить новый бизнес'}
          </h1>
          <p className="mt-2 text-gray-600">
            {locale === 'he'
              ? 'העסק שלך יופיע מיד באתר לאחר ההוספה'
              : 'Ваш бизнес появится на сайте сразу после добавления'}
          </p>
        </div>
        <Link
          href={`/${locale}/business-portal`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          {locale === 'he' ? 'חזרה ללוח הבקרה' : 'Назад к панели'}
        </Link>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-white p-4 md:p-8 shadow-sm">
        <OwnerAddBusinessForm
          categories={categories}
          neighborhoods={neighborhoods}
          cityId={city.id}
          locale={locale}
        />
      </div>
    </div>
  )
}
