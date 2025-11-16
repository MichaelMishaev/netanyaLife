import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Footer() {
  const t = await getTranslations('footer')
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
          <div className="mt-2 text-center text-xs text-gray-500">
            {t('copyright', { year: currentYear })}
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
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            {t('copyright', { year: currentYear })}
          </div>
        </div>
      </div>
    </footer>
  )
}
