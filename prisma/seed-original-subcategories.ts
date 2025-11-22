/**
 * Seed Subcategories for Original 12 Categories
 * Run with: DATABASE_URL="..." npx tsx prisma/seed-original-subcategories.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const subcategories = [
  // Electricians - חשמלאים
  { categorySlug: "electricians", name_he: "תיקוני חשמל", name_ru: "Ремонт электрики", slug: "electrical-repairs", display_order: 0 },
  { categorySlug: "electricians", name_he: "התקנת תאורה", name_ru: "Установка освещения", slug: "lighting-installation", display_order: 1 },
  { categorySlug: "electricians", name_he: "לוחות חשמל", name_ru: "Электрощиты", slug: "electrical-panels", display_order: 2 },
  { categorySlug: "electricians", name_he: "חשמל חירום 24/7", name_ru: "Аварийный электрик 24/7", slug: "emergency-electrician", display_order: 3 },

  // Plumbers - אינסטלטורים
  { categorySlug: "plumbers", name_he: "פתיחת סתימות", name_ru: "Прочистка засоров", slug: "drain-cleaning", display_order: 0 },
  { categorySlug: "plumbers", name_he: "תיקון נזילות", name_ru: "Ремонт протечек", slug: "leak-repair", display_order: 1 },
  { categorySlug: "plumbers", name_he: "התקנת דודים", name_ru: "Установка бойлеров", slug: "boiler-installation", display_order: 2 },
  { categorySlug: "plumbers", name_he: "אינסטלציה חירום", name_ru: "Аварийная сантехника", slug: "emergency-plumber", display_order: 3 },

  // Locksmiths - מסגרים
  { categorySlug: "locksmiths", name_he: "פריצת דלתות", name_ru: "Вскрытие дверей", slug: "door-opening", display_order: 0 },
  { categorySlug: "locksmiths", name_he: "החלפת מנעולים", name_ru: "Замена замков", slug: "lock-replacement", display_order: 1 },
  { categorySlug: "locksmiths", name_he: "מנעולן רכב", name_ru: "Автослесарь", slug: "car-locksmith", display_order: 2 },
  { categorySlug: "locksmiths", name_he: "התקנת כספות", name_ru: "Установка сейфов", slug: "safe-installation", display_order: 3 },

  // Painters - צבעים
  { categorySlug: "painters", name_he: "צביעת דירות", name_ru: "Покраска квартир", slug: "apartment-painting", display_order: 0 },
  { categorySlug: "painters", name_he: "צביעת חוץ", name_ru: "Наружная покраска", slug: "exterior-painting", display_order: 1 },
  { categorySlug: "painters", name_he: "שיפוץ קירות", name_ru: "Ремонт стен", slug: "wall-repair", display_order: 2 },
  { categorySlug: "painters", name_he: "טפטים", name_ru: "Обои", slug: "wallpaper", display_order: 3 },

  // Cleaning - נקיון
  { categorySlug: "cleaning", name_he: "ניקיון דירות", name_ru: "Уборка квартир", slug: "apartment-cleaning", display_order: 0 },
  { categorySlug: "cleaning", name_he: "ניקיון משרדים", name_ru: "Уборка офисов", slug: "office-cleaning", display_order: 1 },
  { categorySlug: "cleaning", name_he: "ניקיון לאחר שיפוץ", name_ru: "Уборка после ремонта", slug: "post-renovation-cleaning", display_order: 2 },
  { categorySlug: "cleaning", name_he: "ניקוי שטיחים וספות", name_ru: "Чистка ковров и диванов", slug: "carpet-cleaning", display_order: 3 },

  // AC Technicians - טכנאי מזגנים
  { categorySlug: "ac-technicians", name_he: "התקנת מזגנים", name_ru: "Установка кондиционеров", slug: "ac-installation", display_order: 0 },
  { categorySlug: "ac-technicians", name_he: "תיקון מזגנים", name_ru: "Ремонт кондиционеров", slug: "ac-repair", display_order: 1 },
  { categorySlug: "ac-technicians", name_he: "ניקוי מזגנים", name_ru: "Чистка кондиционеров", slug: "ac-cleaning", display_order: 2 },
  { categorySlug: "ac-technicians", name_he: "מילוי גז למזגנים", name_ru: "Заправка кондиционеров", slug: "ac-gas-refill", display_order: 3 },

  // Gardening - גנים ונוף
  { categorySlug: "gardening", name_he: "גינון ותחזוקה", name_ru: "Садоводство и уход", slug: "garden-maintenance", display_order: 0 },
  { categorySlug: "gardening", name_he: "עיצוב גינות", name_ru: "Ландшафтный дизайн", slug: "garden-design", display_order: 1 },
  { categorySlug: "gardening", name_he: "מערכות השקיה", name_ru: "Системы полива", slug: "irrigation-systems", display_order: 2 },
  { categorySlug: "gardening", name_he: "גיזום עצים", name_ru: "Обрезка деревьев", slug: "tree-trimming", display_order: 3 },

  // Industrial Electricians - מתקני חשמל ומים
  { categorySlug: "electricians-industrial", name_he: "התקנות תעשייתיות", name_ru: "Промышленные установки", slug: "industrial-installation", display_order: 0 },
  { categorySlug: "electricians-industrial", name_he: "תחזוקת מבנים", name_ru: "Обслуживание зданий", slug: "building-maintenance", display_order: 1 },
  { categorySlug: "electricians-industrial", name_he: "מערכות חשמל", name_ru: "Электрические системы", slug: "electrical-systems", display_order: 2 },

  // Carpenters - נגרים
  { categorySlug: "carpenters", name_he: "רהיטים בהזמנה", name_ru: "Мебель на заказ", slug: "custom-furniture", display_order: 0 },
  { categorySlug: "carpenters", name_he: "מטבחים", name_ru: "Кухни", slug: "kitchens", display_order: 1 },
  { categorySlug: "carpenters", name_he: "ארונות", name_ru: "Шкафы", slug: "closets", display_order: 2 },
  { categorySlug: "carpenters", name_he: "דלתות ומסגרות", name_ru: "Двери и рамы", slug: "doors-frames", display_order: 3 },

  // Tutors - מורים פרטיים
  { categorySlug: "tutors", name_he: "מתמטיקה", name_ru: "Математика", slug: "math-tutoring", display_order: 0 },
  { categorySlug: "tutors", name_he: "אנגלית", name_ru: "Английский", slug: "english-tutoring", display_order: 1 },
  { categorySlug: "tutors", name_he: "עברית", name_ru: "Иврит", slug: "hebrew-tutoring", display_order: 2 },
  { categorySlug: "tutors", name_he: "פיזיקה וכימיה", name_ru: "Физика и химия", slug: "science-tutoring", display_order: 3 },
  { categorySlug: "tutors", name_he: "הכנה לבגרות", name_ru: "Подготовка к экзаменам", slug: "exam-prep", display_order: 4 },

  // Doctors - רופאים
  { categorySlug: "doctors", name_he: "רופא משפחה", name_ru: "Семейный врач", slug: "family-doctor", display_order: 0 },
  { categorySlug: "doctors", name_he: "רופא שיניים", name_ru: "Стоматолог", slug: "dentist", display_order: 1 },
  { categorySlug: "doctors", name_he: "רופא עור", name_ru: "Дерматолог", slug: "dermatologist", display_order: 2 },
  { categorySlug: "doctors", name_he: "רופא עיניים", name_ru: "Офтальмолог", slug: "ophthalmologist", display_order: 3 },
  { categorySlug: "doctors", name_he: "פיזיותרפיה", name_ru: "Физиотерапия", slug: "physiotherapy", display_order: 4 },
]

async function main() {
  console.log('🌱 Seeding subcategories for original categories...')

  const categories = await prisma.category.findMany()
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]))

  let created = 0
  let skipped = 0

  for (const sub of subcategories) {
    const categoryId = categoryMap.get(sub.categorySlug)

    if (!categoryId) {
      console.log(`⚠️  Category not found: ${sub.categorySlug}`)
      skipped++
      continue
    }

    try {
      await prisma.subcategory.upsert({
        where: {
          category_id_slug: {
            category_id: categoryId,
            slug: sub.slug,
          },
        },
        update: {
          name_he: sub.name_he,
          name_ru: sub.name_ru,
          display_order: sub.display_order,
        },
        create: {
          category_id: categoryId,
          name_he: sub.name_he,
          name_ru: sub.name_ru,
          slug: sub.slug,
          display_order: sub.display_order,
          is_active: true,
        },
      })
      console.log(`✅ ${sub.name_he} (${sub.categorySlug})`)
      created++
    } catch (error) {
      console.error(`❌ Error creating ${sub.name_he}:`, error)
      skipped++
    }
  }

  console.log(`\n✅ Done! Created/Updated: ${created}, Skipped: ${skipped}`)
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
