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
      className="whitespace-nowrap rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-3 sm:py-2 sm:text-sm lg:px-4"
    >
      {t('logout')}
    </button>
  )
}
