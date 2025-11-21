import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Testing Neighborhood Filtering ===\n')

  // Get a category to test with
  const category = await prisma.category.findFirst({
    where: { is_active: true },
  })

  if (!category) {
    console.log('❌ No categories found')
    return
  }

  console.log(`Testing with category: ${category.name_he} (${category.slug})\n`)

  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
  })

  console.log('Testing each neighborhood button:\n')

  for (const hood of neighborhoods) {
    console.log(`\n📍 Testing: ${hood.name_he} (${hood.slug})`)
    console.log(`   URL would be: /he/search/${category.slug}/${hood.slug}`)

    // Count businesses in this neighborhood for this category
    const count = await prisma.business.count({
      where: {
        category_id: category.id,
        neighborhood_id: hood.id,
        is_visible: true,
        deleted_at: null,
      },
    })

    if (count === 0) {
      console.log(`   ⚠️  Result: NO BUSINESSES (will show "no results" page)`)

      // Check if there are businesses in this neighborhood but different category
      const totalInHood = await prisma.business.count({
        where: {
          neighborhood_id: hood.id,
          is_visible: true,
          deleted_at: null,
        },
      })

      if (totalInHood > 0) {
        console.log(`   ℹ️  Note: ${totalInHood} businesses exist in ${hood.name_he}, but in different categories`)
      } else {
        console.log(`   ℹ️  Note: NO businesses at all in ${hood.name_he}`)
      }
    } else {
      console.log(`   ✅ Result: ${count} businesses found`)

      // Show some examples
      const examples = await prisma.business.findMany({
        where: {
          category_id: category.id,
          neighborhood_id: hood.id,
          is_visible: true,
          deleted_at: null,
        },
        take: 3,
        select: {
          name_he: true,
        },
      })

      examples.forEach((biz) => {
        console.log(`      - ${biz.name_he}`)
      })
    }
  }

  console.log('\n\n=== Summary ===')
  console.log('Current Database State:')

  const totalBusinesses = await prisma.business.count({
    where: { is_visible: true, deleted_at: null },
  })

  console.log(`- Total visible businesses: ${totalBusinesses}`)

  for (const hood of neighborhoods) {
    const count = await prisma.business.count({
      where: {
        neighborhood_id: hood.id,
        is_visible: true,
        deleted_at: null,
      },
    })
    console.log(`- ${hood.name_he}: ${count} businesses`)
  }

  console.log('\n⚠️  RECOMMENDATION:')
  console.log('To properly test neighborhood filtering, you need to:')
  console.log('1. Add more test businesses in different neighborhoods')
  console.log('2. Use the admin panel to create businesses in each neighborhood')
  console.log('3. Or run a seed script to populate test data')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
