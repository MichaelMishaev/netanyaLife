import { useTranslations } from 'next-intl'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLoginForm from '@/components/client/AdminLoginForm'

interface AdminLoginPageProps {
  params: {
    locale: string
  }
}

export default async function AdminLoginPage({
  params: { locale },
}: AdminLoginPageProps) {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    redirect(`/${locale}/admin`)
  }

  const t = useTranslations('admin.login')

  return (
    <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">{t('title')}</h1>
        <AdminLoginForm locale={locale} />
      </div>
    </main>
  )
}
