'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            שגיאת שרת
          </h2>
          <p className="text-gray-600 mb-8">
            אירעה שגיאה בלתי צפויה. אנא נסה שוב.
          </p>
          <button
            onClick={() => reset()}
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            נסה שוב
          </button>
        </div>
      </body>
    </html>
  )
}
