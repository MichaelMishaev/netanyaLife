/**
 * Import Firebase Businesses Script
 * Adds missing subcategories, neighborhoods, and imports businesses
 * Run with: npx tsx scripts/import-firebase-businesses.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to generate slug
function generateSlug(text: string): string {
  const translitMap: Record<string, string> = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
    'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
    'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
    ' ': '-', '"': '', '״': '', '\'': '', '/': '-', '׳': ''
  }

  let slug = ''
  for (const char of text.toLowerCase()) {
    slug += translitMap[char] || char
  }
  return slug.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// Map neighborhood names to slugs
const neighborhoodMap: Record<string, string> = {
  'דרום העיר': 'darom',
  'צפון העיר': 'tsafon',
  'מרכז העיר': 'merkaz',
  'מזרח העיר': 'mizrach',
  'שכונת בן ציון': 'ben-zion',
  'קריית השרון': 'kiryat-hasharon',
  'שכונת סלע': 'sela',
}

// Missing subcategories to add
const missingSubcategories = [
  { name_he: 'מניקור ופדיקור', name_ru: 'Маникюр и педикюр', parentSlug: 'hair-beauty-cosmetics' },
  { name_he: 'עורך דין נדל״ן', name_ru: 'Юрист по недвижимости', parentSlug: 'lawyers' },
  { name_he: 'חוגים', name_ru: 'Кружки', parentSlug: 'education-learning' },
  { name_he: 'שמלות ערב', name_ru: 'Вечерние платья', parentSlug: 'sewing' },
  { name_he: 'תיקונים', name_ru: 'Ремонт одежды', parentSlug: 'sewing' },
  { name_he: 'לוכד נחשים', name_ru: 'Ловец змей', parentSlug: 'environment-animals' },
  { name_he: 'בייביסיטר', name_ru: 'Няня', parentSlug: 'education-learning' },
  { name_he: 'מורה לנהיגה', name_ru: 'Инструктор по вождению', parentSlug: 'transportation' },
  { name_he: 'ניקיון', name_ru: 'Уборка', parentSlug: 'home-services' },
  { name_he: 'תחזוקת משרדים', name_ru: 'Обслуживание офисов', parentSlug: 'business-services' },
  { name_he: 'מערכות מיגון', name_ru: 'Системы безопасности', parentSlug: 'business-services' },
  { name_he: 'נטורופתיה', name_ru: 'Натуропатия', parentSlug: 'health-wellness' },
  { name_he: 'מאמני כושר', name_ru: 'Фитнес тренеры', parentSlug: 'health-wellness' },
  { name_he: 'צלמים', name_ru: 'Фотографы', parentSlug: 'food-events-activities' },
  { name_he: 'אוכל ביתי מוכן', name_ru: 'Домашняя еда', parentSlug: 'food-events-activities' },
  { name_he: 'וילונות וטקסטיל לבית', name_ru: 'Шторы и домашний текстиль', parentSlug: 'sewing' },
  { name_he: 'זגגות רכב', name_ru: 'Автостекла', parentSlug: 'transportation' },
  { name_he: 'סוכני נדל״ן', name_ru: 'Агенты по недвижимости', parentSlug: 'real-estate' },
  { name_he: 'תכנון ועיצוב פנים', name_ru: 'Дизайн интерьера', parentSlug: 'home-services' },
  { name_he: '״🥳 הפעלות לילדים ואירועים״', name_ru: 'Детские мероприятия', parentSlug: 'food-events-activities' },
  { name_he: '📸 צילומי תדמית ועסקים', name_ru: 'Бизнес фотография', parentSlug: 'food-events-activities' },
]

// Missing neighborhoods to add
const missingNeighborhoods = [
  { name_he: 'שכונת בן ציון', name_ru: 'Бен-Цион', slug: 'ben-zion', display_order: 5 },
  { name_he: 'קריית השרון', name_ru: 'Кирьят а-Шарон', slug: 'kiryat-hasharon', display_order: 6 },
  { name_he: 'שכונת סלע', name_ru: 'Села', slug: 'sela', display_order: 7 },
]

// Businesses to import (only those with neighborhoods)
const businessesToImport = [
  { name: 'שוש גרינשטיין', category: 'מניקור ופדיקור', neighborhood: 'דרום העיר', phone: '+972545722530', description: 'ניסיון של 18 שנים פדיקוריסטית רפואית ומורה לפדיקור.בונה ציפורניים ולק גל בכל השיטות' },
  { name: 'גואל פילוריאן', category: 'חוזים', neighborhood: null, phone: '+972548073949', description: 'עוסק בנדלן, חוזים, צוואות, ייפוי כח מתמשך, תחום אזרחי בבתי משפט, ייצוג זוכים בהוצאה לפועל' },
  { name: 'גואל פילוריאן', category: 'עורך דין נדל״ן', neighborhood: null, phone: '+972548073949', description: 'עוסק בנדלן, חוזים, צוואות, ייפוי כח מתמשך, תחום אזרחי בבתי משפט, ייצוג זוכים בהוצאה לפועל' },
  { name: 'אושרית קצנטיני', category: 'מניקור ופדיקור', neighborhood: 'דרום העיר', phone: '+972506555050', description: 'פדיקוריסטית/ מניקוריסטית עם הכשרה מטעם אגודת איל לטיפול בסכרתיים.' },
  { name: 'אופיר שמש', category: 'לוכד נחשים', neighborhood: 'מרכז העיר', phone: '+972529202446', description: 'לוכד נחשים מנוסה, מורשה רשות הטבע והגנים' },
  { name: 'עדי אסף', category: 'קוסמטיקה', neighborhood: 'מרכז העיר', phone: '+972544312462', description: 'מאפרת ומסרקת לקוחות פרטיים- כלות וערב' },
  { name: 'עדי אסף', category: 'סדנאות איפור', neighborhood: 'מרכז העיר', phone: '+972544312462', description: 'סדנאת איפור וליווי צמוד' },
  { name: 'עדי אס', category: '📸 צילומי תדמית ועסקים', neighborhood: 'מרכז העיר', phone: '+972544312462', description: 'צילומי תדמית, הפקות, מותגי אופנה כמו הודיס, אייס קיוב,לאישה' },
  { name: 'ביסרט מתיקו', category: 'בייביסיטר', neighborhood: 'מזרח העיר', phone: '+972548589227', description: 'חברותית מאד, אוהבת ילדים, מתן עזרה בשיעורי בית' },
  { name: 'ויקטור עין אלי', category: 'חשמלאים', neighborhood: 'מרכז העיר', phone: '+972523598225', description: 'טיפול בלוחות חשמל, תקלות וקצרים, כל עבודות החשמל' },
  { name: 'חשמל נתניה', category: 'חשמלאים', neighborhood: 'מרכז העיר', phone: '+972522422351', description: 'חשמלאי מוסמך מעל 30 שנה , נותן שירות בתחום החשמל למגזר הפרטי ועסקי כולל תקלות חשמל מכל הסוגים' },
  { name: 'חשמל נתניה', category: 'תחזוקת משרדים', neighborhood: 'מרכז העיר', phone: '+972522422351', description: 'חשמלאי מוסמך מעל 30 שנה , נותן שירות בתחום החשמל למגזר הפרטי ועסקי כולל תקלות חשמל מכל הסוגים' },
  { name: 'מיטל דוידי', category: 'קוסמטיקה', neighborhood: null, phone: '+972525634707', description: 'מאפרת מקצועית ומסדרת שיער, מגיעה למקום ההתארגנות' },
  { name: 'מיטל דוידי', category: 'עיצוב שיער', neighborhood: null, phone: '+972525634707', description: 'מאפרת מקצועית ומסדרת שיער, מגיעה למקום ההתארגנות' },
  { name: 'עירית נווה', category: 'תכנון ועיצוב פנים', neighborhood: null, phone: '+972544442344', description: 'עיצוב פנים לגילאי 60+ מתמחה בהתאמת בתים לגיל השלישי החדש – רגיש, פרקטי ואסתטי.' },
  { name: 'רוזין טכנולוגיה', category: 'בק אופיס', neighborhood: null, phone: '+972544448140', description: 'מכירה ותיקון מחשבים, התקנת מצלמות אבטחה, אינטרקום עם בקרי כניסה, פתרונות תקשורת לעסקים בענן' },
  { name: 'רוזין טכנולוגיה', category: 'מחשבים נייחים וניידים', neighborhood: null, phone: '+972544448140', description: 'מכירה ותיקון מחשבים' },
  { name: 'רוזין טכנולוגיה', category: 'מערכות מיגון', neighborhood: null, phone: '+972544448140', description: 'מכירה ותיקון מחשבים, התקנת מצלמות אבטחה, אינטרקום עם בקרי כניסה, פתרונות תקשורת לעסקים בענן' },
  { name: 'סאלי הובלות', category: 'הובלות', neighborhood: 'דרום העיר', phone: '+972585805800', description: 'הובלות בכל הארץ, לא בשבת' },
  { name: 'אורית סוויד', category: 'סדנאות בישול ואפייה', neighborhood: 'מרכז העיר', phone: '+972504330656', description: 'סדנת בישול בריא, אוכל מוכן צמחוני טבעוני דגים הזמנות מראש' },
  { name: 'ספורטיבטי הפעלות ילדים', category: '״🥳 הפעלות לילדים ואירועים״', neighborhood: null, phone: '+972548086110', description: 'הפעלות ימי הולדת, ימי גיבוש, בת מצוו, מסיבות ועוד' },
  { name: 'AV Mobile', category: 'טכנאי סלולר ותיקונים', neighborhood: null, phone: '+972526651659', description: 'טכנאי עד הבית של סלולר, נייד,תיקון מסך, החלפת סוללה, העברת נתונים, פתיחה למכשירים נעולים ועוד...' },
  { name: 'A.R Cameras&Security', category: 'מערכות מיגון לבית', neighborhood: null, phone: '+972544472018', description: 'כל סוגי ההתקנות - מצלמות, אזעקות, גלאים, קודניות, אינטרקום, מערכות מוזיקה, כל סוגי התקשורת' },
  { name: 'A.R Cameras&Security', category: 'מערכות מיגון', neighborhood: null, phone: '+972544472018', description: 'כל סוגי ההתקנות - מצלמות, אזעקות, גלאים, קודניות, אינטרקום, מערכות מוזיקה, כל סוגי התקשורת' },
  { name: 'handy master', category: 'הנדימן', neighborhood: null, phone: '+972538616232', description: 'תיקונים כלליים,צבע,טיוח,אינסטלציה וחשמל, שיפוצים ועוד.' },
  { name: 'ללי תופרת', category: 'תיקונים', neighborhood: null, phone: '+972507536367', description: 'תפירת שמלות כלה וערב, תיקונים לשמלות ובגדים' },
  { name: 'שי תורגמן', category: 'ייעוץ נדל״ן', neighborhood: null, phone: '+972504447632', description: 'מתמחה במציאת נדלן, פינוי בינוי בכל רחבי העיר.' },
  { name: 'שי תורגמן', category: 'סוכני נדל״ן', neighborhood: null, phone: '+972504447632', description: 'מתמחה במציאת נדלן, פינוי בינוי בכל רחבי העיר.' },
  { name: 'eyewatch רועי', category: 'מערכות מיגון', neighborhood: null, phone: '+972522248058', description: 'מערכות מיגון ומצלמות אבטחה' },
  { name: 'איציק סוויסה', category: 'הנדימן', neighborhood: null, phone: '+972532750836', description: 'הנדימן עבודות פירוק והרכבה,צביעה וכו׳' },
  { name: 'איתן מזרחי', category: 'הנדימן', neighborhood: null, phone: '+972503099910', description: 'הנדימן,חשמלאי מוסמך' },
  { name: 'אלי', category: 'חשמלאים', neighborhood: null, phone: '+972523421565', description: 'חשמלאי מוסמך עם ותק מעל 30 שנה' },
  { name: 'משכנטוב - ייעוץ משכנתאות', category: 'תכנון פנסיוני', neighborhood: null, phone: '+972522979097', description: 'ייעוץ וליווי עד קבלת המשכנתא/ ההלוואה הכי משתלמת עבורך!' },
  { name: 'משכנטוב - ייעוץ משכנתאות', category: 'ייעוץ נדל״ן', neighborhood: null, phone: '+972522979097', description: 'ייעוץ וליווי עד קבלת המשכנתא/ ההלוואה הכי משתלמת עבורך!' },
  { name: 'אושר נורמטוב', category: 'מורים פרטיים', neighborhood: null, phone: '+972585020797', description: 'מורה לכלל המקצועות, החל מכתה א עד הכנה לבגרות ואפילו לתואר הנדסה/ מדוייקים. מהנדס חשמל במקצוע.' },
  { name: 'המאסטרים לניקיון', category: 'ניקיון', neighborhood: null, phone: '+972528202633', description: 'חברת ניקיון לבניינים , דירות לפני ואחרי איכלוס , ניקיון משרדים ועוד' },
  { name: 'המאסטרים לניקיון', category: 'שירותי משרד', neighborhood: null, phone: '+972528202633', description: 'חברת ניקיון לבניינים , דירות לפני ואחרי איכלוס , ניקיון משרדים ועוד' },
  { name: 'ורד כהן בלוני׳ס', category: 'עיצוב בלונים ופרחים', neighborhood: null, phone: '+972526410104', description: 'עיצוב אירועים בלונים ופרחים, בשבילכם לכל עיצוב וחגיגה' },
  { name: 'לילך הלל', category: 'טיפול רגשי ופסיכותרפיה', neighborhood: null, phone: '+972545536290', description: 'טיפול רגשי לילדים ונוער בעזרת בעלי חיים, הדרכות הורים' },
  { name: 'חמי תמיר', category: 'ייעוץ נדל״ן', neighborhood: null, phone: '+972509331191', description: 'משרד בונות עתיד - טום לנטוס 10' },
  { name: 'תופרת ליליה', category: 'וילונות וטקסטיל לבית', neighborhood: null, phone: '+97298828326', description: 'תופרות כל סוגי התיקונים, כולל וילונות, מדים, תיקונים לשמלות ערב וכלה' },
  { name: 'תופרת ליליה', category: 'שמלות ערב', neighborhood: null, phone: '+97298828326', description: 'כל סוגי התיקונים, כולל וילונות, מדים, תיקונים לשמלות ערב וכלה' },
  { name: 'תופרת ליליה', category: 'תיקונים', neighborhood: null, phone: '+97298828326', description: 'כל סוגי התיקונים, כולל וילונות, מדים, תיקונים לשמלות ערב וכלה' },
  { name: 'נטלי ידן', category: 'עיסוי', neighborhood: null, phone: '+972525228008', description: 'מעסה מקצועית ועוד טיפולים רפואה סינית לנשים בלבד' },
  { name: 'עוז שני', category: 'הסעות', neighborhood: null, phone: '+972528146655', description: 'שירותי הסעות לבעלי מוגבלויות ברכב נגיש' },
  { name: 'רימה', category: 'מורים פרטיים', neighborhood: null, phone: '+972525214917', description: 'מורה לכלל המקצועות, החל מכתה א עד הכנה לבגרות.' },
  { name: 'לינור הרוש', category: 'הדבקת ריסים', neighborhood: null, phone: '+972523623441', description: 'הדבקת ריסים בשיטה הקרה' },
  { name: 'מקס המקסים מולגן', category: 'ייעוץ נדל״ן', neighborhood: null, phone: '+972546932101', description: 'אלי פונים רק אחרי שניסתם למכור לבד ולא הצלחתם' },
  { name: 'דנה שלזינגר', category: 'אוכל ביתי מוכן', neighborhood: null, phone: '+972528720262', description: 'מכירת ג׳חנון חלבי עשוי מחמאה ודבש' },
  { name: 'דנה שלזינגר', category: 'עיצוב עוגות ומתוקים', neighborhood: null, phone: '+972528720262', description: 'מעצבת עוגות, מעבירה סדנאות אפייה וימי הולדת לילדים ומבוגרים אצלי או בביתכם' },
  { name: 'אוראל טייב', category: 'תכנון פנסיוני', neighborhood: null, phone: '+972527795345', description: 'מתכנן פנסיוני, פנסיה, ביטוח ופיננסים' },
  { name: 'רחל ללו', category: 'טיפול רגשי ופסיכותרפיה', neighborhood: null, phone: '+972525799047', description: 'עו״ס קלינית פסיכותרפיסטית Cbt,טיפול רגשי בילדים, נוער ומבוגרים' },
  { name: 'אביבה שני', category: 'בק אופיס', neighborhood: null, phone: '+972528895222', description: '' },
  { name: 'ניקול מתתיהו', category: 'עיצוב שיער', neighborhood: null, phone: '+972526144194', description: 'החלקה אורגנית, אחריות מלאה, חפיפה באותו היום' },
  { name: 'שמוליק גנדלמן', category: 'מורה לנהיגה', neighborhood: null, phone: '+972522445323', description: 'מורה לנהיגה' },
  { name: 'אופיר עיצוב שיער לגבר', category: 'עיצוב שיער', neighborhood: null, phone: '+972502234454', description: 'עיצוב שיער גברים וילדים' },
  { name: 'אמילי בל לנדסמן נדלן', category: 'ייעוץ נדל״ן', neighborhood: null, phone: '+972506396531', description: 'אמילי בל עובדת בשיווק פרויקטים , נכסי יוקרה ויד שניה ! עם קהל לקוחות רחב' },
  { name: 'מנשה בן יוסף', category: 'פסיכותרפיה', neighborhood: null, phone: '+972546369312', description: 'פסיכותרפיה לילדים, זוגיות ובעיות אישיות' },
  { name: 'אריה שטרן', category: 'זגגות רכב', neighborhood: null, phone: '+972505336586', description: '' },
  { name: 'ליאור בוקרה', category: 'אינסטלטורים', neighborhood: null, phone: '+972544920120', description: 'שירות אמין מחירים נוחים' },
  { name: 'ליעד פוגל - פוגל נכסים', category: 'ייעוץ נדל״ן', neighborhood: null, phone: '+972546122661', description: 'הערכת שווי לנכס לפניי מכירה על ידי מתווכים מקצועיים שחיים את האזור תוך 12 שעות בלבד' },
  { name: 'יהונתן ארנון', category: 'מאמני כושר', neighborhood: null, phone: '+972524749837', description: '' },
]

async function main() {
  console.log('🌱 Starting Firebase business import...\n')

  // Get city
  const city = await prisma.city.findFirst({ where: { slug: 'netanya' } })
  if (!city) throw new Error('City not found')

  // ============================================================================
  // 1. ADD MISSING NEIGHBORHOODS
  // ============================================================================
  console.log('🏘️  Adding missing neighborhoods...')

  for (const hood of missingNeighborhoods) {
    const existing = await prisma.neighborhood.findFirst({
      where: { city_id: city.id, slug: hood.slug }
    })

    if (!existing) {
      await prisma.neighborhood.create({
        data: {
          city_id: city.id,
          name_he: hood.name_he,
          name_ru: hood.name_ru,
          slug: hood.slug,
          display_order: hood.display_order,
          is_active: true,
        }
      })
      console.log(`  ✅ Added neighborhood: ${hood.name_he}`)
    } else {
      console.log(`  ⏭️  Neighborhood exists: ${hood.name_he}`)
    }
  }

  // ============================================================================
  // 2. ADD MISSING SUBCATEGORIES
  // ============================================================================
  console.log('\n📋 Adding missing subcategories...')

  for (const sub of missingSubcategories) {
    const parentCategory = await prisma.category.findFirst({
      where: { slug: sub.parentSlug }
    })

    if (!parentCategory) {
      console.log(`  ❌ Parent category not found: ${sub.parentSlug} for ${sub.name_he}`)
      continue
    }

    const slug = generateSlug(sub.name_he)

    const existing = await prisma.subcategory.findFirst({
      where: {
        category_id: parentCategory.id,
        name_he: sub.name_he
      }
    })

    if (!existing) {
      await prisma.subcategory.create({
        data: {
          category_id: parentCategory.id,
          name_he: sub.name_he,
          name_ru: sub.name_ru,
          slug: slug,
          is_active: true,
          display_order: 99,
        }
      })
      console.log(`  ✅ Added subcategory: ${sub.name_he} (under ${parentCategory.name_he})`)
    } else {
      console.log(`  ⏭️  Subcategory exists: ${sub.name_he}`)
    }
  }

  // ============================================================================
  // 3. IMPORT BUSINESSES
  // ============================================================================
  console.log('\n🏢 Importing businesses...')

  // Get all neighborhoods
  const neighborhoods = await prisma.neighborhood.findMany()
  const neighborhoodByName: Record<string, string> = {}
  for (const n of neighborhoods) {
    neighborhoodByName[n.name_he] = n.id
    // Also map common variations
    if (n.slug === 'darom') neighborhoodByName['דרום העיר'] = n.id
    if (n.slug === 'tsafon') neighborhoodByName['צפון העיר'] = n.id
    if (n.slug === 'merkaz') neighborhoodByName['מרכז העיר'] = n.id
    if (n.slug === 'mizrach') neighborhoodByName['מזרח העיר'] = n.id
  }

  // Get default neighborhood (merkaz)
  const defaultNeighborhood = neighborhoods.find(n => n.slug === 'merkaz')
  if (!defaultNeighborhood) throw new Error('Default neighborhood not found')

  // Get all categories and subcategories
  const categories = await prisma.category.findMany({ include: { subcategories: true } })

  let importedCount = 0
  let skippedCount = 0

  for (const biz of businessesToImport) {
    // Find category or subcategory
    let categoryId: string | null = null
    let subcategoryId: string | null = null

    // First check if it's a subcategory
    for (const cat of categories) {
      const matchingSub = cat.subcategories.find(s => s.name_he === biz.category)
      if (matchingSub) {
        categoryId = cat.id
        subcategoryId = matchingSub.id
        break
      }
    }

    // If not found as subcategory, check if it's a main category
    if (!categoryId) {
      const matchingCat = categories.find(c => c.name_he === biz.category)
      if (matchingCat) {
        categoryId = matchingCat.id
      }
    }

    if (!categoryId) {
      console.log(`  ❌ Category not found: ${biz.category} for ${biz.name}`)
      skippedCount++
      continue
    }

    // Get neighborhood
    let neighborhoodId = defaultNeighborhood.id
    if (biz.neighborhood && neighborhoodByName[biz.neighborhood]) {
      neighborhoodId = neighborhoodByName[biz.neighborhood]
    }

    // Generate unique slug
    const baseSlug = generateSlug(biz.name)
    const uniqueSlug = `${baseSlug}-${Date.now() % 100000}`

    // Check if business with same name and phone already exists
    const existing = await prisma.business.findFirst({
      where: {
        name_he: biz.name,
        phone: biz.phone,
      }
    })

    if (existing) {
      console.log(`  ⏭️  Business exists: ${biz.name}`)
      skippedCount++
      continue
    }

    // Create business
    await prisma.business.create({
      data: {
        name_he: biz.name,
        slug_he: uniqueSlug,
        description_he: biz.description || null,
        city_id: city.id,
        neighborhood_id: neighborhoodId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        phone: biz.phone,
        whatsapp_number: biz.phone, // Assume same as phone
        is_visible: true,
        is_verified: false,
        is_pinned: false,
        is_test: false, // NOT test - real businesses
      }
    })

    importedCount++
    console.log(`  ✅ Imported: ${biz.name} (${biz.category})`)
  }

  console.log(`\n✅ Import completed!`)
  console.log(`   Imported: ${importedCount}`)
  console.log(`   Skipped: ${skippedCount}`)

  // Summary
  const totalBusinesses = await prisma.business.count()
  const realBusinesses = await prisma.business.count({ where: { is_test: false } })
  console.log(`\n📊 Database Summary:`)
  console.log(`   Total businesses: ${totalBusinesses}`)
  console.log(`   Real businesses: ${realBusinesses}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Import failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
