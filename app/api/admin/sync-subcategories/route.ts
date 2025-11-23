import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/admin/sync-subcategories
 * Deletes subcategories for specific categories to sync prod with local
 *
 * This endpoint removes subcategories that exist on production but not locally.
 * Specifically targets: electricians (חשמלאים)
 */
export async function DELETE() {
  try {
    // Categories that should have NO subcategories (matching local DB)
    const categorySlugsToClean = [
      'electricians',      // חשמלאים
      'plumbers',          // אינסטלטורים
      'locksmiths',        // מסגרים
      'painters',          // צבעים
      'cleaning',          // נקיון
      'ac-technicians',    // טכנאי מזגנים
      'gardening',         // גנים ונוף
      'electricians-industrial', // מתקני חשמל ומים
      'carpenters',        // נגרים
      'tutors',            // מורים פרטיים
      'doctors',           // רופאים
    ]

    const results: { category: string; deleted: number }[] = []

    for (const slug of categorySlugsToClean) {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: { id: true, name_he: true },
      })

      if (category) {
        // First, unlink businesses from these subcategories
        await prisma.business.updateMany({
          where: {
            subcategory: {
              category_id: category.id,
            },
          },
          data: {
            subcategory_id: null,
          },
        })

        // Then delete the subcategories
        const deleted = await prisma.subcategory.deleteMany({
          where: {
            category_id: category.id,
          },
        })

        results.push({
          category: category.name_he,
          deleted: deleted.count,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subcategories synced with local database',
      results,
      totalDeleted: results.reduce((sum, r) => sum + r.deleted, 0),
    })
  } catch (error) {
    console.error('Error syncing subcategories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync subcategories' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/sync-subcategories
 * Preview what would be deleted
 */
export async function GET() {
  try {
    const categorySlugsToClean = [
      'electricians',
      'plumbers',
      'locksmiths',
      'painters',
      'cleaning',
      'ac-technicians',
      'gardening',
      'electricians-industrial',
      'carpenters',
      'tutors',
      'doctors',
    ]

    const preview: { category: string; subcategories: string[] }[] = []

    for (const slug of categorySlugsToClean) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          subcategories: {
            select: { name_he: true },
          },
        },
      })

      if (category && category.subcategories.length > 0) {
        preview.push({
          category: category.name_he,
          subcategories: category.subcategories.map((s) => s.name_he),
        })
      }
    }

    return NextResponse.json({
      message: 'Preview of subcategories that would be deleted',
      preview,
      totalToDelete: preview.reduce((sum, p) => sum + p.subcategories.length, 0),
    })
  } catch (error) {
    console.error('Error previewing sync:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to preview' },
      { status: 500 }
    )
  }
}
