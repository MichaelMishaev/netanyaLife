import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Debugging מרכז Businesses ===\n')

  // Get מרכז neighborhood
  const merkaz = await prisma.neighborhood.findFirst({
    where: { slug: 'merkaz' },
  })

  if (!merkaz) {
    console.log('❌ מרכז neighborhood not found')
    return
  }

  console.log(`Found neighborhood: ${merkaz.name_he} (ID: ${merkaz.id})\n`)

  // Get all businesses in מרכז
  const businesses = await prisma.business.findMany({
    where: {
      neighborhood_id: merkaz.id,
    },
    include: {
      category: true,
      subcategory: true,
      neighborhood: true,
    },
  })

  console.log(`Total businesses in מרכז: ${businesses.length}\n`)

  businesses.forEach((biz, idx) => {
    console.log(`\n${idx + 1}. ${biz.name_he}`)
    console.log(`   ID: ${biz.id}`)
    console.log(`   Category: ${biz.category?.name_he || 'NONE'} (${biz.category?.slug || 'N/A'})`)
    console.log(`   Subcategory: ${biz.subcategory?.name_he || 'NONE'}`)
    console.log(`   Neighborhood: ${biz.neighborhood?.name_he} (${biz.neighborhood?.slug})`)
    console.log(`   is_visible: ${biz.is_visible}`)
    console.log(`   is_pinned: ${biz.is_pinned}`)
    console.log(`   is_test: ${biz.is_test}`)
    console.log(`   deleted_at: ${biz.deleted_at}`)
    console.log(`   slug_he: ${biz.slug_he}`)
    console.log(`   slug_ru: ${biz.slug_ru}`)
  })

  // Test the exact query used by getSearchResults
  console.log('\n\n=== Testing getSearchResults Query ===\n')

  const category = await prisma.category.findFirst({
    where: { slug: 'rakdan' },
  })

  if (!category) {
    console.log('❌ Category "rakdan" not found')
    return
  }

  console.log(`Category: ${category.name_he} (${category.slug})`)

  const whereClause = {
    category_id: category.id,
    neighborhood_id: merkaz.id,
    is_visible: true,
    deleted_at: null,
  }

  console.log('\nWhere clause:')
  console.log(JSON.stringify(whereClause, null, 2))

  const results = await prisma.business.findMany({
    where: whereClause,
  })

  console.log(`\nResults: ${results.length} businesses`)

  if (results.length === 0) {
    console.log('\n⚠️  NO RESULTS - Checking why:')

    // Check each condition individually
    console.log('\nChecking conditions:')

    const byCat = await prisma.business.count({
      where: { category_id: category.id },
    })
    console.log(`- category_id matches: ${byCat} businesses`)

    const byHood = await prisma.business.count({
      where: { neighborhood_id: merkaz.id },
    })
    console.log(`- neighborhood_id matches: ${byHood} businesses`)

    const byVisible = await prisma.business.count({
      where: { neighborhood_id: merkaz.id, is_visible: true },
    })
    console.log(`- is_visible=true: ${byVisible} businesses`)

    const byDeleted = await prisma.business.count({
      where: { neighborhood_id: merkaz.id, deleted_at: null },
    })
    console.log(`- deleted_at=null: ${byDeleted} businesses`)

    const byCatAndHood = await prisma.business.count({
      where: { category_id: category.id, neighborhood_id: merkaz.id },
    })
    console.log(`- category + neighborhood: ${byCatAndHood} businesses`)
  } else {
    console.log('\n✅ FOUND businesses:')
    results.forEach((biz) => {
      console.log(`   - ${biz.name_he}`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
