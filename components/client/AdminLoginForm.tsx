'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { adminLogin } from '@/lib/actions/auth'

interface AdminLoginFormProps {
  locale: string
}

export default function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const t = useTranslations('admin.login')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await adminLogin(locale, formData)

      if (result && !result.success) {
        setError(result.error || t('error'))
      }
      // If successful, adminLogin will redirect
    } catch (err) {
      setError(t('error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block font-medium text-gray-700">
          {t('email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="admin@example.com"
          dir="ltr"
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('password')}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          dir="ltr"
          autoComplete="current-password"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? '...' : t('submit')}
      </button>
    </form>
  )
}
