import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCategories } from '@/lib/queries/categories'
import AdminBusinessEditForm from '@/components/client/AdminBusinessEditForm'
import BackButton from '@/components/client/BackButton'

interface AdminEditBusinessPageProps {
  params: {
    locale: string
    id: string
  }
}

export default async function AdminEditBusinessPage({
  params: { locale, id },
}: AdminEditBusinessPageProps) {
  // Fetch the business with owner relation
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      neighborhood: true,
      owner: true,
    },
  })

  if (!business) {
    notFound()
  }

  // Get categories, neighborhoods, and business owners for the form
  const [categories, neighborhoods, businessOwners] = await Promise.all([
    getCategories(),
    prisma.neighborhood.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' },
    }),
    prisma.businessOwner.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <BackButton locale={locale} />
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
          businessOwners={businessOwners}
          locale={locale}
        />
      </div>
    </div>
  )
}
