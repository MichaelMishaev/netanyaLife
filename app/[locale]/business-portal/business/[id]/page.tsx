import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getBusinessForEdit } from '@/lib/actions/business-owner'
import BusinessEditForm from '@/components/client/BusinessEditForm'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'businessOwner.dashboard' })

  return {
    title: `${params.locale === 'he' ? 'עריכת עסק' : 'Редактировать бизнес'} | Netanya Local`,
  }
}

export default async function BusinessEditPage({ params }: PageProps) {
  const locale = params.locale
  const businessId = params.id

  // Fetch business with ownership verification
  const result = await getBusinessForEdit(businessId)

  if (result.error) {
    redirect(`/${locale}/business-portal`)
  }

  const business = result.business!

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'he' ? 'עריכת עסק' : 'Редактировать бизнес'}
        </h1>
        <p className="mt-2 text-gray-600">
          {locale === 'he'
            ? 'עדכן את פרטי העסק שלך (שם וקטגוריה דורשים אישור מנהל)'
            : 'Обновите данные вашего бизнеса (название и категория требуют одобрения администратора)'}
        </p>
      </div>

      {/* Edit Form */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <BusinessEditForm locale={locale} business={business} />
      </div>
    </div>
  )
}
