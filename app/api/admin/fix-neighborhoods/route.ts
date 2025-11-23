import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/admin/fix-neighborhoods - Update neighborhood names
export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const neighborhoods = [
      {
        slug: 'merkaz',
        name_he: 'מרכז',
        name_ru: 'Центр',
        description_he: 'מרכז העיר נתניה',
        description_ru: 'Центр города Нетания',
        display_order: 1,
      },
      {
        slug: 'tsafon',
        name_he: 'צפון',
        name_ru: 'Север',
        description_he: 'צפון נתניה',
        description_ru: 'Северная Нетания',
        display_order: 2,
      },
      {
        slug: 'darom',
        name_he: 'דרום',
        name_ru: 'Юг',
        description_he: 'דרום נתניה',
        description_ru: 'Южная Нетания',
        display_order: 3,
      },
      {
        slug: 'mizrah-hair',
        name_he: 'מזרח',
        name_ru: 'Восток города',
        description_he: 'מזרח נתניה',
        description_ru: 'Восточная Нетания',
        display_order: 4,
      },
    ]

    const results = []

    for (const hood of neighborhoods) {
      const updated = await prisma.neighborhood.updateMany({
        where: { slug: hood.slug },
        data: {
          name_he: hood.name_he,
          name_ru: hood.name_ru,
          description_he: hood.description_he,
          description_ru: hood.description_ru,
          display_order: hood.display_order,
        },
      })
      results.push({ slug: hood.slug, updated: updated.count })
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error fixing neighborhoods:', error)
    return NextResponse.json({ error: 'Failed to fix neighborhoods' }, { status: 500 })
  }
}
