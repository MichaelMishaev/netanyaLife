'use client'

import { useTranslations } from 'next-intl'
import { adminLogout } from '@/lib/actions/auth'

interface AdminLogoutButtonProps {
  locale: string
}

export default function AdminLogoutButton({ locale }: AdminLogoutButtonProps) {
  const t = useTranslations('nav')

  const handleLogout = async () => {
    await adminLogout(locale)
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      {t('logout')}
    </button>
  )
}
