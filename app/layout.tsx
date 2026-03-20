import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata = {
  title: "MP ITI TO Rank Predictor 2026 (COPA) – Check Your Rank Instantly",
  description:
    "Check your expected rank for MP ITI Training Officer 2026 COPA exam using NEP scoring. Instant result with cutoff prediction.",
  keywords: [
    "MP ITI TO rank predictor 2026",
    "ITI TO cutoff 2026",
    "Copa rank predictor",
    "MP ESB rank calculator",
    "Predict your rank for MP ITI Training Officer 2026 COPA exam",
    "MP ITI TO expected rank 2026",
    "MP ITI TO score predictor 2026",
    "MP ITI TO rank estimation 2026",
    "MP ITI TO copa result prediction 2026",
    "MP ITI TO copa cutoff prediction 2026",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <meta name="google-site-verification" content="UW4Kmv-r5cp1vHwSQOHwgi7j5kHDMbv1MzwrcIuVtLs" />
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