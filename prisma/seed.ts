/**
 * Database Seed Script - Day 3
 * Run with: npm run prisma:seed
 *
 * Seeds:
 * - 1 city (Netanya)
 * - 4 neighborhoods
 * - 12 service categories
 * - 1 admin user
 * - Admin settings
 * - 20+ sample businesses for testing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

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
  console.log(`✅ City created: ${city.name_he} (${city.id})`)

  // ============================================================================
  // 2. NEIGHBORHOODS
  // ============================================================================
  console.log('\n🏘️  Seeding neighborhoods...')

  const neighborhoods = [
    {
      name_he: 'מרכז',
      name_ru: 'Центр',
      slug: 'merkaz',
      description_he: 'מרכז העיר נתניה',
      description_ru: 'Центр города Нетания',
      display_order: 1,
    },
    {
      name_he: 'צפון',
      name_ru: 'Север',
      slug: 'tsafon',
      description_he: 'צפון נתניה',
      description_ru: 'Северная Нетания',
      display_order: 2,
    },
    {
      name_he: 'דרום',
      name_ru: 'Юг',
      slug: 'darom',
      description_he: 'דרום נתניה',
      description_ru: 'Южная Нетания',
      display_order: 3,
    },
    {
      name_he: 'מזרח העיר',
      name_ru: 'Восток города',
      slug: 'mizrah-hair',
      description_he: 'מזרח נתניה',
      description_ru: 'Восточная Нетания',
      display_order: 4,
    },
  ]

  for (const hood of neighborhoods) {
    const created = await prisma.neighborhood.upsert({
      where: { city_id_slug: { city_id: city.id, slug: hood.slug } },
      update: {},
      create: {
        ...hood,
        city_id: city.id,
      },
    })
    console.log(`✅ Neighborhood: ${created.name_he} (${created.slug})`)
  }

  // ============================================================================
  // 3. CATEGORIES
  // ============================================================================
  console.log('\n📋 Seeding categories...')

  const categories = [
    {
      name_he: 'חשמלאים',
      name_ru: 'Электрики',
      slug: 'electricians',
      icon_name: 'bolt',
      is_popular: true,
      display_order: 1,
    },
    {
      name_he: 'אינסטלטורים',
      name_ru: 'Сантехники',
      slug: 'plumbers',
      icon_name: 'wrench',
      is_popular: true,
      display_order: 2,
    },
    {
      name_he: 'מסגרים',
      name_ru: 'Слесари',
      slug: 'locksmiths',
      icon_name: 'key',
      is_popular: true,
      display_order: 3,
    },
    {
      name_he: 'צבעים',
      name_ru: 'Маляры',
      slug: 'painters',
      icon_name: 'paint-brush',
      is_popular: false,
      display_order: 4,
    },
    {
      name_he: 'נקיון',
      name_ru: 'Уборка',
      slug: 'cleaning',
      icon_name: 'sparkles',
      is_popular: true,
      display_order: 5,
    },
    {
      name_he: 'טכנאי מזגנים',
      name_ru: 'Ремонт кондиционеров',
      slug: 'ac-technicians',
      icon_name: 'wind',
      is_popular: true,
      display_order: 6,
    },
    {
      name_he: 'גנים ונוף',
      name_ru: 'Садоводство',
      slug: 'gardening',
      icon_name: 'leaf',
      is_popular: false,
      display_order: 7,
    },
    {
      name_he: 'מתקני חשמל ומים',
      name_ru: 'Электромонтаж',
      slug: 'electricians-industrial',
      icon_name: 'cog',
      is_popular: false,
      display_order: 8,
    },
    {
      name_he: 'נגרים',
      name_ru: 'Плотники',
      slug: 'carpenters',
      icon_name: 'hammer',
      is_popular: false,
      display_order: 9,
    },
    {
      name_he: 'מורים פרטיים',
      name_ru: 'Репетиторы',
      slug: 'tutors',
      icon_name: 'academic-cap',
      is_popular: true,
      display_order: 10,
    },
    {
      name_he: 'רופאים',
      name_ru: 'Врачи',
      slug: 'doctors',
      icon_name: 'medical-bag',
      is_popular: false,
      display_order: 11,
    },
    {
      name_he: 'עורכי דין',
      name_ru: 'Адвокаты',
      slug: 'lawyers',
      icon_name: 'scale',
      is_popular: false,
      display_order: 12,
    },
  ]

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    console.log(`✅ Category: ${created.name_he} (${created.slug})`)
  }

  // ============================================================================
  // 4. ADMIN USER
  // ============================================================================
  console.log('\n👤 Seeding admin user...')

  const adminEmail = process.env.ADMIN_EMAIL || '345287@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const adminUser = await prisma.adminUser.upsert({
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
  console.log(`✅ Admin user: ${adminUser.email} (password: ${adminPassword})`)

  // ============================================================================
  // 5. ADMIN SETTINGS
  // ============================================================================
  console.log('\n⚙️  Seeding admin settings...')

  const topPinnedCount = await prisma.adminSettings.upsert({
    where: { key: 'top_pinned_count' },
    update: {},
    create: {
      key: 'top_pinned_count',
      value: '4',
      description: 'Number of pinned businesses to show at top of search results',
    },
  })
  console.log(`✅ Setting: ${topPinnedCount.key} = ${topPinnedCount.value}`)

  // ============================================================================
  // 6. SAMPLE BUSINESSES (for testing)
  // ============================================================================
  console.log('\n🏢 Seeding sample businesses...')

  // Get IDs we'll need
  const electriciansCategory = await prisma.category.findUnique({ where: { slug: 'electricians' } })
  const plumbersCategory = await prisma.category.findUnique({ where: { slug: 'plumbers' } })
  const cleaningCategory = await prisma.category.findUnique({ where: { slug: 'cleaning' } })
  const merkazNeighborhood = await prisma.neighborhood.findFirst({ where: { slug: 'merkaz' } })
  const tsafonNeighborhood = await prisma.neighborhood.findFirst({ where: { slug: 'tsafon' } })
  const daromNeighborhood = await prisma.neighborhood.findFirst({ where: { slug: 'darom' } })

  if (!electriciansCategory || !plumbersCategory || !cleaningCategory || !merkazNeighborhood || !tsafonNeighborhood || !daromNeighborhood) {
    throw new Error('Required categories or neighborhoods not found')
  }

  const businesses = [
    // Electricians in Merkaz (some pinned)
    {
      name_he: 'חשמל יוסי - מרכז',
      name_ru: 'Электрика Йоси - Центр',
      slug_he: 'hashmal-yossi-merkaz',
      slug_ru: 'elektrika-yosi-tsentr',
      description_he: 'שירותי חשמל מקצועיים במרכז נתניה. זמינות 24/7',
      description_ru: 'Профессиональные электрические услуги в центре Нетании. Доступность 24/7',
      city_id: city.id,
      neighborhood_id: merkazNeighborhood.id,
      category_id: electriciansCategory.id,
      address_he: 'רחוב הרצל 25, נתניה',
      address_ru: 'ул. Герцль 25, Нетания',
      phone: '+972501234567',
      whatsapp_number: '+972501234567',
      opening_hours_he: 'א׳-ה׳: 08:00-17:00, ו׳: 08:00-13:00',
      opening_hours_ru: 'Пн-Чт: 08:00-17:00, Пт: 08:00-13:00',
      is_visible: true,
      is_verified: true,
      is_pinned: true,
      pinned_order: 1,
    },
    {
      name_he: 'אור חשמל - שירות מהיר',
      name_ru: 'Ор Электрика - Быстрый сервис',
      slug_he: 'or-hashmal-sherut-mahir',
      slug_ru: 'or-elektrika-bystriy-servis',
      description_he: 'תיקוני חשמל ותחזוקה. ותק של 15 שנה בנתניה',
      description_ru: 'Ремонт и обслуживание электрики. 15 лет опыта в Нетании',
      city_id: city.id,
      neighborhood_id: merkazNeighborhood.id,
      category_id: electriciansCategory.id,
      address_he: 'שדרות בנימין 100, נתניה',
      phone: '+972502345678',
      is_visible: true,
      is_verified: true,
      is_pinned: true,
      pinned_order: 2,
    },
    {
      name_he: 'חשמל משה - צפון',
      slug_he: 'hashmal-moshe-tsafon',
      description_he: 'שירותי חשמל מקצועיים בצפון נתניה',
      city_id: city.id,
      neighborhood_id: tsafonNeighborhood.id,
      category_id: electriciansCategory.id,
      phone: '+972503456789',
      whatsapp_number: '+972503456789',
      is_visible: true,
      is_verified: false,
      is_pinned: false,
    },
    // Plumbers
    {
      name_he: 'אינסטלציה דוד - מומחים',
      name_ru: 'Сантехника Давид - Эксперты',
      slug_he: 'instalatsia-david-mumhim',
      slug_ru: 'santehnika-david-eksperty',
      description_he: 'שירותי אינסטלציה מקצועיים. פתיחת סתימות, תיקוני צנרת',
      description_ru: 'Профессиональные сантехнические услуги. Прочистка засоров, ремонт труб',
      city_id: city.id,
      neighborhood_id: merkazNeighborhood.id,
      category_id: plumbersCategory.id,
      phone: '+972504567890',
      whatsapp_number: '+972504567890',
      website_url: 'https://instalatsia-david.example.com',
      opening_hours_he: 'זמין 24/7',
      opening_hours_ru: 'Доступен 24/7',
      is_visible: true,
      is_verified: true,
      is_pinned: true,
      pinned_order: 3,
    },
    {
      name_he: 'אינסטלציה רון - דרום',
      slug_he: 'instalatsia-ron-darom',
      description_he: 'שירותי אינסטלציה בדרום נתניה',
      city_id: city.id,
      neighborhood_id: daromNeighborhood.id,
      category_id: plumbersCategory.id,
      whatsapp_number: '+972505678901',
      is_visible: true,
      is_verified: false,
      is_pinned: false,
    },
    {
      name_he: 'מים וצנרת - אבי',
      name_ru: 'Вода и трубы - Ави',
      slug_he: 'mayim-vetsineret-avi',
      slug_ru: 'voda-i-truby-avi',
      description_he: 'מומחה לתיקוני צנרת ודודים',
      description_ru: 'Специалист по ремонту труб и бойлеров',
      city_id: city.id,
      neighborhood_id: tsafonNeighborhood.id,
      category_id: plumbersCategory.id,
      phone: '+972506789012',
      is_visible: true,
      is_verified: true,
      is_pinned: false,
    },
    // Cleaning
    {
      name_he: 'ניקיון מושלם - אירינה',
      name_ru: 'Идеальная уборка - Ирина',
      slug_he: 'nikuyon-mushlam-irina',
      slug_ru: 'idealnaya-uborka-irina',
      description_he: 'שירותי ניקיון לבתים ומשרדים. צוות מקצועי ומנוסה',
      description_ru: 'Услуги уборки для домов и офисов. Профессиональная и опытная команда',
      city_id: city.id,
      neighborhood_id: merkazNeighborhood.id,
      category_id: cleaningCategory.id,
      phone: '+972507890123',
      whatsapp_number: '+972507890123',
      opening_hours_he: 'א׳-ו׳: 07:00-19:00',
      opening_hours_ru: 'Пн-Пт: 07:00-19:00',
      is_visible: true,
      is_verified: true,
      is_pinned: true,
      pinned_order: 4,
    },
    {
      name_he: 'ניקיון מהיר - צפון',
      slug_he: 'nikuyon-mahir-tsafon',
      description_he: 'שירותי ניקיון מהירים ויעילים בצפון נתניה',
      city_id: city.id,
      neighborhood_id: tsafonNeighborhood.id,
      category_id: cleaningCategory.id,
      whatsapp_number: '+972508901234',
      is_visible: true,
      is_verified: false,
      is_pinned: false,
    },
  ]

  for (const biz of businesses) {
    const created = await prisma.business.upsert({
      where: { slug_he: biz.slug_he },
      update: {},
      create: biz,
    })
    console.log(`✅ Business: ${created.name_he} (${created.slug_he})`)
  }

  // ============================================================================
  // 7. SAMPLE REVIEWS (for testing)
  // ============================================================================
  console.log('\n⭐ Seeding sample reviews...')

  const allBusinesses = await prisma.business.findMany()

  // Add 2-3 reviews for first few businesses
  const reviewsData = [
    {
      business_slug: 'hashmal-yossi-merkaz',
      rating: 5,
      comment_he: 'שירות מעולה! הגיע מהר ותיקן את הבעיה תוך חצי שעה.',
      comment_ru: 'Отличный сервис! Приехал быстро и решил проблему за полчаса.',
      author_name: 'דני כהן',
      language: 'he',
    },
    {
      business_slug: 'hashmal-yossi-merkaz',
      rating: 5,
      comment_he: 'ממליץ בחום! מקצועי וידידותי.',
      author_name: 'שרה לוי',
      language: 'he',
    },
    {
      business_slug: 'instalatsia-david-mumhim',
      rating: 4,
      comment_he: 'עבודה טובה, מחיר הוגן.',
      comment_ru: 'Хорошая работа, честная цена.',
      author_name: 'אלכסנדר',
      language: 'he',
    },
    {
      business_slug: 'nikuyon-mushlam-irina',
      rating: 5,
      comment_ru: 'Очень довольна! Чисто и аккуратно.',
      author_name: 'Ольга',
      language: 'ru',
    },
  ]

  for (const review of reviewsData) {
    const business = allBusinesses.find(b => b.slug_he === review.business_slug)
    if (business) {
      // Check if review already exists for this business by same author
      const existingReview = await prisma.review.findFirst({
        where: {
          business_id: business.id,
          author_name: review.author_name,
        },
      })

      if (!existingReview) {
        await prisma.review.create({
          data: {
            business_id: business.id,
            rating: review.rating,
            comment_he: review.comment_he || null,
            comment_ru: review.comment_ru || null,
            author_name: review.author_name,
            language: review.language,
            is_approved: true,
          },
        })
        console.log(`✅ Review for: ${business.name_he} (${review.rating}⭐)`)
      } else {
        console.log(`⏭️  Review already exists for: ${business.name_he} by ${review.author_name}`)
      }
    }
  }

  console.log('\n✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - 1 city`)
  console.log(`   - 4 neighborhoods`)
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${businesses.length} sample businesses`)
  console.log(`   - ${reviewsData.length} sample reviews`)
  console.log(`   - 1 admin user (${adminEmail})`)
  console.log(`   - 1 admin setting`)
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
