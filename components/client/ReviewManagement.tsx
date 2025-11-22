'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  business_id: string
  business_name: string
  business_slug: string
  rating: number
  comment: string | null
  author_name: string | null
  is_approved: boolean
  is_flagged: boolean
  created_at: string
}

interface Business {
  id: string
  name: string
  review_count: number
}

interface ReviewManagementProps {
  reviews: Review[]
  businesses: Business[]
  locale: string
  currentFilters: {
    business?: string
    flagged?: string
  }
}

export default function ReviewManagement({
  reviews,
  businesses,
  locale,
  currentFilters,
}: ReviewManagementProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const isHebrew = locale === 'he'

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (key === 'business' && value) params.set('business', value)
    else if (currentFilters.business && key !== 'business') params.set('business', currentFilters.business)

    if (key === 'flagged' && value === 'true') params.set('flagged', 'true')
    else if (currentFilters.flagged === 'true' && key !== 'flagged') params.set('flagged', 'true')

    router.push(`/${locale}/admin/reviews?${params.toString()}`)
  }

  const handleToggleFlag = async (reviewId: string, currentFlag: boolean) => {
    setLoading(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_flagged: !currentFlag }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling flag:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleApproval = async (reviewId: string, currentApproval: boolean) => {
    setLoading(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !currentApproval }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling approval:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    setLoading(reviewId)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteConfirm(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            *
          </span>
        ))}
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isHebrew ? 'he-IL' : 'ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg border bg-white p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {isHebrew ? 'סנן לפי עסק' : 'Фильтр по бизнесу'}
          </label>
          <select
            value={currentFilters.business || ''}
            onChange={(e) => handleFilterChange('business', e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">{isHebrew ? 'כל העסקים' : 'Все бизнесы'}</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.review_count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 rounded-lg border px-4 py-2 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={currentFilters.flagged === 'true'}
              onChange={(e) => handleFilterChange('flagged', e.target.checked ? 'true' : '')}
              className="rounded"
            />
            <span className="text-sm">
              {isHebrew ? 'הצג מסומנות בלבד' : 'Только отмеченные'}
            </span>
          </label>
        </div>

        {(currentFilters.business || currentFilters.flagged) && (
          <div className="flex items-end">
            <button
              onClick={() => router.push(`/${locale}/admin/reviews`)}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              {isHebrew ? 'נקה סינון' : 'Очистить фильтры'}
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-600">
            {isHebrew ? 'לא נמצאו ביקורות' : 'Отзывы не найдены'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-lg border bg-white p-4 ${
                review.is_flagged ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-700">
                      {review.author_name || (isHebrew ? 'אנונימי' : 'Аноним')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                    {review.is_flagged && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        {isHebrew ? 'מסומן' : 'Отмечен'}
                      </span>
                    )}
                    {!review.is_approved && (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                        {isHebrew ? 'לא מאושר' : 'Не одобрен'}
                      </span>
                    )}
                  </div>

                  <p className="mb-2 text-sm text-gray-800">
                    {review.comment || (isHebrew ? '(ללא תגובה)' : '(без комментария)')}
                  </p>

                  <p className="text-xs text-gray-500">
                    {isHebrew ? 'עסק:' : 'Бизнес:'}{' '}
                    <a
                      href={`/${locale}/business/${review.business_slug}`}
                      className="text-primary-600 hover:underline"
                      target="_blank"
                    >
                      {review.business_name}
                    </a>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleApproval(review.id, review.is_approved)}
                    disabled={loading === review.id}
                    className={`rounded px-3 py-1.5 text-sm transition ${
                      review.is_approved
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {review.is_approved
                      ? (isHebrew ? 'בטל אישור' : 'Отменить')
                      : (isHebrew ? 'אשר' : 'Одобрить')}
                  </button>

                  <button
                    onClick={() => handleToggleFlag(review.id, review.is_flagged)}
                    disabled={loading === review.id}
                    className={`rounded px-3 py-1.5 text-sm transition ${
                      review.is_flagged
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {review.is_flagged
                      ? (isHebrew ? 'הסר סימון' : 'Снять отметку')
                      : (isHebrew ? 'סמן' : 'Отметить')}
                  </button>

                  {deleteConfirm === review.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={loading === review.id}
                        className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                      >
                        {isHebrew ? 'אישור' : 'Да'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
                      >
                        {isHebrew ? 'ביטול' : 'Нет'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(review.id)}
                      className="rounded bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
                    >
                      {isHebrew ? 'מחק' : 'Удалить'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
