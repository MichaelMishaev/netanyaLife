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
  const pendingEdit = result.pendingEdit

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'he' ? 'עריכת עסק' : 'Редактировать бизнес'}
        </h1>
        <p className="mt-2 text-gray-600">
          {locale === 'he' ? business.name_he : business.name_ru || business.name_he}
        </p>
      </div>

      {/* Important Notice */}
      <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900">
              {locale === 'he' ? 'חשוב לדעת' : 'Важно знать'}
            </h3>
            <p className="mt-1 text-sm text-yellow-800">
              {locale === 'he'
                ? 'כל שינוי שתבצע ישלח לאישור מנהל ויופיע באתר רק לאחר אישור. לא תראה את השינויים באופן מיידי.'
                : 'Все изменения будут отправлены на одобрение администратора и появятся на сайте только после одобрения. Вы не увидите изменения немедленно.'}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Edit Warning */}
      {pendingEdit && (
        <div className="rounded-lg border-2 border-orange-400 bg-orange-50 p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔔</div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900">
                {locale === 'he' ? 'יש לך כבר שינויים ממתינים לאישור!' : 'У вас уже есть изменения, ожидающие одобрения!'}
              </h3>
              <p className="mt-1 text-sm text-orange-800">
                {locale === 'he'
                  ? 'שים לב: שליחת שינויים חדשים תחליף את הבקשה הקודמת שלך. המנהל יראה רק את השינויים האחרונים שתשלח.'
                  : 'Внимание: отправка новых изменений заменит ваш предыдущий запрос. Администратор увидит только последние изменения, которые вы отправите.'}
              </p>
              <p className="mt-2 text-xs text-orange-700">
                {locale === 'he'
                  ? `נשלח לאישור ב: ${new Date(pendingEdit.created_at).toLocaleString(locale)}`
                  : `Отправлено на одобрение: ${new Date(pendingEdit.created_at).toLocaleString(locale)}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <BusinessEditForm locale={locale} business={business} />
      </div>
    </div>
  )
}
