import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.privacy' })
  return {
    title: t('title'),
    description: t('intro'),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy')
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

        {/* Intro */}
        <div className="mb-8 rounded-lg bg-blue-50 p-6">
          <p className="text-lg text-gray-800">{t('intro')}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          {/* Section 1: מידע שאנו אוספים */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">{t('section1.title')}</h2>

            <div className="mb-4">
              <h3 className="mb-2 text-xl font-semibold">
                {t('section1.subsection1.title')}
              </h3>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>{t('section1.subsection1.items.0')}</li>
                <li>{t('section1.subsection1.items.1')}</li>
                <li>{t('section1.subsection1.items.2')}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">
                {t('section1.subsection2.title')}
              </h3>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>{t('section1.subsection2.items.0')}</li>
                <li>{t('section1.subsection2.items.1')}</li>
                <li>{t('section1.subsection2.items.2')}</li>
              </ul>
            </div>
          </section>

          {/* Section 2: כיצד אנו משתמשים במידע */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section2.title')}</h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section2.items.0')}</li>
              <li>{t('section2.items.1')}</li>
              <li>{t('section2.items.2')}</li>
              <li>{t('section2.items.3')}</li>
              <li>{t('section2.items.4')}</li>
              <li>{t('section2.items.5')}</li>
            </ul>
          </section>

          {/* Section 3: שיתוף מידע */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section3.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section3.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section3.items.0')}</li>
              <li>{t('section3.items.1')}</li>
              <li>{t('section3.items.2')}</li>
            </ul>
          </section>

          {/* Section 4: Cookies */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section4.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section4.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section4.items.0')}</li>
              <li>{t('section4.items.1')}</li>
              <li>{t('section4.items.2')}</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">{t('section4.control')}</p>
          </section>

          {/* Section 5: אבטחת מידע */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section5.title')}</h2>
            <p className="text-gray-700">{t('section5.content')}</p>
          </section>

          {/* Section 6: זכויותיך */}
          <section className="rounded-lg bg-yellow-50 p-6">
            <h2 className="mb-3 text-2xl font-bold">{t('section6.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section6.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section6.items.0')}</li>
              <li>{t('section6.items.1')}</li>
              <li>{t('section6.items.2')}</li>
              <li>{t('section6.items.3')}</li>
              <li>{t('section6.items.4')}</li>
            </ul>
            <p className="mt-4 text-sm font-medium text-gray-800">
              {t('section6.contact')}
            </p>
          </section>

          {/* Section 7: שמירת מידע */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section7.title')}</h2>
            <p className="text-gray-700">{t('section7.content')}</p>
          </section>

          {/* Section 8: קישורים לאתרים אחרים */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section8.title')}</h2>
            <p className="text-gray-700">{t('section8.content')}</p>
          </section>

          {/* Section 9: שינויים במדיניות */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section9.title')}</h2>
            <p className="text-gray-700">{t('section9.content')}</p>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <h2 className="mb-3 text-2xl font-bold">{t('contact.title')}</h2>
            <p className="mb-2 text-gray-700">{t('contact.content')}</p>
            <p className="text-gray-700">{t('contact.email')}</p>
            <p className="text-gray-700">{t('contact.address')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
