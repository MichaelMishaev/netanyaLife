import { prisma } from '../lib/prisma'

async function fixDuplicateMizrach() {
  console.log('Finding duplicate מזרח neighborhoods...\n')

  const neighborhoods = await prisma.neighborhood.findMany({
    where: { name_he: 'מזרח' }
  })

  console.log(`Found ${neighborhoods.length} neighborhoods with name "מזרח":`)
  neighborhoods.forEach(n => {
    console.log(`- ID: ${n.id.substring(0, 8)}, Slug: ${n.slug}, RU: ${n.name_ru}`)
  })

  // The one with slug "mizrah-hair" should be "מזרח העיר"
  const eastCity = neighborhoods.find(n => n.slug === 'mizrah-hair')

  if (eastCity) {
    console.log(`\nUpdating neighborhood ${eastCity.id.substring(0, 8)} to "מזרח העיר"...`)

    await prisma.neighborhood.update({
      where: { id: eastCity.id },
      data: {
        name_he: 'מזרח העיר',
        updated_at: new Date()
      }
    })

    console.log('✅ Updated successfully!')

    // Verify
    const updated = await prisma.neighborhood.findUnique({
      where: { id: eastCity.id }
    })

    console.log('\nVerification:')
    console.log(`- Hebrew: ${updated?.name_he}`)
    console.log(`- Russian: ${updated?.name_ru}`)
    console.log(`- Slug: ${updated?.slug}`)
  } else {
    console.log('\n⚠️ Could not find neighborhood with slug "mizrah-hair"')
  }

  await prisma.$disconnect()
}

fixDuplicateMizrach().catch(console.error)
