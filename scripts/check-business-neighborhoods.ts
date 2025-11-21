import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
    include: {
      businesses: {
        where: { is_visible: true },
        select: {
          id: true,
          name_he: true,
          category: {
            select: {
              name_he: true,
              slug: true,
            },
          },
        },
      },
    },
  })

  console.log('=== Businesses by Neighborhood ===\n')

  let totalBusinesses = 0

  neighborhoods.forEach((hood) => {
    const count = hood.businesses.length
    totalBusinesses += count

    console.log(`📍 ${hood.name_he} (${hood.slug})`)
    console.log(`   Total businesses: ${count}`)

    if (count > 0) {
      console.log('   Businesses:')
      hood.businesses.slice(0, 5).forEach((biz) => {
        console.log(`   - ${biz.name_he} (${biz.category?.name_he || 'No category'})`)
      })
      if (count > 5) {
        console.log(`   ... and ${count - 5} more`)
      }
    } else {
      console.log('   ⚠️  NO BUSINESSES IN THIS NEIGHBORHOOD')
    }
    console.log('')
  })

  console.log(`Total visible businesses across all neighborhoods: ${totalBusinesses}`)

  // Check for businesses without neighborhood
  const noNeighborhood = await prisma.business.findMany({
    where: {
      is_visible: true,
      neighborhood_id: { equals: null as unknown as string },
    },
  })

  if (noNeighborhood.length > 0) {
    console.log(`\n⚠️  WARNING: ${noNeighborhood.length} businesses have no neighborhood assigned!`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
