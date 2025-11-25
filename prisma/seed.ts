/**
 * COMPREHENSIVE Database Seed Script
 * Run with: npm run prisma:seed
 *
 * Seeds (in order):
 * 1. City (Netanya)
 * 2. Neighborhoods (4)
 * 3. Categories (14) - From Firebase
 * 4. Subcategories (47+) - Mapped to categories
 * 5. Admin user
 * 6. Admin settings
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed...')

  // ============================================================================
  // 1. CITY
  // ============================================================================
  console.log('\n📍 Seeding city...')

  const city = await prisma.city.upsert({
    where: { slug: 'netanya' },
    update: {},
    create: {
      name_he: 'נתניה',
      name_ru: 'Нетания',
      slug: 'netanya',
      is_active: true,
    },
  })
  console.log(`✅ City: ${city.name_he}`)

  // ============================================================================
  // 2. NEIGHBORHOODS
  // ============================================================================
  console.log('\n🏘️  Seeding neighborhoods...')

  const neighborhoods = [
    { name_he: 'מרכז', name_ru: 'Центр', slug: 'merkaz', display_order: 1 },
    { name_he: 'צפון', name_ru: 'Север', slug: 'tsafon', display_order: 2 },
    { name_he: 'דרום', name_ru: 'Юг', slug: 'darom', display_order: 3 },
    { name_he: 'מזרח', name_ru: 'Восток города', slug: 'mizrah-hair', display_order: 4 },
  ]

  for (const hood of neighborhoods) {
    await prisma.neighborhood.upsert({
      where: { city_id_slug: { city_id: city.id, slug: hood.slug } },
      update: { name_he: hood.name_he, name_ru: hood.name_ru },
      create: { ...hood, city_id: city.id },
    })
    console.log(`✅ ${hood.name_he}`)
  }

  // ============================================================================
  // 3. CATEGORIES (14 from Firebase)
  // ============================================================================
  console.log('\n📋 Seeding categories...')

  const categories = [
    { name_he: 'עורכי דין', name_ru: 'Адвокаты', slug: 'lawyers', icon_name: 'scale', is_popular: true, display_order: 1 },
    { name_he: 'עיצוב שיער, קוסמטיקה ויופי', name_ru: 'Парикмахерские, косметика, красота', slug: 'hair-beauty-cosmetics', icon_name: 'scissors', is_popular: true, display_order: 2 },
    { name_he: 'רכב, תחבורה, הובלות', name_ru: 'Авто, транспорт, переезды', slug: 'transportation', icon_name: 'truck', is_popular: true, display_order: 3 },
    { name_he: 'שירותים לבית', name_ru: 'Услуги для дома', slug: 'home-services', icon_name: 'home', is_popular: true, display_order: 4 },
    { name_he: 'שירותי אלקטרוניקה אישית', name_ru: 'Услуги личной электроники', slug: 'personal-electronics', icon_name: 'device-phone-mobile', is_popular: false, display_order: 5 },
    { name_he: 'בריאות ורפואה משלימה', name_ru: 'Здоровье и альтернативная медицина', slug: 'health-wellness', icon_name: 'heart', is_popular: true, display_order: 6 },
    { name_he: 'סביבה ובעלי חיים', name_ru: 'Окружающая среда и животные', slug: 'environment-animals', icon_name: 'leaf', is_popular: false, display_order: 7 },
    { name_he: 'תופרות', name_ru: 'Швейные услуги', slug: 'sewing', icon_name: 'scissors', is_popular: false, display_order: 8 },
    { name_he: 'ייעוץ אישי וכלכלי', name_ru: 'Личные и финансовые консультации', slug: 'financial-consulting', icon_name: 'currency-dollar', is_popular: true, display_order: 9 },
    { name_he: 'אוכל, צילום, אירועים והפעלות', name_ru: 'Еда, фото, мероприятия и развлечения', slug: 'food-events-activities', icon_name: 'cake', is_popular: true, display_order: 10 },
    { name_he: 'שירותים לעסקים', name_ru: 'Услуги для бизнеса', slug: 'business-services', icon_name: 'briefcase', is_popular: false, display_order: 11 },
    { name_he: 'חינוך, למידה, בייביסיטר', name_ru: 'Образование, обучение, няня', slug: 'education-learning', icon_name: 'academic-cap', is_popular: true, display_order: 12 },
    { name_he: 'ייעוץ דיגיטלי', name_ru: 'Цифровые консультации', slug: 'digital-consulting', icon_name: 'computer-desktop', is_popular: false, display_order: 13 },
    { name_he: 'נדל״ן', name_ru: 'Недвижимость', slug: 'real-estate', icon_name: 'building-office', is_popular: true, display_order: 14 },
  ]

  const categoryMap = new Map<string, string>()

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name_he: cat.name_he, name_ru: cat.name_ru },
      create: cat,
    })
    categoryMap.set(cat.slug, created.id)
    console.log(`✅ ${created.name_he}`)
  }

  // ============================================================================
  // 4. SUBCATEGORIES (47+)
  // ============================================================================
  console.log('\n📂 Seeding subcategories...')

  const subcategories = [
    // Lawyers (עורכי דין)
    { categorySlug: "lawyers", name_he: "ייפוי כוח מתמשך", name_ru: "Постоянная доверенность", slug: "power-of-attorney", display_order: 0 },
    { categorySlug: "lawyers", name_he: "גבייה", name_ru: "Взыскание долгов", slug: "debt-collection", display_order: 1 },
    { categorySlug: "lawyers", name_he: "חוזים", name_ru: "Договоры", slug: "contracts", display_order: 2 },
    { categorySlug: "lawyers", name_he: "אזרחי", name_ru: "Гражданское право", slug: "civil-law", display_order: 3 },
    { categorySlug: "lawyers", name_he: "עורך דין נדל״ן", name_ru: "Юрист по недвижимости", slug: "real-estate-lawyer", display_order: 4 },

    // Hair, Beauty, Cosmetics (עיצוב שיער, קוסמטיקה ויופי)
    { categorySlug: "hair-beauty-cosmetics", name_he: "עיצוב שיער", name_ru: "Парикмахерские услуги", slug: "hair-styling", display_order: 0 },
    { categorySlug: "hair-beauty-cosmetics", name_he: "קוסמטיקה", name_ru: "Косметика", slug: "cosmetics", display_order: 1 },
    { categorySlug: "hair-beauty-cosmetics", name_he: "הדבקת ריסים", name_ru: "Наращивание ресниц", slug: "eyelash-extensions", display_order: 2 },
    { categorySlug: "hair-beauty-cosmetics", name_he: "סדנאות איפור", name_ru: "Мастер-классы по макияжу", slug: "makeup-workshops", display_order: 3 },
    { categorySlug: "hair-beauty-cosmetics", name_he: "מניקור ופדיקור", name_ru: "Маникюр и педикюр", slug: "manicure-pedicure", display_order: 4 },

    // Transportation (רכב, תחבורה, הובלות)
    { categorySlug: "transportation", name_he: "מוניות", name_ru: "Такси", slug: "taxis", display_order: 0 },
    { categorySlug: "transportation", name_he: "הסעות", name_ru: "Трансферы", slug: "shuttles", display_order: 1 },
    { categorySlug: "transportation", name_he: "הובלות", name_ru: "Грузоперевозки", slug: "moving", display_order: 2 },
    { categorySlug: "transportation", name_he: "זגגות רכב", name_ru: "Автостекла", slug: "car-glass", display_order: 3 },
    { categorySlug: "transportation", name_he: "מורה לנהיגה", name_ru: "Инструктор по вождению", slug: "driving-instructor", display_order: 4 },

    // Home Services (שירותים לבית)
    { categorySlug: "home-services", name_he: "חשמלאים", name_ru: "Электрики", slug: "electricians", display_order: 0 },
    { categorySlug: "home-services", name_he: "אינסטלטורים", name_ru: "Сантехники", slug: "plumbers", display_order: 1 },
    { categorySlug: "home-services", name_he: "הנדימן", name_ru: "Мастер на все руки", slug: "handyman", display_order: 2 },
    { categorySlug: "home-services", name_he: "מנעולנים", name_ru: "Слесари", slug: "locksmiths", display_order: 3 },
    { categorySlug: "home-services", name_he: "מערכות מיגון לבית", name_ru: "Системы безопасности", slug: "home-security", display_order: 4 },
    { categorySlug: "home-services", name_he: "ניקיון", name_ru: "Уборка", slug: "cleaning", display_order: 5 },
    { categorySlug: "home-services", name_he: "תכנון ועיצוב פנים", name_ru: "Дизайн интерьера", slug: "interior-design", display_order: 6 },
    { categorySlug: "home-services", name_he: "עבודות גז / טכנאי גז", name_ru: "Газовые работы", slug: "gas-technician", display_order: 7 },

    // Personal Electronics (שירותי אלקטרוניקה אישית)
    { categorySlug: "personal-electronics", name_he: "טכנאי סלולר ותיקונים", name_ru: "Ремонт мобильных телефонов", slug: "mobile-repair", display_order: 0 },
    { categorySlug: "personal-electronics", name_he: "מחשבים נייחים וניידים", name_ru: "Компьютеры и ноутбуки", slug: "computers", display_order: 1 },

    // Health & Wellness (בריאות ורפואה משלימה)
    { categorySlug: "health-wellness", name_he: "עיסוי", name_ru: "Массаж", slug: "massage", display_order: 0 },
    { categorySlug: "health-wellness", name_he: "פסיכותרפיה", name_ru: "Психотерапия", slug: "psychotherapy", display_order: 1 },
    { categorySlug: "health-wellness", name_he: "טיפול רגשי ופסיכותרפיה", name_ru: "Эмоциональная терапия", slug: "emotional-therapy", display_order: 2 },
    { categorySlug: "health-wellness", name_he: "ליווי רגשי ונפשי", name_ru: "Эмоциональная поддержка", slug: "emotional-support", display_order: 3 },
    { categorySlug: "health-wellness", name_he: "נטורופתיה", name_ru: "Натуропатия", slug: "naturopathy", display_order: 4 },
    { categorySlug: "health-wellness", name_he: "מאמני כושר", name_ru: "Фитнес тренеры", slug: "fitness-trainers", display_order: 5 },

    // Environment & Animals (סביבה ובעלי חיים)
    { categorySlug: "environment-animals", name_he: "לוכד נחשים", name_ru: "Ловец змей", slug: "snake-catcher", display_order: 0 },

    // Sewing (תופרות)
    { categorySlug: "sewing", name_he: "שמלות כלה", name_ru: "Свадебные платья", slug: "wedding-dresses", display_order: 0 },
    { categorySlug: "sewing", name_he: "שמלות ערב", name_ru: "Вечерние платья", slug: "evening-dresses", display_order: 1 },
    { categorySlug: "sewing", name_he: "תיקונים", name_ru: "Ремонт одежды", slug: "clothing-repairs", display_order: 2 },
    { categorySlug: "sewing", name_he: "וילונות וטקסטיל לבית", name_ru: "Шторы и домашний текстиль", slug: "curtains-textiles", display_order: 3 },

    // Financial Consulting (ייעוץ אישי וכלכלי)
    { categorySlug: "financial-consulting", name_he: "תכנון פנסיוני", name_ru: "Пенсионное планирование", slug: "pension-planning", display_order: 0 },

    // Food, Events, Activities (אוכל, צילום, אירועים והפעלות)
    { categorySlug: "food-events-activities", name_he: "סדנאות בישול ואפייה", name_ru: "Мастер-классы по кулинарии", slug: "cooking-workshops", display_order: 0 },
    { categorySlug: "food-events-activities", name_he: "עיצוב עוגות ומתוקים", name_ru: "Дизайн тортов и сладостей", slug: "cake-design", display_order: 1 },
    { categorySlug: "food-events-activities", name_he: "עיצוב בלונים ופרחים", name_ru: "Оформление шарами и цветами", slug: "balloon-flower-design", display_order: 2 },
    { categorySlug: "food-events-activities", name_he: "הפעלות לילדים", name_ru: "Детские мероприятия", slug: "kids-activities", display_order: 3 },
    { categorySlug: "food-events-activities", name_he: "צלמים", name_ru: "Фотографы", slug: "photographers", display_order: 4 },
    { categorySlug: "food-events-activities", name_he: "אוכל ביתי מוכן", name_ru: "Домашняя еда", slug: "home-food", display_order: 5 },

    // Business Services (שירותים לעסקים)
    { categorySlug: "business-services", name_he: "שירותי משרד", name_ru: "Офисные услуги", slug: "office-services", display_order: 0 },
    { categorySlug: "business-services", name_he: "בק אופיס", name_ru: "Бэк-офис", slug: "back-office", display_order: 1 },
    { categorySlug: "business-services", name_he: "מכבסה / שירותי כביסה", name_ru: "Прачечная", slug: "laundry", display_order: 2 },
    { categorySlug: "business-services", name_he: "תחזוקת משרדים", name_ru: "Обслуживание офисов", slug: "office-maintenance", display_order: 3 },
    { categorySlug: "business-services", name_he: "מערכות מיגון", name_ru: "Системы безопасности", slug: "security-systems", display_order: 4 },

    // Education & Learning (חינוך, למידה, בייביסיטר)
    { categorySlug: "education-learning", name_he: "מורים פרטיים", name_ru: "Репетиторы", slug: "private-teachers", display_order: 0 },
    { categorySlug: "education-learning", name_he: "בייביסיטר", name_ru: "Няня", slug: "babysitter", display_order: 1 },
    { categorySlug: "education-learning", name_he: "חוגים", name_ru: "Кружки", slug: "clubs", display_order: 2 },

    // Digital Consulting (ייעוץ דיגיטלי)
    { categorySlug: "digital-consulting", name_he: "בניית אתרים", name_ru: "Создание сайтов", slug: "website-building", display_order: 0 },

    // Real Estate (נדל״ן)
    { categorySlug: "real-estate", name_he: "ייעוץ נדל״ן", name_ru: "Консультации по недвижимости", slug: "real-estate-consulting", display_order: 0 },
    { categorySlug: "real-estate", name_he: "סוכני נדל״ן", name_ru: "Агенты по недвижимости", slug: "real-estate-agents", display_order: 1 },
  ]

  let subcatCount = 0
  for (const sub of subcategories) {
    const categoryId = categoryMap.get(sub.categorySlug)
    if (!categoryId) {
      console.log(`⚠️  Category not found: ${sub.categorySlug}`)
      continue
    }

    await prisma.subcategory.upsert({
      where: { category_id_slug: { category_id: categoryId, slug: sub.slug } },
      update: { name_he: sub.name_he, name_ru: sub.name_ru, display_order: sub.display_order },
      create: {
        category_id: categoryId,
        name_he: sub.name_he,
        name_ru: sub.name_ru,
        slug: sub.slug,
        display_order: sub.display_order,
        is_active: true,
      },
    })
    subcatCount++
  }
  console.log(`✅ Created/Updated ${subcatCount} subcategories`)

  // ============================================================================
  // 5. ADMIN USER
  // ============================================================================
  console.log('\n👤 Seeding admin user...')

  const adminEmail = process.env.ADMIN_EMAIL || '345287@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      is_active: true,
    },
  })
  console.log(`✅ Admin: ${adminEmail}`)

  // ============================================================================
  // 6. ADMIN SETTINGS
  // ============================================================================
  console.log('\n⚙️  Seeding admin settings...')

  await prisma.adminSettings.upsert({
    where: { key: 'top_pinned_count' },
    update: {},
    create: {
      key: 'top_pinned_count',
      value: '4',
      description: 'Number of pinned businesses to show at top of search results',
    },
  })
  console.log(`✅ Settings configured`)

  console.log('\n✅ Seed completed successfully!')
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
