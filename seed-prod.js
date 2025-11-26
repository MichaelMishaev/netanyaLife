const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
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
      { name_he: 'מרכז', name_ru: 'Центр', slug: 'merkaz' },
      { name_he: 'צפון', name_ru: 'Север', slug: 'tsafon' },
      { name_he: 'דרום', name_ru: 'Юг', slug: 'darom' },
      { name_he: 'מזרח העיר', name_ru: 'Восток города', slug: 'mizrah-hair' },
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
      { name_he: 'חשמלאים', name_ru: 'Электрики', slug: 'hashmalayim' },
      { name_he: 'אינסטלטורים', name_ru: 'Сантехники', slug: 'instalatorim' },
      { name_he: 'מורי נהיגה', name_ru: 'Инструкторы по вождению', slug: 'morei-nehiga' },
      { name_he: 'מסעדות', name_ru: 'Рестораны', slug: 'misadot' },
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
      where: { key: 'top_pinned_count' },
      update: {},
      create: {
        key: 'top_pinned_count',
        value: '3',
        description: 'Number of pinned businesses to show first in search results',
      },
    })
    console.log('✅ Admin settings seeded')

    console.log('🎉 Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
