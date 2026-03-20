import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MP ITI Training Officer 2026 COPA - NEP Rank Predictor',
  description:
    'Predict your rank for MP ITI Training Officer 2026 COPA exam using NEP scoring.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">

        {children}

        <Toaster />
        <Analytics />

        {/* ✅ Adsterra Script (CORRECT WAY) */}
        <Script
          src="https://pl28947931.profitablecpmratenetwork.com/ee/07/5a/ee075a5d83d10e44aa2f2f475bc12513.js"
          strategy="afterInteractive"
        />

      </body>
    </html>
  )
}