/**
 * Seed Missing Categories for Production
 * Run with: DATABASE_URL="..." npx tsx prisma/seed-categories-prod.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Categories that exist locally but not on production
const newCategories = [
  { name_he: "עיצוב שיער, קוסמטיקה ויופי", name_ru: "Парикмахерские и косметические услуги", slug: "hair-beauty-cosmetics", icon_name: "scissors", is_popular: true, display_order: 13 },
  { name_he: "רכב, תחבורה, הובלות", name_ru: "Транспорт и перевозки", slug: "transportation", icon_name: "truck", is_popular: true, display_order: 14 },
  { name_he: "שירותים לבית", name_ru: "Услуги для дома", slug: "home-services", icon_name: "home", is_popular: true, display_order: 15 },
  { name_he: "שירותי אלקטרוניקה אישית", name_ru: "Электроника", slug: "personal-electronics", icon_name: "device-mobile", is_popular: false, display_order: 16 },
  { name_he: "בריאות ורפואה משלימה", name_ru: "Здоровье и альтернативная медицина", slug: "health-wellness", icon_name: "heart", is_popular: true, display_order: 17 },
  { name_he: "סביבה ובעלי חיים", name_ru: "Окружающая среда и животные", slug: "environment-animals", icon_name: "leaf", is_popular: false, display_order: 18 },
  { name_he: "תופרות", name_ru: "Швейные услуги", slug: "sewing", icon_name: "scissors", is_popular: false, display_order: 19 },
  { name_he: "ייעוץ אישי וכלכלי", name_ru: "Финансовый консалтинг", slug: "financial-consulting", icon_name: "currency-dollar", is_popular: false, display_order: 20 },
  { name_he: "אוכל, צילום, אירועים והפעלות", name_ru: "Еда, фото, мероприятия", slug: "food-events-activities", icon_name: "cake", is_popular: true, display_order: 21 },
  { name_he: "שירותים לעסקים", name_ru: "Услуги для бизнеса", slug: "business-services", icon_name: "building-office", is_popular: false, display_order: 22 },
  { name_he: "חינוך, למידה, בייביסיטר", name_ru: "Образование и няни", slug: "education-learning", icon_name: "academic-cap", is_popular: true, display_order: 23 },
  { name_he: "ייעוץ דיגיטלי", name_ru: "Цифровой консалтинг", slug: "digital-consulting", icon_name: "computer-desktop", is_popular: false, display_order: 24 },
  { name_he: "נדל״ן", name_ru: "Недвижимость", slug: "real-estate", icon_name: "home-modern", is_popular: true, display_order: 25 },
]

async function main() {
  console.log('🌱 Seeding missing categories...')

  let created = 0
  let skipped = 0

  for (const cat of newCategories) {
    try {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })

      if (existing) {
        console.log(`⏭️  Already exists: ${cat.name_he}`)
        skipped++
        continue
      }

      await prisma.category.create({
        data: {
          ...cat,
          is_active: true,
        },
      })
      console.log(`✅ Created: ${cat.name_he} (${cat.slug})`)
      created++
    } catch (error) {
      console.error(`❌ Error creating ${cat.name_he}:`, error)
      skipped++
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}`)
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
