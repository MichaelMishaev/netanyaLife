import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSlugs() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name_he: true,
      name_ru: true,
      slug: true,
    },
  })

  console.log('Checking all category slugs...\n')

  const hebrewPattern = /[\u0590-\u05FF]/
  const russianPattern = /[\u0400-\u04FF]/
  const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  const invalidSlugs = []

  for (const cat of categories) {
    const hasHebrew = hebrewPattern.test(cat.slug)
    const hasRussian = russianPattern.test(cat.slug)
    const isValidSlug = validSlugPattern.test(cat.slug)

    if (hasHebrew || hasRussian || !isValidSlug) {
      invalidSlugs.push(cat)
      console.log('❌ Invalid slug:')
      console.log('   ID:', cat.id)
      console.log('   Name (HE):', cat.name_he)
      console.log('   Name (RU):', cat.name_ru)
      console.log('   Slug:', cat.slug)
      console.log('')
    } else {
      console.log('✅', cat.slug, '-', cat.name_he)
    }
  }

  console.log('\n' + '='.repeat(50))
  if (invalidSlugs.length === 0) {
    console.log('✅ All category slugs are valid!')
  } else {
    console.log(`⚠️  Found ${invalidSlugs.length} categories with invalid slugs`)
    console.log('These need to be fixed.')
  }

  await prisma.$disconnect()
  return invalidSlugs
}

checkSlugs()
