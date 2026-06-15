'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: 'var(--wa-bg)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: '#FEF2F2' }}>
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--wa-muted)' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--wa-green)' }}>
          Try again
        </button>
        <Link href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--wa-surface)', border: '0.5px solid var(--wa-border)' }}>
          Go home
        </Link>
      </div>
    </div>
  )
}
