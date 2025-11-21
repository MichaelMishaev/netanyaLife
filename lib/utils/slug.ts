import { prisma } from '@/lib/prisma'

/**
 * Hebrew to Latin transliteration map
 */
const HEBREW_TO_LATIN: Record<string, string> = {
  // Consonants
  א: 'a',
  ב: 'b',
  ג: 'g',
  ד: 'd',
  ה: 'h',
  ו: 'v',
  ז: 'z',
  ח: 'ch',
  ט: 't',
  י: 'y',
  כ: 'k',
  ך: 'k',
  ל: 'l',
  מ: 'm',
  ם: 'm',
  נ: 'n',
  ן: 'n',
  ס: 's',
  ע: '',
  פ: 'p',
  ף: 'p',
  צ: 'ts',
  ץ: 'ts',
  ק: 'k',
  ר: 'r',
  ש: 'sh',
  ת: 't',
  // Vowels (niqqud)
  '\u05B0': 'e', // sheva
  '\u05B1': 'e', // hataf segol
  '\u05B2': 'a', // hataf patah
  '\u05B3': 'o', // hataf qamats
  '\u05B4': 'i', // hiriq
  '\u05B5': 'e', // tsere
  '\u05B6': 'e', // segol
  '\u05B7': 'a', // patah
  '\u05B8': 'a', // qamats
  '\u05B9': 'o', // holam
  '\u05BB': 'u', // qubuts
  '\u05BC': '', // dagesh
  '\u05BD': '', // meteg
  '\u05BF': '', // rafe
  '\u05C0': '', // paseq
  '\u05C1': '', // shin dot
  '\u05C2': '', // sin dot
  '\u05C3': '', // sof pasuq
}

/**
 * Russian/Cyrillic to Latin transliteration map
 */
const RUSSIAN_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ё: 'Yo',
  Ж: 'Zh',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'Kh',
  Ц: 'Ts',
  Ч: 'Ch',
  Ш: 'Sh',
  Щ: 'Shch',
  Ъ: '',
  Ы: 'Y',
  Ь: '',
  Э: 'E',
  Ю: 'Yu',
  Я: 'Ya',
}

/**
 * Transliterate Hebrew or Russian text to Latin characters
 */
function transliterate(text: string): string {
  return text
    .split('')
    .map((char) => {
      if (HEBREW_TO_LATIN[char]) return HEBREW_TO_LATIN[char]
      if (RUSSIAN_TO_LATIN[char]) return RUSSIAN_TO_LATIN[char]
      return char
    })
    .join('')
}

/**
 * Create a URL-safe slug from text
 */
export function createSlug(text: string): string {
  return (
    transliterate(text)
      .toLowerCase()
      // Remove all non-alphanumeric characters except hyphens and spaces
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace multiple spaces or hyphens with single hyphen
      .replace(/[\s-]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Fallback if empty (all special chars)
      || 'business'
  )
}

/**
 * Generate a unique slug for a business by checking database and adding numeric suffix if needed
 */
export async function generateUniqueBusinessSlug(
  name: string,
  language: 'he' | 'ru'
): Promise<string> {
  const baseSlug = createSlug(name)
  const slugField = language === 'he' ? 'slug_he' : 'slug_ru'

  // Check if base slug exists
  const existing = await prisma.business.findFirst({
    where: { [slugField]: baseSlug },
    select: { id: true },
  })

  if (!existing) {
    return baseSlug
  }

  // If exists, find the next available number
  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (true) {
    const exists = await prisma.business.findFirst({
      where: { [slugField]: uniqueSlug },
      select: { id: true },
    })

    if (!exists) {
      return uniqueSlug
    }

    counter++
    uniqueSlug = `${baseSlug}-${counter}`

    // Failsafe: prevent infinite loop
    if (counter > 1000) {
      return `${baseSlug}-${Date.now()}`
    }
  }
}
