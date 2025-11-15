import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AdminBusinessForm from '@/components/client/AdminBusinessForm'

interface AdminNewBusinessPageProps {
  params: {
    locale: string
  }
}

export default async function AdminNewBusinessPage({
  params: { locale },
}: AdminNewBusinessPageProps) {
  const t = await getTranslations('admin.businesses')

  // Get categories and neighborhoods for the form
  const [categories, neighborhoods] = await Promise.all([
    prisma.category.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' },
    }),
    prisma.neighborhood.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' },
    }),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          {locale === 'he' ? 'הוסף עסק חדש' : 'Добавить новый бизнес'}
        </h1>
        <p className="text-gray-600">
          {locale === 'he'
            ? 'צור עסק חדש ישירות (עוקף את תור האישור)'
            : 'Создать бизнес напрямую (минуя очередь одобрения)'}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-8">
        <AdminBusinessForm
          categories={categories}
          neighborhoods={neighborhoods}
          locale={locale}
        />
      </div>
    </div>
  )
}
