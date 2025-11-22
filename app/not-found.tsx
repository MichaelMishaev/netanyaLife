import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="he" dir="rtl">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            הדף לא נמצא
          </h2>
          <p className="text-gray-600 mb-8">
            מצטערים, הדף שחיפשת אינו קיים.
          </p>
          <Link
            href="/he"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </body>
    </html>
  )
}
