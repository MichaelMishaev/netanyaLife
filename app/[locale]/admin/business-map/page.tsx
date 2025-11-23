import { prisma } from '@/lib/prisma'
import BusinessMapDashboard from '@/components/client/BusinessMapDashboard'

interface BusinessMapPageProps {
  params: {
    locale: string
  }
}

export default async function BusinessMapPage({
  params: { locale },
}: BusinessMapPageProps) {
  // Get all businesses with full relations
  const businesses = await prisma.business.findMany({
    where: {
      deleted_at: null,
    },
    include: {
      category: true,
      subcategory: true,
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

  // Get all categories with business counts
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    include: {
      subcategories: {
        where: { is_active: true },
        select: {
          id: true,
          name_he: true,
          name_ru: true,
          _count: {
            select: {
              businesses: {
                where: { deleted_at: null },
              },
            },
          },
        },
      },
      _count: {
        select: {
          businesses: {
            where: { deleted_at: null },
          },
        },
      },
    },
    orderBy: { display_order: 'asc' },
  })

  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true },
    include: {
      _count: {
        select: {
          businesses: {
            where: { deleted_at: null },
          },
        },
      },
    },
    orderBy: { display_order: 'asc' },
  })

  // Get statistics by date
  const businessesByDate = await prisma.$queryRaw<
    { date: Date; count: bigint }[]
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM businesses
    WHERE deleted_at IS NULL
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 90
  `

  // Convert bigint to number for JSON serialization
  const dateStats = businessesByDate.map((item) => ({
    date: item.date.toISOString().split('T')[0],
    count: Number(item.count),
  }))

  // Get category IDs that have subcategories
  const categoryIdsWithSubcategories = new Set(
    categories.filter((c) => c.subcategories.length > 0).map((c) => c.id)
  )

  // Get summary stats
  const stats = {
    total: businesses.length,
    visible: businesses.filter((b) => b.is_visible).length,
    hidden: businesses.filter((b) => !b.is_visible).length,
    verified: businesses.filter((b) => b.is_verified).length,
    pinned: businesses.filter((b) => b.is_pinned).length,
    test: businesses.filter((b) => b.is_test).length,
    real: businesses.filter((b) => !b.is_test).length,
    withPhone: businesses.filter((b) => b.phone).length,
    withWhatsApp: businesses.filter((b) => b.whatsapp_number).length,
    withWebsite: businesses.filter((b) => b.website_url).length,
    thisWeek: businesses.filter((b) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(b.created_at) > weekAgo
    }).length,
    thisMonth: businesses.filter((b) => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return new Date(b.created_at) > monthAgo
    }).length,
    // Businesses missing subcategory (where category has subcategories)
    missingSubcategory: businesses.filter(
      (b) =>
        b.category_id &&
        categoryIdsWithSubcategories.has(b.category_id) &&
        !b.subcategory_id
    ).length,
  }

  // Transform data for client component
  const businessesData = businesses.map((b) => ({
    id: b.id,
    name_he: b.name_he,
    name_ru: b.name_ru,
    slug_he: b.slug_he,
    phone: b.phone,
    whatsapp_number: b.whatsapp_number,
    website_url: b.website_url,
    is_visible: b.is_visible,
    is_verified: b.is_verified,
    is_pinned: b.is_pinned,
    is_test: b.is_test,
    created_at: b.created_at.toISOString(),
    updated_at: b.updated_at.toISOString(),
    category_id: b.category_id,
    category_name: b.category
      ? locale === 'he'
        ? b.category.name_he
        : b.category.name_ru || b.category.name_he
      : null,
    subcategory_id: b.subcategory_id,
    subcategory_name: b.subcategory
      ? locale === 'he'
        ? b.subcategory.name_he
        : b.subcategory.name_ru || b.subcategory.name_he
      : null,
    neighborhood_id: b.neighborhood_id,
    neighborhood_name: locale === 'he'
      ? b.neighborhood.name_he
      : b.neighborhood.name_ru || b.neighborhood.name_he,
    reviews_count: b._count.reviews,
  }))

  const categoriesData = categories.map((c) => ({
    id: c.id,
    name_he: c.name_he,
    name_ru: c.name_ru,
    icon_name: c.icon_name,
    business_count: c._count.businesses,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      name_he: s.name_he,
      name_ru: s.name_ru,
      business_count: s._count.businesses,
    })),
  }))

  const neighborhoodsData = neighborhoods.map((n) => ({
    id: n.id,
    name_he: n.name_he,
    name_ru: n.name_ru,
    business_count: n._count.businesses,
  }))

  return (
    <BusinessMapDashboard
      locale={locale}
      businesses={businessesData}
      categories={categoriesData}
      neighborhoods={neighborhoodsData}
      dateStats={dateStats}
      stats={stats}
    />
  )
}
