import { prisma } from '../lib/prisma'

async function checkNeighborhoods() {
  const neighborhoods = await prisma.neighborhood.findMany({
    orderBy: { name_he: 'asc' }
  })

  console.log('Total neighborhoods:', neighborhoods.length)
  console.log('\nNeighborhoods list:')
  neighborhoods.forEach(n => {
    console.log(`- ID: ${n.id.substring(0, 8)}, HE: "${n.name_he}", RU: "${n.name_ru}", Slug: "${n.slug}"`)
  })

  // Check for duplicates by name_he
  const heNames = neighborhoods.map(n => n.name_he)
  const uniqueNames = new Set(heNames)

  if (heNames.length !== uniqueNames.size) {
    console.log('\n⚠️ DUPLICATE HEBREW NAMES FOUND:')
    const counted = new Map<string, typeof neighborhoods>()

    neighborhoods.forEach(n => {
      if (!counted.has(n.name_he)) {
        counted.set(n.name_he, [])
      }
      counted.get(n.name_he)!.push(n)
    })

    counted.forEach((dupes, name) => {
      if (dupes.length > 1) {
        console.log(`\n"${name}" appears ${dupes.length} times:`)
        dupes.forEach(d => console.log(`  - ID: ${d.id.substring(0, 8)}, Slug: ${d.slug}, Active: ${d.is_active}`))
      }
    })
  } else {
    console.log('\n✅ No duplicates found')
  }

  await prisma.$disconnect()
}

checkNeighborhoods().catch(console.error)
