import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TanStackQueryProvider } from '@/components/providers/tanstack-query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Dyad - AI App Builder Platform',
    template: '%s | Dyad',
  },
  description: 'Build AI-powered applications with ease. The cloud-native platform for modern AI development.',
  keywords: [
    'AI',
    'app builder',
    'artificial intelligence',
    'development platform',
    'code generation',
    'Yavi.ai',
    'document processing',
  ],
  authors: [
    {
      name: 'Nimbusnext Inc',
      url: 'https://yavi.ai',
    },
  ],
  creator: 'Nimbusnext Inc',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dyad.ai',
    title: 'Dyad - AI App Builder Platform',
    description: 'Build AI-powered applications with ease. The cloud-native platform for modern AI development.',
    siteName: 'Dyad',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dyad - AI App Builder Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dyad - AI App Builder Platform',
    description: 'Build AI-powered applications with ease. The cloud-native platform for modern AI development.',
    images: ['/og-image.png'],
    creator: '@nimbusnext',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TanStackQueryProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
              </div>
              <Toaster position="bottom-right" />
            </TanStackQueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}