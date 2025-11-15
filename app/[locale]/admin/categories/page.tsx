import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import CategoryManagementCard from '@/components/client/CategoryManagementCard'
import CategoryForm from '@/components/client/CategoryForm'

interface AdminCategoriesPageProps {
  params: {
    locale: string
  }
}

export default async function AdminCategoriesPage({
  params: { locale },
}: AdminCategoriesPageProps) {
  const t = await getTranslations('admin.categories')

  // Fetch all categories (active and inactive)
  const categories = await prisma.category.findMany({
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

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryManagementCard
            key={category.id}
            category={category}
            locale={locale}
          />
        ))}

        {categories.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">
              {locale === 'he'
                ? 'אין קטגוריות עדיין. הוסף קטגוריה ראשונה!'
                : 'Категорий пока нет. Добавьте первую категорию!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
