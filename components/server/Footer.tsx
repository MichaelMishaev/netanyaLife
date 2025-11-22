import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'

export default async function Footer() {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const locale = await getLocale()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-3 md:py-8">
        {/* Mobile: Compact single-line footer */}
        <div className="md:hidden">
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
            <Link href="/terms" className="hover:text-gray-900">{t('terms')}</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-900">{t('privacy')}</Link>
            <span>•</span>
            <Link href="/accessibility" className="hover:text-gray-900">{t('accessibility')}</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gray-900">{t('contact')}</Link>
          </div>
          <div className="mt-3 flex justify-center">
            <a
              href="https://wa.me/9720555020829"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
              aria-label="WhatsApp תמיכה"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              תמיכה
            </a>
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            {t('copyright', { year: currentYear })}
          </div>
          <div className="mt-2 text-center">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              title={tNav('admin')}
            >
              ⚙️ <span>{tNav('admin')}</span>
            </Link>
          </div>
        </div>

        {/* Desktop: Full footer with sections */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="mb-4 font-bold">{t('about')}</h3>
              <p className="text-sm text-gray-600">
                מדריך עסקים מקומיים לתושבי נתניה
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-bold">קישורים</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                    {t('terms')}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="text-gray-600 hover:text-gray-900">
                    {t('accessibility')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                    {t('contact')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-bold">יצירת קשר</h3>
              <p className="text-sm text-gray-600">
                netanya-local@example.com
              </p>
              <a
                href="https://wa.me/9720555020829"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
                aria-label="WhatsApp תמיכה"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                תמיכה בוואטסאפ
              </a>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center">
            <div className="mb-3">
              <Link
                href={`/${locale}/admin`}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                title={tNav('admin')}
              >
                ⚙️ <span>{tNav('admin')}</span>
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              {t('copyright', { year: currentYear })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
