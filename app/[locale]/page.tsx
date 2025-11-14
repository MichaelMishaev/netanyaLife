import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('home')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('hero.title')}</h1>
        <p className="text-lg text-gray-600">{t('hero.subtitle')}</p>
        <p className="mt-4 text-sm text-gray-500">
          Week 1 Complete - i18n Working ✅
        </p>
      </div>
    </main>
  )
}
