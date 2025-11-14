'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { submitReview } from '@/lib/actions/reviews'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  businessId: string
  businessName: string
  locale: string
  businessSlug: string
}

export default function ReviewForm({
  businessId,
  businessName,
  locale,
  businessSlug,
}: ReviewFormProps) {
  const t = useTranslations('reviews')
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError(t('ratingRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitReview(businessId, locale, {
        rating,
        comment: comment.trim() || undefined,
        authorName: authorName.trim() || undefined,
      })

      if (result.success) {
        // Redirect back to business page
        router.push(`/${locale}/business/${businessSlug}`)
      } else {
        setError(result.error || t('submitError'))
      }
    } catch (err) {
      setError(t('submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Name */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{businessName}</h2>
        <p className="text-sm text-gray-600">{t('shareExperience')}</p>
      </div>

      {/* Star Rating */}
      <div>
        <label className="mb-2 block font-medium text-gray-700">
          {t('rating')} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-4xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={t('starRating', { stars: star })}
            >
              <span
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            {t('selectedRating', { rating })}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="comment"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('comment')} ({t('optional')})
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('commentPlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Author Name */}
      <div>
        <label
          htmlFor="authorName"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('yourName')} ({t('optional')})
        </label>
        <input
          type="text"
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('namePlaceholder')}
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        />
        <p className="mt-1 text-sm text-gray-500">{t('anonymousNote')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t('submitting') : t('submitReview')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  )
}
