import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import PendingBusinessCard from '@/components/client/PendingBusinessCard'

interface AdminPendingPageProps {
  params: {
    locale: string
  }
}

export default async function AdminPendingPage({
  params: { locale },
}: AdminPendingPageProps) {
  const t = await getTranslations('admin.pending')

  // Get pending businesses
  const pending = await prisma.pendingBusiness.findMany({
    where: {
      status: 'pending',
    },
    include: {
      category: true,
      neighborhood: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="rounded-lg bg-yellow-100 px-4 py-2 font-medium text-yellow-800">
          {pending.length} {locale === 'he' ? 'ממתינים' : 'ожидают'}
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-lg text-gray-600">{t('noRequests')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.map((business) => (
            <PendingBusinessCard
              key={business.id}
              business={business}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}
