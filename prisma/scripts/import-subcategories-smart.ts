/**
 * Smart Subcategory Import Script
 * Matches categories by Hebrew name instead of ID
 * Run with: npx tsx prisma/scripts/import-subcategories-smart.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Manual mapping based on category names
const subcategoriesData = [
  {
    categoryNameHe: "עורכי דין",
    subcategories: [
      { name_he: "ייפוי כוח מתמשך", name_ru: "Постоянная доверенность", slug: "enduring-power-of-attorney" },
      { name_he: "גבייה", name_ru: "Взыскание долгов", slug: "debt-collection" },
      { name_he: "חוזים", name_ru: "Договоры", slug: "contracts" },
      { name_he: "אזרחי", name_ru: "Гражданское право", slug: "civil-law" }
    ]
  },
  {
    categoryNameHe: "חשמלאים",
    subcategories: [
      { name_he: "חשמלאי ביתי", name_ru: "Бытовой электрик", slug: "residential-electrician" },
      { name_he: "חשמלאי תעשייתי", name_ru: "Промышленный электрик", slug: "industrial-electrician" }
    ]
  },
  {
    categoryNameHe: "אינסטלטורים",
    subcategories: [
      { name_he: "תיקוני אינסטלציה", name_ru: "Ремонт сантехники", slug: "plumbing-repairs" },
      { name_he: "התקנת אינסטלציה", name_ru: "Установка сантехники", slug: "plumbing-installation" }
    ]
  },
  {
    categoryNameHe: "מסגרים",
    subcategories: [
      { name_he: "מנעולנים", name_ru: "Слесари", slug: "locksmiths" },
      { name_he: "פריצת דלתות", name_ru: "Вскрытие дверей", slug: "door-opening" }
    ]
  },
  {
    categoryNameHe: "מורים פרטיים",
    subcategories: [
      { name_he: "מתמטיקה", name_ru: "Математика", slug: "mathematics" },
      { name_he: "אנגלית", name_ru: "Английский", slug: "english" },
      { name_he: "פיזיקה", name_ru: "Физика", slug: "physics" },
      { name_he: "עברית", name_ru: "Иврит", slug: "hebrew" }
    ]
  },
  {
    categoryNameHe: "נקיון",
    subcategories: [
      { name_he: "ניקיון דירות", name_ru: "Уборка квартир", slug: "apartment-cleaning" },
      { name_he: "ניקיון משרדים", name_ru: "Уборка офисов", slug: "office-cleaning" },
      { name_he: "ניקיון חלונות", name_ru: "Мытье окон", slug: "window-cleaning" }
    ]
  },
  {
    categoryNameHe: "צבעים",
    subcategories: [
      { name_he: "צביעת דירות", name_ru: "Покраска квартир", slug: "apartment-painting" },
      { name_he: "צביעת חוץ", name_ru: "Наружная покраска", slug: "exterior-painting" }
    ]
  },
  {
    categoryNameHe: "נגרים",
    subcategories: [
      { name_he: "נגרות אומן", name_ru: "Столярные работы", slug: "carpentry" },
      { name_he: "ריהוט מעץ", name_ru: "Деревянная мебель", slug: "wood-furniture" }
    ]
  },
  {
    categoryNameHe: "טכנאי מזגנים",
    subcategories: [
      { name_he: "תיקון מזגנים", name_ru: "Ремонт кондиционеров", slug: "ac-repair" },
      { name_he: "התקנת מזגנים", name_ru: "Установка кондиционеров", slug: "ac-installation" },
      { name_he: "תחזוקת מזגנים", name_ru: "Обслуживание кондиционеров", slug: "ac-maintenance" }
    ]
  },
  {
    categoryNameHe: "רופאים",
    subcategories: [
      { name_he: "רופא משפחה", name_ru: "Семейный врач", slug: "family-doctor" },
      { name_he: "רופא ילדים", name_ru: "Педиатр", slug: "pediatrician" },
      { name_he: "עיסוי", name_ru: "Массаж", slug: "massage" },
      { name_he: "פיזיותרפיה", name_ru: "Физиотерапия", slug: "physiotherapy" }
    ]
  }
]

async function main() {
  console.log('🌱 Starting smart subcategory import...\n')

  // First, get all categories from database
  const dbCategories = await prisma.category.findMany({
    select: {
      id: true,
      name_he: true,
      name_ru: true,
    }
  })

  console.log(`📊 Found ${dbCategories.length} categories in database\n`)

  let totalImported = 0
  let totalSkipped = 0
  let categoriesMatched = 0
  let categoriesNotMatched = 0

  for (const categoryData of subcategoriesData) {
    const { categoryNameHe, subcategories } = categoryData

    // Find matching category by Hebrew name
    const matchedCategory = dbCategories.find(c =>
      c.name_he === categoryNameHe ||
      c.name_he.includes(categoryNameHe) ||
      categoryNameHe.includes(c.name_he)
    )

    if (!matchedCategory) {
      console.log(`⚠️  Category "${categoryNameHe}" not found in database - skipping ${subcategories.length} subcategories`)
      categoriesNotMatched++
      totalSkipped += subcategories.length
      continue
    }

    categoriesMatched++
    console.log(`\n📁 Processing: ${categoryNameHe}`)
    console.log(`   Matched DB Category: ${matchedCategory.name_he} (${matchedCategory.id})`)
    console.log(`   Subcategories: ${subcategories.length}`)

    // Import each subcategory
    for (const subcat of subcategories) {
      try {
        const created = await prisma.subcategory.upsert({
          where: {
            category_id_slug: {
              category_id: matchedCategory.id,
              slug: subcat.slug,
            },
          },
          update: {
            name_he: subcat.name_he,
            name_ru: subcat.name_ru,
            is_active: true,
          },
          create: {
            category_id: matchedCategory.id,
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
  console.log(`   ✅ Categories matched: ${categoriesMatched}`)
  console.log(`   ⚠️  Categories not matched: ${categoriesNotMatched}`)
  console.log(`   ✅ Subcategories imported: ${totalImported}`)
  console.log(`   ⚠️  Subcategories skipped: ${totalSkipped}`)
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
