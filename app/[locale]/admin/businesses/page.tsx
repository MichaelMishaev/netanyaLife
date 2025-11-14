import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import BusinessManagementCard from '@/components/client/BusinessManagementCard'

interface AdminBusinessesPageProps {
  params: {
    locale: string
  }
}

export default async function AdminBusinessesPage({
  params: { locale },
}: AdminBusinessesPageProps) {
  const t = useTranslations('admin.businesses')

  // Get all businesses (excluding soft-deleted)
  const businesses = await prisma.business.findMany({
    where: {
      deleted_at: null,
    },
    include: {
      category: true,
      neighborhood: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="rounded-lg bg-blue-100 px-4 py-2 font-medium text-blue-800">
          {businesses.length} {locale === 'he' ? 'עסקים' : 'предприятий'}
        </div>
      </div>

      {businesses.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-lg text-gray-600">
            {locale === 'he' ? 'אין עסקים עדיין' : 'Нет предприятий'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <BusinessManagementCard
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
