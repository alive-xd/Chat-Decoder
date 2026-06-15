import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/lib/session-context'
import NavBar from '@/components/NavBar'
import PrivacyBanner from '@/components/PrivacyBanner'

export const metadata: Metadata = {
  title: 'Chat Decoder — Understand Your Conversations',
  description: 'AI-powered WhatsApp conversation intelligence.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NavBar />
          <PrivacyBanner />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
