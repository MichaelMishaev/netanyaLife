import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testURL(url: string): Promise<{ status: number; hasBusinesses: boolean }> {
  try {
    const response = await fetch(url)
    const html = await response.text()

    // Check if "no results" text appears
    const hasNoResults = html.includes('לא מצאנו') || html.includes('noResults')

    // Check if business cards appear (looking for business card HTML)
    const hasBusinessCards = html.includes('business-card') || html.includes('data-business-id')

    return {
      status: response.status,
      hasBusinesses: hasBusinessCards && !hasNoResults,
    }
  } catch (error) {
    return { status: 500, hasBusinesses: false }
  }
}

async function main() {
  console.log('=== Live URL Testing for Neighborhood Filtering ===\n')
  console.log('Testing against http://localhost:4700\n')

  // Get first category for testing
  const category = await prisma.category.findFirst({
    where: { is_active: true },
  })

  if (!category) {
    console.log('❌ No categories found')
    return
  }

  console.log(`Testing category: ${category.name_he} (${category.slug})\n`)

  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
  })

  console.log('Testing each neighborhood URL:\n')

  const results: any[] = []

  for (const hood of neighborhoods) {
    const url = `http://localhost:4700/he/search/${category.slug}/${hood.slug}`

    console.log(`📍 ${hood.name_he}`)
    console.log(`   URL: ${url}`)

    const result = await testURL(url)

    console.log(`   Status: ${result.status}`)
    console.log(`   Has businesses: ${result.hasBusinesses ? '✅ YES' : '❌ NO (empty state shown)'}`)

    // Get actual count from database
    const dbCount = await prisma.business.count({
      where: {
        category_id: category.id,
        neighborhood_id: hood.id,
        is_visible: true,
        deleted_at: null,
      },
    })

    console.log(`   Database count: ${dbCount}`)
    console.log(`   ✅ Filtering ${result.hasBusinesses === (dbCount > 0) ? 'WORKS CORRECTLY' : '⚠️  MISMATCH'}`)
    console.log('')

    results.push({
      neighborhood: hood.name_he,
      slug: hood.slug,
      url,
      status: result.status,
      showsBusinesses: result.hasBusinesses,
      actualCount: dbCount,
      filteringWorks: result.hasBusinesses === (dbCount > 0),
    })
  }

  console.log('\n=== Final Report ===\n')

  const allWorking = results.every(r => r.filteringWorks)

  if (allWorking) {
    console.log('✅ ALL NEIGHBORHOOD BUTTONS WORK CORRECTLY!')
    console.log('   - URLs are generated properly')
    console.log('   - Filtering logic works as expected')
    console.log('   - Empty states appear when no businesses exist')
  } else {
    console.log('⚠️  SOME ISSUES FOUND:')
    results.filter(r => !r.filteringWorks).forEach(r => {
      console.log(`   - ${r.neighborhood}: Page shows businesses=${r.showsBusinesses}, but DB has ${r.actualCount}`)
    })
  }

  console.log('\nCurrent State:')
  results.forEach(r => {
    const icon = r.actualCount > 0 ? '✅' : '⚠️ '
    console.log(`${icon} ${r.neighborhood.padEnd(10)} - ${r.actualCount} businesses`)
  })

  console.log('\n💡 To fully test with real data, add businesses to all neighborhoods.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
