import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: 'var(--wa-bg)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: '#F0FDF4' }}>
        <MessageCircle size={28} style={{ color: 'var(--wa-green)' }} />
      </div>
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--wa-muted)' }}>
        This page doesn't exist or your session has expired.
      </p>
      <Link href="/"
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--wa-green)' }}>
        Start over
      </Link>
    </div>
  )
}
