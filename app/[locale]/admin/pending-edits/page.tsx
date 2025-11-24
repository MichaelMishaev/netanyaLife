import { getTranslations } from 'next-intl/server'
import { getPendingBusinessEdits } from '@/lib/actions/admin'
import PendingEditCard from '@/components/client/PendingEditCard'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `${params.locale === 'he' ? 'בקשות עריכה ממתינות' : 'Ожидающие редактирования'} | Admin`,
  }
}

export default async function AdminPendingEditsPage({ params }: PageProps) {
  const locale = params.locale
  const result = await getPendingBusinessEdits()

  if (result.error || !result.edits) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-800">
        {locale === 'he' ? 'שגיאה בטעינת הנתונים' : 'Ошибка загрузки данных'}
      </div>
    )
  }

  const pendingEdits = result.edits

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'he' ? 'בקשות עריכה ממתינות' : 'Ожидающие редактирования'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {locale === 'he'
              ? `${pendingEdits.length} בקשות עריכה ממתינות לאישור`
              : `${pendingEdits.length} запросов на редактирование ожидают одобрения`}
          </p>
        </div>
      </div>

      {/* Pending Edits List */}
      {pendingEdits.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          <p className="text-lg text-gray-600">
            {locale === 'he'
              ? 'אין בקשות עריכה ממתינות כרגע'
              : 'Нет ожидающих запросов на редактирование'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingEdits.map((edit) => (
            <PendingEditCard key={edit.id} edit={edit} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
