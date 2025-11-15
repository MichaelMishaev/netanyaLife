import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AdminSettingsForm from '@/components/client/AdminSettingsForm'

interface AdminSettingsPageProps {
  params: {
    locale: string
  }
}

export default async function AdminSettingsPage({
  params: { locale },
}: AdminSettingsPageProps) {
  const t = await getTranslations('admin.settings')

  // Get current settings
  const topPinnedCountSetting = await prisma.adminSettings.findUnique({
    where: { key: 'top_pinned_count' },
  })

  const topPinnedCount = topPinnedCountSetting
    ? parseInt(topPinnedCountSetting.value, 10)
    : 4

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <div className="max-w-2xl rounded-lg border bg-white p-8">
        <AdminSettingsForm
          locale={locale}
          initialTopPinnedCount={topPinnedCount}
        />
      </div>
    </div>
  )
}
