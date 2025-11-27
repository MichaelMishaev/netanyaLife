import type { Metadata } from 'next'
import './globals.css'

// Set metadataBase at root level for Next.js 14+ compliance
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://netanya.business'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
