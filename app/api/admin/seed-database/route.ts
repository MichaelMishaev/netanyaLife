import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get API key from header (simple auth)
    const apiKey = request.headers.get('x-api-key')

    if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== 'admin123456') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🌱 Starting database seed...')

    // 1. Seed city
    const city = await prisma.city.upsert({
      where: { slug: 'netanya' },
      update: {},
      create: {
        name_he: 'נתניה',
        name_ru: 'Нетания',
        slug: 'netanya',
      },
    })
    console.log('✅ City seeded:', city.slug)

    // 2. Seed neighborhoods
    const neighborhoodsData = [
      { name_he: 'מרכז', name_ru: 'Центр', name_en: 'Center', slug: 'merkaz' },
      { name_he: 'צפון', name_ru: 'Север', name_en: 'North', slug: 'tsafon' },
      { name_he: 'דרום', name_ru: 'Юг', name_en: 'South', slug: 'darom' },
      { name_he: 'מזרח העיר', name_ru: 'Восток города', name_en: 'East', slug: 'mizrah-hair' },
    ]

    for (const neighborhood of neighborhoodsData) {
      await prisma.neighborhood.upsert({
        where: {
          city_id_slug: {
            city_id: city.id,
            slug: neighborhood.slug,
          },
        },
        update: {},
        create: {
          ...neighborhood,
          city_id: city.id,
        },
      })
    }
    console.log(`✅ ${neighborhoodsData.length} neighborhoods seeded`)

    // 3. Seed categories (basic set)
    const categoriesData = [
      { name_he: 'חשמלאים', name_ru: 'Электрики', name_en: 'Electricians', slug: 'hashmalayim' },
      { name_he: 'אינסטלטורים', name_ru: 'Сантехники', name_en: 'Plumbers', slug: 'instalatorim' },
      { name_he: 'מורי נהיגה', name_ru: 'Инструкторы по вождению', name_en: 'Driving Instructors', slug: 'morei-nehiga' },
      { name_he: 'מסעדות', name_ru: 'Рестораны', name_en: 'Restaurants', slug: 'misadot' },
    ]

    for (const category of categoriesData) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          ...category,
          is_popular: true,
        },
      })
    }
    console.log(`✅ ${categoriesData.length} categories seeded`)

    // 4. Create admin settings if not exists
    await prisma.adminSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        top_pinned_count: 3,
      },
    })
    console.log('✅ Admin settings seeded')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        city: city.slug,
        neighborhoods: neighborhoodsData.length,
        categories: categoriesData.length,
      },
    })
  } catch (error) {
    console.error('❌ Seed failed:', error)
    return NextResponse.json(
      {
        error: 'Seed failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
