import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.terms' })
  return {
    title: t('title'),
    description: t('section1.content'),
  }
}

export default async function TermsPage() {
  const t = await getTranslations('legal.terms')
  const currentDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-600">
            {t('lastUpdated', { date: currentDate })}
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          {/* Section 1: כללי */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section1.title')}</h2>
            <p className="text-gray-700">{t('section1.content')}</p>
          </section>

          {/* Section 2: השירות */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section2.title')}</h2>
            <p className="text-gray-700">{t('section2.content')}</p>
          </section>

          {/* Section 3: הוספת עסקים */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section3.title')}</h2>
            <p className="text-gray-700">{t('section3.content')}</p>
          </section>

          {/* Section 4: ביקורות ותוכן משתמשים */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section4.title')}</h2>
            <p className="text-gray-700">{t('section4.content')}</p>
          </section>

          {/* Section 5: קניין רוחני */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section5.title')}</h2>
            <p className="text-gray-700">{t('section5.content')}</p>
          </section>

          {/* Section 6: הגבלת אחריות */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section6.title')}</h2>
            <p className="text-gray-700">{t('section6.content')}</p>
          </section>

          {/* Section 7: שינויים בתקנון */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section7.title')}</h2>
            <p className="text-gray-700">{t('section7.content')}</p>
          </section>

          {/* Section 8: דין חל ושיפוט */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section8.title')}</h2>
            <p className="text-gray-700">{t('section8.content')}</p>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <h2 className="mb-3 text-2xl font-bold">{t('contact.title')}</h2>
            <p className="text-gray-700">{t('contact.content')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
