import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get categories with subcategories
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    include: {
      subcategories: {
        where: { is_active: true },
        orderBy: { display_order: 'asc' }
      }
    },
    orderBy: { name_he: 'asc' }
  })

  console.log('\n📋 Categories with Subcategories:\n')

  categories.forEach(cat => {
    console.log(`\n${cat.name_he} (${cat.name_ru})`)
    console.log(`  Subcategories: ${cat.subcategories.length}`)

    cat.subcategories.forEach(sub => {
      console.log(`  - ${sub.name_he} (${sub.name_ru})`)
    })
  })

  console.log(`\n✅ Total categories: ${categories.length}`)
  console.log(`✅ Total subcategories: ${categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
