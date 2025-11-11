import type { Metadata } from 'next'
import process from 'node:process'
import { Geist, Geist_Mono } from 'next/font/google'
import Providers from '@/app/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Portfolio',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? ''),
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Portfolio',
    description: 'Portfolio',
    siteName: 'Portfolio',
    images: [
      { url: '/og.jpg', width: 1200, height: 630, alt: 'Portfolio' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio',
    description: 'Portfolio',
    images: ['/og.jpg'],
  },
  icons: {
    icon: [
      '/favicon.ico',
      { url: '/icon0.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Portfilio" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
