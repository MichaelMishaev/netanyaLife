/**
 * Import Subcategories Script
 * Run with: npx tsx prisma/scripts/import-subcategories.ts
 *
 * Imports subcategories from subcategories.json into the database
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface SubcategoryData {
  name_he: string
  name_ru: string
  slug: string
}

interface CategoryData {
  categoryId: string
  categoryTitle: string
  subcategories: SubcategoryData[]
}

async function main() {
  console.log('🌱 Starting subcategory import...\n')

  // Read the JSON data file
  const dataPath = path.join(__dirname, '../data/subcategories.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const categoriesData: CategoryData[] = JSON.parse(rawData)

  let totalImported = 0
  let totalSkipped = 0

  for (const categoryData of categoriesData) {
    const { categoryId, categoryTitle, subcategories } = categoryData

    console.log(`\n📁 Processing: ${categoryTitle}`)
    console.log(`   Category ID: ${categoryId}`)
    console.log(`   Subcategories: ${subcategories.length}`)

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      console.log(`   ⚠️  Category not found - skipping`)
      totalSkipped += subcategories.length
      continue
    }

    // Import each subcategory
    for (const subcat of subcategories) {
      try {
        const created = await prisma.subcategory.upsert({
          where: {
            category_id_slug: {
              category_id: categoryId,
              slug: subcat.slug,
            },
          },
          update: {
            name_he: subcat.name_he,
            name_ru: subcat.name_ru,
            is_active: true,
          },
          create: {
            category_id: categoryId,
            name_he: subcat.name_he,
            name_ru: subcat.name_ru,
            slug: subcat.slug,
            is_active: true,
          },
        })

        console.log(`   ✅ ${subcat.name_he} (${subcat.slug})`)
        totalImported++
      } catch (error) {
        console.error(`   ❌ Failed to import ${subcat.name_he}:`, error)
        totalSkipped++
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`🎉 Import complete!`)
  console.log(`   ✅ Imported: ${totalImported}`)
  console.log(`   ⚠️  Skipped: ${totalSkipped}`)
  console.log('='.repeat(60) + '\n')
}

main()
  .catch((error) => {
    console.error('❌ Import failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
