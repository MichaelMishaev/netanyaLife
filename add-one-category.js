const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Adding one category...')

  try {
    const category = await prisma.category.create({
      data: {
        name_he: 'חשמלאים',
        name_ru: 'Электрики',
        slug: 'electricians',
        is_popular: true,
      },
    })
    console.log('✅ Category added:', category.slug)
  } catch (error) {
    console.error('❌ Error:', error.message)

    // Try to find existing categories
    const categories = await prisma.category.findMany()
    console.log(`Found ${categories.length} existing categories:`)
    categories.forEach(c => console.log(`  - ${c.name_he} (${c.slug})`))
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
