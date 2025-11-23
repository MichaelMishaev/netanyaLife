import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getCategories() {
  return prisma.category.findMany({
    where: { is_active: true },
    include: {
      subcategories: {
        where: { is_active: true },
        orderBy: { display_order: 'asc' },
      },
      _count: {
        select: { businesses: true },
      },
    },
    orderBy: { display_order: 'asc' },
  })
}

export default async function TestCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Categories & Subcategories Test Page
        </h1>

        <div className="mb-4 rounded bg-blue-100 p-4 text-blue-800">
          Total Categories: <strong>{categories.length}</strong>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.name_he}
                  </h2>
                  <p className="text-sm text-gray-500">{category.name_ru}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {category._count.businesses} businesses
                  </span>
                  {category.is_popular && (
                    <span className="ml-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                      Popular
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-2 text-sm text-gray-600">
                <strong>Slug:</strong> {category.slug} | <strong>Icon:</strong>{' '}
                {category.icon_name || 'none'}
              </div>

              {category.subcategories.length > 0 ? (
                <div className="mt-4 border-t pt-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">
                    Subcategories ({category.subcategories.length}):
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                      >
                        <div className="font-medium text-gray-800">
                          {sub.name_he}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.name_ru}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          slug: {sub.slug}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 border-t pt-4 text-sm text-gray-500 italic">
                  No subcategories
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="rounded-lg bg-yellow-50 p-8 text-center text-yellow-800">
            No categories found in database
          </div>
        )}
      </div>
    </div>
  )
}
