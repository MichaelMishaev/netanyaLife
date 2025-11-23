import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import CategoriesListWithSearch from '@/components/client/CategoriesListWithSearch'
import CategoryForm from '@/components/client/CategoryForm'
import { isSuperAdmin } from '@/lib/auth'

interface AdminCategoriesPageProps {
  params: {
    locale: string
  }
}

export default async function AdminCategoriesPage({
  params: { locale },
}: AdminCategoriesPageProps) {
  const t = await getTranslations('admin.categories')
  const isSuper = await isSuperAdmin()

  // Fetch all categories (active and inactive) with subcategories and businesses
  const categories = await prisma.category.findMany({
    orderBy: { display_order: 'asc' },
    include: {
      subcategories: {
        orderBy: { display_order: 'asc' },
      },
      businesses: {
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          name_he: true,
          name_ru: true,
          subcategory_id: true,
          is_visible: true,
          subcategory: {
            select: {
              name_he: true,
              name_ru: true,
            },
          },
        },
        orderBy: {
          name_he: 'asc',
        },
      },
      _count: {
        select: {
          businesses: true,
        },
      },
    },
  })

  // Get next display order
  const maxOrder = await prisma.category.findFirst({
    orderBy: { display_order: 'desc' },
    select: { display_order: true },
  })
  const nextDisplayOrder = (maxOrder?.display_order || 0) + 1

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'he' ? 'ניהול קטגוריות' : 'Управление категориями'}
          </h1>
          <p className="text-gray-600">
            {locale === 'he'
              ? `${categories.length} קטגוריות כולל`
              : `Всего ${categories.length} категорий`}
          </p>
        </div>

        {/* Add Category Button */}
        <CategoryForm
          locale={locale}
          mode="create"
          nextDisplayOrder={nextDisplayOrder}
        />
      </div>

      {/* Categories List with Search */}
      <CategoriesListWithSearch
        categories={categories}
        locale={locale}
        isSuperAdmin={isSuper}
      />
    </div>
  )
}
