import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.accessibility' })
  return {
    title: t('title'),
    description: t('intro'),
  }
}

export default async function AccessibilityPage() {
  const t = await getTranslations('legal.accessibility')
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
          <div className="mb-4 flex items-center gap-3">
            <span className="text-5xl" aria-hidden="true">
              ♿
            </span>
            <h1 className="text-4xl font-bold">{t('title')}</h1>
          </div>
          <p className="text-sm text-gray-600">
            {t('lastUpdated', { date: currentDate })}
          </p>
        </header>

        {/* Intro - highlighted */}
        <div className="mb-8 rounded-lg bg-green-50 p-6 border-l-4 border-green-500">
          <p className="text-lg font-medium text-gray-800">{t('intro')}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          {/* Section 1: רמת הנגישות */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section1.title')}</h2>
            <p className="mb-4 text-gray-700">{t('section1.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section1.standards.0')}</li>
              <li>{t('section1.standards.1')}</li>
              <li>{t('section1.standards.2')}</li>
              <li>{t('section1.standards.3')}</li>
              <li>{t('section1.standards.4')}</li>
            </ul>
          </section>

          {/* Section 2: תכונות נגישות */}
          <section className="rounded-lg bg-blue-50 p-6">
            <h2 className="mb-4 text-2xl font-bold">{t('section2.title')}</h2>
            <ul className="space-y-2 text-gray-700">
              {Array.from({ length: 10 }).map((_, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{t(`section2.features.${i}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: סרגל הנגישות */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section3.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section3.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section3.items.0')}</li>
              <li>{t('section3.items.1')}</li>
              <li>{t('section3.items.2')}</li>
              <li>{t('section3.items.3')}</li>
            </ul>
          </section>

          {/* Section 4: תאימות דפדפנים */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section4.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section4.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section4.browsers.0')}</li>
              <li>{t('section4.browsers.1')}</li>
              <li>{t('section4.browsers.2')}</li>
              <li>{t('section4.browsers.3')}</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">{t('section4.note')}</p>
          </section>

          {/* Section 5: קוראי מסך */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section5.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section5.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section5.screenReaders.0')}</li>
              <li>{t('section5.screenReaders.1')}</li>
              <li>{t('section5.screenReaders.2')}</li>
              <li>{t('section5.screenReaders.3')}</li>
            </ul>
          </section>

          {/* Section 6: נגישות במובייל */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section6.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section6.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section6.items.0')}</li>
              <li>{t('section6.items.1')}</li>
              <li>{t('section6.items.2')}</li>
              <li>{t('section6.items.3')}</li>
              <li>{t('section6.items.4')}</li>
            </ul>
          </section>

          {/* Section 7: חלקים בעבודה */}
          <section className="rounded-lg bg-yellow-50 p-6">
            <h2 className="mb-3 text-2xl font-bold">{t('section7.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section7.content')}</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>{t('section7.items.0')}</li>
              <li>{t('section7.items.1')}</li>
            </ul>
            <p className="mt-3 text-sm italic text-gray-600">
              {t('section7.note')}
            </p>
          </section>

          {/* Section 8: פניות והצעות - IMPORTANT */}
          <section className="rounded-lg border-2 border-green-500 bg-green-50 p-6">
            <h2 className="mb-3 text-2xl font-bold text-green-900">
              {t('section8.title')}
            </h2>
            <p className="mb-4 text-gray-700">{t('section8.content')}</p>
            <div className="space-y-2 text-gray-800">
              <p className="font-medium">{t('section8.coordinator')}</p>
              <p>{t('section8.email')}</p>
              <p>{t('section8.phone')}</p>
              <p className="mt-4 rounded bg-white p-3 text-sm font-medium">
                {t('section8.responseTime')}
              </p>
            </div>
          </section>

          {/* Section 9: הסדרי נגישות פיזיים */}
          <section>
            <h2 className="mb-3 text-2xl font-bold">{t('section9.title')}</h2>
            <p className="text-gray-700">{t('section9.content')}</p>
          </section>

          {/* Section 10: תלונות */}
          <section className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-3 text-2xl font-bold">{t('section10.title')}</h2>
            <p className="mb-3 text-gray-700">{t('section10.content')}</p>
            <div className="space-y-2 text-gray-800">
              <p className="font-medium">{t('section10.ministry')}</p>
              <p>
                <Link
                  href={t('section10.website')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('section10.website')}
                </Link>
              </p>
              <p>{t('section10.phone')}</p>
            </div>
          </section>

          {/* Final Commitment */}
          <section className="border-t-4 border-green-500 pt-6">
            <p className="text-lg font-semibold text-gray-800">
              {t('commitment')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
