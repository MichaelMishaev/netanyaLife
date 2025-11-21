import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
      is_active: true,
      display_order: true,
    },
  })

  console.log('\n=== Active Neighborhoods ===')
  console.log(`Total count: ${neighborhoods.length}\n`)

  neighborhoods.forEach((hood, idx) => {
    console.log(`${idx + 1}. ${hood.name_he} (${hood.name_ru})`)
    console.log(`   Slug: ${hood.slug}`)
    console.log(`   Order: ${hood.display_order}`)
    console.log(`   Active: ${hood.is_active}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
