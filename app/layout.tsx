import { Geist } from 'next/font/google'

const geist = Geist({ subsets: ['latin'] })
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Luz Clara — Entiende tu recibo de luz',
  description: 'Entiende tu consumo de luz y la tarifa 1C en Monterrey. Una herramienta gratuita, independiente y privada, sin cuentas ni rastreo.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8fafc',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX" className="bg-background light">
      <body className={`${geist.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
