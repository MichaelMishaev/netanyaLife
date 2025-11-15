import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import NeighborhoodManagementCard from '@/components/client/NeighborhoodManagementCard'
import NeighborhoodForm from '@/components/client/NeighborhoodForm'

interface AdminNeighborhoodsPageProps {
  params: {
    locale: string
  }
}

export default async function AdminNeighborhoodsPage({
  params: { locale },
}: AdminNeighborhoodsPageProps) {
  const t = await getTranslations('admin.neighborhoods')

  // Get Netanya city (should be the only city)
  const city = await prisma.city.findFirst({
    where: { name_he: 'נתניה' },
  })

  if (!city) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6">
        <p className="text-red-800">
          {locale === 'he'
            ? 'שגיאה: עיר נתניה לא נמצאה במערכת'
            : 'Ошибка: Город Нетания не найден в системе'}
        </p>
      </div>
    )
  }

  // Fetch all neighborhoods for Netanya
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { city_id: city.id },
    orderBy: { display_order: 'asc' },
    include: {
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  })

  // Get next display order
  const maxOrder = await prisma.neighborhood.findFirst({
    where: { city_id: city.id },
    orderBy: { display_order: 'desc' },
    select: { display_order: true },
  })
  const nextDisplayOrder = (maxOrder?.display_order || 0) + 1

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'he' ? 'ניהול שכונות' : 'Управление районами'}
          </h1>
          <p className="text-gray-600">
            {locale === 'he'
              ? `${neighborhoods.length} שכונות בנתניה`
              : `${neighborhoods.length} районов в Нетании`}
          </p>
        </div>

        {/* Add Neighborhood Button */}
        <NeighborhoodForm
          locale={locale}
          mode="create"
          cityId={city.id}
          nextDisplayOrder={nextDisplayOrder}
        />
      </div>

      {/* Neighborhoods List */}
      <div className="space-y-4">
        {neighborhoods.map((neighborhood) => (
          <NeighborhoodManagementCard
            key={neighborhood.id}
            neighborhood={neighborhood}
            locale={locale}
            cityId={city.id}
          />
        ))}

        {neighborhoods.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">
              {locale === 'he'
                ? 'אין שכונות עדיין. הוסף שכונה ראשונה!'
                : 'Районов пока нет. Добавьте первый район!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
