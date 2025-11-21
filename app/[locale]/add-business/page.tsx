import { getTranslations } from 'next-intl/server'
import { getCategories } from '@/lib/queries/categories'
import { getNeighborhoods, getNetanyaCity } from '@/lib/queries/neighborhoods'
import AddBusinessForm from '@/components/client/AddBusinessForm'
import BackButton from '@/components/client/BackButton'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getOwnerSession } from '@/lib/auth-owner.server'

interface AddBusinessPageProps {
  params: {
    locale: string
  }
  searchParams: {
    categoryNameHe?: string
    categoryNameRu?: string
    description?: string
    businessName?: string
    requesterName?: string
    requesterEmail?: string
    requesterPhone?: string
  }
}

export async function generateMetadata({
  params: { locale },
}: AddBusinessPageProps): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://netanyalocal.com'
  const url = `${baseUrl}/${locale}/add-business`

  const title =
    locale === 'he'
      ? 'הוסף עסק - Netanya Local | רשום את העסק שלך בנתניה'
      : 'Добавить бизнес - Netanya Local | Зарегистрируйте свой бизнес в Нетании'

  const description =
    locale === 'he'
      ? 'רשמו את העסק שלכם במדריך העסקים המקיף של נתניה. חינם! הגיעו ללקוחות חדשים בשכונה שלכם. טפסים פשוטים, אישור מהיר, חשיפה מקסימלית.'
      : 'Зарегистрируйте свой бизнес в полном справочнике Нетании. Бесплатно! Привлекайте новых клиентов в вашем районе. Простые формы, быстрое одобрение, максимальная видимость.'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        he: `${baseUrl}/he/add-business`,
        ru: `${baseUrl}/ru/add-business`,
        'x-default': `${baseUrl}/he/add-business`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Netanya Local',
      locale: locale === 'he' ? 'he_IL' : 'ru_RU',
      alternateLocale: locale === 'he' ? 'ru_RU' : 'he_IL',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Netanya Local - Add Business',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function AddBusinessPage({
  params: { locale },
  searchParams,
}: AddBusinessPageProps) {
  // Check authentication - redirect to login if not authenticated
  const session = await getOwnerSession()
  if (!session) {
    redirect(`/${locale}/business-login?redirect=${encodeURIComponent(`/${locale}/add-business`)}`)
  }

  const t = await getTranslations('addBusiness')
  const tCommon = await getTranslations('common')

  // Fetch categories and neighborhoods for the form
  const city = await getNetanyaCity()
  const [categories, neighborhoods] = await Promise.all([
    getCategories(),
    getNeighborhoods(city!.id),
  ])

  // Check if there are category request params in URL
  const hasCategoryRequestParams = !!(
    searchParams?.categoryNameHe ||
    searchParams?.categoryNameRu ||
    searchParams?.description
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <BackButton href={`/${locale}`} locale={locale} label={tCommon('back')} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl rounded-lg border bg-white p-4 md:p-8">
        <AddBusinessForm
          categories={categories}
          neighborhoods={neighborhoods}
          locale={locale}
          categoryRequestParams={
            hasCategoryRequestParams
              ? {
                  categoryNameHe: searchParams.categoryNameHe || '',
                  categoryNameRu: searchParams.categoryNameRu || '',
                  description: searchParams.description || '',
                  businessName: searchParams.businessName || '',
                  requesterName: searchParams.requesterName || '',
                  requesterEmail: searchParams.requesterEmail || '',
                  requesterPhone: searchParams.requesterPhone || '',
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
