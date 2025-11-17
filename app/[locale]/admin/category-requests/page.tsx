import { prisma } from '@/lib/prisma'
import CategoryRequestCard from '@/components/client/CategoryRequestCard'

interface AdminCategoryRequestsPageProps {
  params: {
    locale: string
  }
}

export default async function AdminCategoryRequestsPage({
  params: { locale },
}: AdminCategoryRequestsPageProps) {
  // Get pending category requests
  const pendingRequests = await prisma.categoryRequest.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  // Get approved/rejected requests for reference
  const processedRequests = await prisma.categoryRequest.findMany({
    where: {
      status: {
        in: ['APPROVED', 'REJECTED'],
      },
    },
    orderBy: {
      reviewed_at: 'desc',
    },
    take: 20, // Show last 20 processed
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {locale === 'he' ? 'בקשות קטגוריות חדשות' : 'Запросы новых категорий'}
        </h1>
        <div className="rounded-lg bg-yellow-100 px-4 py-2 font-medium text-yellow-800">
          {pendingRequests.length} {locale === 'he' ? 'ממתינות' : 'ожидают'}
        </div>
      </div>

      {/* Pending Requests */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {locale === 'he' ? 'ממתינות לטיפול' : 'Ожидают обработки'}
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center">
            <p className="text-lg text-gray-600">
              {locale === 'he' ? 'אין בקשות ממתינות' : 'Нет ожидающих запросов'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map((request) => (
              <CategoryRequestCard
                key={request.id}
                request={request}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            {locale === 'he' ? 'טופלו לאחרונה' : 'Недавно обработанные'}
          </h2>

          <div className="space-y-4">
            {processedRequests.map((request) => (
              <div
                key={request.id}
                className={`rounded-lg border p-4 ${
                  request.status === 'APPROVED'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {request.category_name_he}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          request.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status === 'APPROVED'
                          ? (locale === 'he' ? 'אושר' : 'Одобрено')
                          : (locale === 'he' ? 'נדחה' : 'Отклонено')}
                      </span>
                    </div>

                    {request.category_name_ru && (
                      <p className="mt-1 text-sm text-gray-600">
                        {locale === 'he' ? 'ברוסית:' : 'На русском:'} {request.category_name_ru}
                      </p>
                    )}

                    {request.description && (
                      <p className="mt-2 text-sm text-gray-700">{request.description}</p>
                    )}

                    {request.admin_notes && (
                      <div className="mt-3 rounded-lg bg-white p-3">
                        <p className="text-xs font-medium text-gray-500">
                          {locale === 'he' ? 'הערות אדמין:' : 'Заметки администратора:'}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">{request.admin_notes}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {locale === 'he' ? 'נשלח:' : 'Отправлено:'}{' '}
                        {new Date(request.created_at).toLocaleDateString(locale === 'he' ? 'he-IL' : 'ru-RU')}
                      </span>
                      {request.reviewed_at && (
                        <span>
                          {locale === 'he' ? 'נבדק:' : 'Проверено:'}{' '}
                          {new Date(request.reviewed_at).toLocaleDateString(locale === 'he' ? 'he-IL' : 'ru-RU')}
                        </span>
                      )}
                      {request.reviewed_by && (
                        <span>
                          {locale === 'he' ? 'על ידי:' : 'Кем:'} {request.reviewed_by}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
