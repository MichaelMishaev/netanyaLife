/**
 * Seed Dummy Businesses Script
 * Creates one dummy business for each category and subcategory
 * Run with: npx ts-node scripts/seed-dummy-businesses.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to generate slug from Hebrew text
function generateSlug(text: string, suffix: string): string {
  // Transliterate common Hebrew chars or just use suffix for uniqueness
  return `dummy-${suffix}-${Date.now() % 10000}`
}

// Hebrew business name templates
const businessNameTemplates = [
  'שירותי',
  'מומחים',
  'מקצועי',
  'פתרונות',
  'בית',
  'מרכז',
  'סטודיו',
]

// Random phone numbers (Israeli format)
function randomPhone(): string {
  const prefix = ['050', '052', '053', '054', '055', '058'][Math.floor(Math.random() * 6)]
  const number = Math.floor(Math.random() * 9000000) + 1000000
  return `+972${prefix.slice(1)}${number}`
}

async function main() {
  console.log('🌱 Starting dummy business seed...\n')

  // Get city (Netanya)
  const city = await prisma.city.findFirst({ where: { slug: 'netanya' } })
  if (!city) throw new Error('City not found')

  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany()
  if (neighborhoods.length === 0) throw new Error('No neighborhoods found')

  // Get all categories with their subcategories
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
    where: { is_active: true }
  })

  let businessCount = 0
  let neighborhoodIndex = 0

  // Function to get next neighborhood (round-robin)
  const getNextNeighborhood = () => {
    const hood = neighborhoods[neighborhoodIndex % neighborhoods.length]
    neighborhoodIndex++
    return hood
  }

  // Process each category
  for (const category of categories) {
    // Skip test categories
    if (category.slug.includes('test')) continue

    // If category has subcategories, create business for each subcategory
    if (category.subcategories.length > 0) {
      for (const subcategory of category.subcategories) {
        const hood = getNextNeighborhood()
        const phone = randomPhone()
        const slugBase = `${category.slug}-${subcategory.slug}`
        const slugHe = `dummy-${slugBase}-${Date.now() % 10000}-${businessCount}`

        const existingBiz = await prisma.business.findFirst({
          where: {
            category_id: category.id,
            subcategory_id: subcategory.id,
            is_test: true
          }
        })

        if (existingBiz) {
          console.log(`⏭️  Skipping (exists): ${category.name_he} > ${subcategory.name_he}`)
          continue
        }

        await prisma.business.create({
          data: {
            name_he: `${subcategory.name_he} - ${hood.name_he}`,
            name_ru: subcategory.name_ru || null,
            slug_he: slugHe,
            description_he: `שירותי ${subcategory.name_he} מקצועיים ב${hood.name_he} נתניה. צוות מנוסה ומקצועי.`,
            city_id: city.id,
            neighborhood_id: hood.id,
            category_id: category.id,
            subcategory_id: subcategory.id,
            address_he: `רחוב הדוגמה ${businessCount + 1}, ${hood.name_he}, נתניה`,
            phone: phone,
            whatsapp_number: Math.random() > 0.5 ? phone : null,
            opening_hours_he: 'א׳-ה׳: 09:00-18:00',
            is_visible: true,
            is_verified: false,
            is_pinned: false,
            is_test: true,
          }
        })

        businessCount++
        console.log(`✅ Created: ${category.name_he} > ${subcategory.name_he} (${hood.name_he})`)
      }
    } else {
      // Category has no subcategories - create business for category directly
      const hood = getNextNeighborhood()
      const phone = randomPhone()
      const slugHe = `dummy-${category.slug}-${Date.now() % 10000}-${businessCount}`

      const existingBiz = await prisma.business.findFirst({
        where: {
          category_id: category.id,
          subcategory_id: null,
          is_test: true
        }
      })

      if (existingBiz) {
        console.log(`⏭️  Skipping (exists): ${category.name_he} (no subcategory)`)
        continue
      }

      await prisma.business.create({
        data: {
          name_he: `${category.name_he} - ${hood.name_he}`,
          name_ru: category.name_ru || null,
          slug_he: slugHe,
          description_he: `שירותי ${category.name_he} מקצועיים ב${hood.name_he} נתניה. צוות מנוסה ומקצועי.`,
          city_id: city.id,
          neighborhood_id: hood.id,
          category_id: category.id,
          subcategory_id: null,
          address_he: `רחוב הדוגמה ${businessCount + 1}, ${hood.name_he}, נתניה`,
          phone: phone,
          whatsapp_number: Math.random() > 0.5 ? phone : null,
          opening_hours_he: 'א׳-ה׳: 09:00-18:00',
          is_visible: true,
          is_verified: false,
          is_pinned: false,
          is_test: true,
        }
      })

      businessCount++
      console.log(`✅ Created: ${category.name_he} (${hood.name_he})`)
    }
  }

  console.log(`\n✅ Seed completed! Created ${businessCount} dummy businesses.`)

  // Show summary
  const totalBusinesses = await prisma.business.count()
  const testBusinesses = await prisma.business.count({ where: { is_test: true } })
  console.log(`\n📊 Summary:`)
  console.log(`   Total businesses: ${totalBusinesses}`)
  console.log(`   Test businesses: ${testBusinesses}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
