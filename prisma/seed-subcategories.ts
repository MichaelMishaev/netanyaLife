/**
 * Seed Subcategories Script
 * Run with: npx tsx prisma/seed-subcategories.ts
 *
 * This seeds all subcategories from local development to production
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const subcategories = [
  { categorySlug: "lawyers", name_he: "ייפוי כוח מתמשך", name_ru: "Постоянная доверенность", slug: "power-of-attorney", display_order: 0 },
  { categorySlug: "lawyers", name_he: "גבייה", name_ru: "Взыскание долгов", slug: "debt-collection", display_order: 1 },
  { categorySlug: "lawyers", name_he: "חוזים", name_ru: "Договоры", slug: "contracts", display_order: 2 },
  { categorySlug: "lawyers", name_he: "אזרחי", name_ru: "Гражданское право", slug: "civil-law", display_order: 3 },
  { categorySlug: "lawyers", name_he: "עורך דין נדל״ן", name_ru: "Юрист по недвижимости", slug: "real-estate-lawyer", display_order: 4 },

  { categorySlug: "hair-beauty-cosmetics", name_he: "עיצוב שיער", name_ru: "Парикмахерские услуги", slug: "hair-styling", display_order: 0 },
  { categorySlug: "hair-beauty-cosmetics", name_he: "קוסמטיקה", name_ru: "Косметика", slug: "cosmetics", display_order: 1 },
  { categorySlug: "hair-beauty-cosmetics", name_he: "הדבקת ריסים", name_ru: "Наращивание ресниц", slug: "eyelash-extensions", display_order: 2 },
  { categorySlug: "hair-beauty-cosmetics", name_he: "סדנאות איפור", name_ru: "Мастер-классы по макияжу", slug: "makeup-workshops", display_order: 3 },
  { categorySlug: "hair-beauty-cosmetics", name_he: "מניקור ופדיקור", name_ru: "Маникюр и педикюр", slug: "manicure-pedicure", display_order: 4 },

  { categorySlug: "transportation", name_he: "מוניות", name_ru: "Такси", slug: "taxis", display_order: 0 },
  { categorySlug: "transportation", name_he: "הסעות", name_ru: "Трансферы", slug: "shuttles", display_order: 1 },
  { categorySlug: "transportation", name_he: "הובלות", name_ru: "Грузоперевозки", slug: "moving", display_order: 2 },
  { categorySlug: "transportation", name_he: "זגגות רכב", name_ru: "Автостекла", slug: "car-glass", display_order: 3 },
  { categorySlug: "transportation", name_he: "מורה לנהיגה", name_ru: "Инструктор по вождению", slug: "driving-instructor", display_order: 4 },

  { categorySlug: "home-services", name_he: "אינסטלטורים", name_ru: "Сантехники", slug: "plumbers", display_order: 0 },
  { categorySlug: "home-services", name_he: "הנדימן", name_ru: "Мастер на все руки", slug: "handyman", display_order: 1 },
  { categorySlug: "home-services", name_he: "מנעולנים", name_ru: "Слесари", slug: "locksmiths", display_order: 2 },
  { categorySlug: "home-services", name_he: "מערכות מיגון לבית", name_ru: "Системы безопасности", slug: "home-security", display_order: 3 },
  { categorySlug: "home-services", name_he: "ניקיון", name_ru: "Уборка", slug: "cleaning", display_order: 4 },
  { categorySlug: "home-services", name_he: "תכנון ועיצוב פנים", name_ru: "Дизайн интерьера", slug: "interior-design", display_order: 5 },

  { categorySlug: "personal-electronics", name_he: "טכנאי סלולר ותיקונים", name_ru: "Ремонт мобильных телефонов", slug: "mobile-repair", display_order: 0 },
  { categorySlug: "personal-electronics", name_he: "מחשבים נייחים וניידים", name_ru: "Компьютеры и ноутбуки", slug: "computers", display_order: 1 },

  { categorySlug: "health-wellness", name_he: "עיסוי", name_ru: "Массаж", slug: "massage", display_order: 0 },
  { categorySlug: "health-wellness", name_he: "פסיכותרפיה", name_ru: "Психотерапия", slug: "psychotherapy", display_order: 1 },
  { categorySlug: "health-wellness", name_he: "טיפול רגשי ופסיכותרפיה", name_ru: "Эмоциональная терапия", slug: "emotional-therapy", display_order: 2 },
  { categorySlug: "health-wellness", name_he: "ליווי רגשי ונפשי", name_ru: "Эмоциональная поддержка", slug: "emotional-support", display_order: 3 },
  { categorySlug: "health-wellness", name_he: "נטורופתיה", name_ru: "Натуропатия", slug: "naturopathy", display_order: 4 },
  { categorySlug: "health-wellness", name_he: "מאמני כושר", name_ru: "Фитнес тренеры", slug: "fitness-trainers", display_order: 5 },

  { categorySlug: "environment-animals", name_he: "לוכד נחשים", name_ru: "Ловец змей", slug: "snake-catcher", display_order: 0 },

  { categorySlug: "sewing", name_he: "שמלות כלה", name_ru: "Свадебные платья", slug: "wedding-dresses", display_order: 0 },
  { categorySlug: "sewing", name_he: "שמלות ערב", name_ru: "Вечерние платья", slug: "evening-dresses", display_order: 1 },
  { categorySlug: "sewing", name_he: "תיקונים", name_ru: "Ремонт одежды", slug: "clothing-repairs", display_order: 2 },
  { categorySlug: "sewing", name_he: "וילונות וטקסטיל לבית", name_ru: "Шторы и домашний текстиль", slug: "curtains-textiles", display_order: 3 },

  { categorySlug: "financial-consulting", name_he: "תכנון פנסיוני", name_ru: "Пенсионное планирование", slug: "pension-planning", display_order: 0 },

  { categorySlug: "food-events-activities", name_he: "סדנאות בישול ואפייה", name_ru: "Мастер-классы по кулинарии", slug: "cooking-workshops", display_order: 0 },
  { categorySlug: "food-events-activities", name_he: "עיצוב עוגות ומתוקים", name_ru: "Дизайн тортов и сладостей", slug: "cake-design", display_order: 1 },
  { categorySlug: "food-events-activities", name_he: "עיצוב בלונים ופרחים", name_ru: "Оформление шарами и цветами", slug: "balloon-flower-design", display_order: 2 },
  { categorySlug: "food-events-activities", name_he: "הפעלות לילדים", name_ru: "Детские мероприятия", slug: "kids-activities", display_order: 3 },
  { categorySlug: "food-events-activities", name_he: "צלמים", name_ru: "Фотографы", slug: "photographers", display_order: 4 },
  { categorySlug: "food-events-activities", name_he: "אוכל ביתי מוכן", name_ru: "Домашняя еда", slug: "home-food", display_order: 5 },

  { categorySlug: "business-services", name_he: "שירותי משרד", name_ru: "Офисные услуги", slug: "office-services", display_order: 0 },
  { categorySlug: "business-services", name_he: "בק אופיס", name_ru: "Бэк-офис", slug: "back-office", display_order: 1 },
  { categorySlug: "business-services", name_he: "מכבסה / שירותי כביסה", name_ru: "Прачечная", slug: "laundry", display_order: 2 },
  { categorySlug: "business-services", name_he: "תחזוקת משרדים", name_ru: "Обслуживание офисов", slug: "office-maintenance", display_order: 3 },
  { categorySlug: "business-services", name_he: "מערכות מיגון", name_ru: "Системы безопасности", slug: "security-systems", display_order: 4 },

  { categorySlug: "education-learning", name_he: "מורים פרטיים", name_ru: "Репетиторы", slug: "private-teachers", display_order: 0 },
  { categorySlug: "education-learning", name_he: "בייביסיטר", name_ru: "Няня", slug: "babysitter", display_order: 1 },
  { categorySlug: "education-learning", name_he: "חוגים", name_ru: "Кружки", slug: "clubs", display_order: 2 },

  { categorySlug: "digital-consulting", name_he: "בניית אתרים", name_ru: "Создание сайтов", slug: "website-building", display_order: 0 },

  { categorySlug: "real-estate", name_he: "ייעוץ נדל״ן", name_ru: "Консультации по недвижимости", slug: "real-estate-consulting", display_order: 0 },
  { categorySlug: "real-estate", name_he: "סוכני נדל״ן", name_ru: "Агенты по недвижимости", slug: "real-estate-agents", display_order: 1 },
]

async function main() {
  console.log('🌱 Seeding subcategories...')

  // Get all categories
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
