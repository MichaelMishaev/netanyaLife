import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find the "merkaz-tsafon" neighborhood
  const centerNorth = await prisma.neighborhood.findFirst({
    where: { slug: 'merkaz-tsafon' },
  })

  if (!centerNorth) {
    console.log('❌ merkaz-tsafon neighborhood not found')
    return
  }

  console.log('Found neighborhood:', centerNorth.name_he, `(${centerNorth.slug})`)

  // Update to just "merkaz"
  const updated = await prisma.neighborhood.update({
    where: { id: centerNorth.id },
    data: {
      name_he: 'מרכז',
      name_ru: 'Центр',
      slug: 'merkaz',
    },
  })

  console.log('\n✅ Updated neighborhood:')
  console.log('   Name HE:', updated.name_he)
  console.log('   Name RU:', updated.name_ru)
  console.log('   Slug:', updated.slug)

  // Show all neighborhoods
  const all = await prisma.neighborhood.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
  })

  console.log('\n=== All Active Neighborhoods ===')
  all.forEach((hood) => {
    console.log(`${hood.display_order}. ${hood.name_he} (${hood.slug})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
