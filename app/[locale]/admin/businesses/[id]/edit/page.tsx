import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCategories } from '@/lib/queries/categories'
import AdminBusinessEditForm from '@/components/client/AdminBusinessEditForm'

interface AdminEditBusinessPageProps {
  params: {
    locale: string
    id: string
  }
}

export default async function AdminEditBusinessPage({
  params: { locale, id },
}: AdminEditBusinessPageProps) {
  // Fetch the business
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      neighborhood: true,
    },
  })

  if (!business) {
    notFound()
  }

  // Get categories and neighborhoods for the form
  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    prisma.neighborhood.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' },
    }),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href={`/${locale}/admin/business-map`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {locale === 'he' ? 'חזרה למפת עסקים' : 'Назад к карте бизнесов'}
        </Link>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          {locale === 'he' ? 'עריכת עסק' : 'Редактировать бизнес'}
        </h1>
        <p className="text-gray-600">{business.name_he}</p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-8">
        <AdminBusinessEditForm
          business={business}
          categories={categories}
          neighborhoods={neighborhoods}
          locale={locale}
        />
      </div>
    </div>
  )
}
