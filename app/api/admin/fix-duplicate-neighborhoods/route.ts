import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API endpoint to fix duplicate neighborhood names
 * Admin only - should be secured in production
 */
export async function POST(request: Request) {
  try {
    // Get all neighborhoods with duplicate Hebrew names
    const neighborhoods = await prisma.neighborhood.findMany({
      where: { name_he: 'מזרח' }
    })

    if (neighborhoods.length < 2) {
      return NextResponse.json({
        success: true,
        message: 'No duplicates found',
        neighborhoods: await prisma.neighborhood.findMany({
          orderBy: { name_he: 'asc' }
        })
      })
    }

    // Find the one with slug "mizrah-hair" - it should be "מזרח העיר"
    const eastCity = neighborhoods.find(n => n.slug === 'mizrah-hair')

    if (!eastCity) {
      return NextResponse.json({
        success: false,
        error: 'Could not find neighborhood with slug mizrah-hair',
        neighborhoods: neighborhoods
      }, { status: 404 })
    }

    // Update it to "מזרח העיר"
    const updated = await prisma.neighborhood.update({
      where: { id: eastCity.id },
      data: {
        name_he: 'מזרח העיר',
        updated_at: new Date()
      }
    })

    // Get all neighborhoods for verification
    const allNeighborhoods = await prisma.neighborhood.findMany({
      orderBy: { name_he: 'asc' }
    })

    return NextResponse.json({
      success: true,
      message: 'Updated מזרח to מזרח העיר successfully',
      updated: {
        id: updated.id,
        name_he: updated.name_he,
        name_ru: updated.name_ru,
        slug: updated.slug
      },
      allNeighborhoods: allNeighborhoods.map(n => ({
        id: n.id.substring(0, 8),
        name_he: n.name_he,
        name_ru: n.name_ru,
        slug: n.slug
      }))
    })

  } catch (error) {
    console.error('Error fixing duplicate neighborhoods:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
