import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/check-subcategories
 * Find businesses without subcategory where their category has subcategories
 */
export async function GET() {
  try {
    // Get all categories that have subcategories
    const categoriesWithSubcategories = await prisma.category.findMany({
      where: {
        subcategories: {
          some: {},
        },
      },
      include: {
        subcategories: {
          select: {
            id: true,
            name_he: true,
            name_ru: true,
          },
        },
        businesses: {
          where: {
            subcategory_id: null,
            deleted_at: null,
          },
          select: {
            id: true,
            name_he: true,
            name_ru: true,
            is_visible: true,
          },
        },
      },
    })

    // Filter to only categories that have businesses without subcategories
    const results = categoriesWithSubcategories
      .filter((cat) => cat.businesses.length > 0)
      .map((cat) => ({
        category: cat.name_he,
        categoryId: cat.id,
        availableSubcategories: cat.subcategories.map((s) => s.name_he),
        businessesWithoutSubcategory: cat.businesses.map((b) => ({
          id: b.id,
          name: b.name_he,
          isVisible: b.is_visible,
        })),
        count: cat.businesses.length,
      }))

    const totalBusinesses = results.reduce((sum, r) => sum + r.count, 0)

    return NextResponse.json({
      message: 'Businesses without subcategory in categories that have subcategories',
      totalBusinessesNeedingSubcategory: totalBusinesses,
      categoriesAffected: results.length,
      details: results,
    })
  } catch (error) {
    console.error('Error checking subcategories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check subcategories' },
      { status: 500 }
    )
  }
}
