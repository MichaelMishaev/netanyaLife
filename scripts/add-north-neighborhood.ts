import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get Netanya city
  const city = await prisma.city.findFirst({
    where: { slug: 'netanya' },
  })

  if (!city) {
    throw new Error('Netanya city not found in database')
  }

  console.log('Found city:', city.name_he)

  // Check if North already exists
  const existingNorth = await prisma.neighborhood.findFirst({
    where: {
      city_id: city.id,
      slug: 'tsafon',
    },
  })

  if (existingNorth) {
    console.log('צפון neighborhood already exists')
    return
  }

  // Add North neighborhood
  const north = await prisma.neighborhood.create({
    data: {
      city_id: city.id,
      name_he: 'צפון',
      name_ru: 'Север',
      slug: 'tsafon',
      is_active: true,
      display_order: 0, // First position
    },
  })

  console.log('\n✅ Added צפון (North) neighborhood:')
  console.log('   Name HE:', north.name_he)
  console.log('   Name RU:', north.name_ru)
  console.log('   Slug:', north.slug)
  console.log('   Display Order:', north.display_order)

  // Update display order for other neighborhoods
  await prisma.neighborhood.update({
    where: { id: (await prisma.neighborhood.findFirst({ where: { slug: 'merkaz-tsafon' } }))!.id },
    data: { display_order: 1 },
  })

  await prisma.neighborhood.update({
    where: { id: (await prisma.neighborhood.findFirst({ where: { slug: 'darom' } }))!.id },
    data: { display_order: 2 },
  })

  await prisma.neighborhood.update({
    where: { id: (await prisma.neighborhood.findFirst({ where: { slug: 'mizrach' } }))!.id },
    data: { display_order: 3 },
  })

  console.log('\n✅ Updated display order for all neighborhoods')

  // Show final list
  const allNeighborhoods = await prisma.neighborhood.findMany({
    where: { city_id: city.id, is_active: true },
    orderBy: { display_order: 'asc' },
  })

  console.log('\n=== Final Neighborhood List ===')
  allNeighborhoods.forEach((hood) => {
    console.log(`${hood.display_order}. ${hood.name_he} (${hood.slug})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
