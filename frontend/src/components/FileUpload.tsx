'use client'

import { useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { parseWhatsAppExport } from '@/lib/parser'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session-context'

type UploadState = 'idle' | 'parsing' | 'uploading' | 'analyzing' | 'done' | 'error'

export default function FileUpload() {
  const router = useRouter()
  const { setSession, setAnalysis, setAnalyzing, setError } = useSession()
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setState('error')
      setProgress('Please upload a WhatsApp .txt export file')
      return
    }

    try {
      // Step 1: Parse in browser
      setState('parsing')
      setProgress('Parsing your chat locally…')
      const text = await file.text()
      const messages = parseWhatsAppExport(text)

      if (messages.length === 0) {
        setState('error')
        setProgress('Could not parse messages. Make sure this is a WhatsApp .txt export.')
        return
      }

      setProgress(`Found ${messages.length.toLocaleString()} messages. Uploading…`)

      // Step 2: Upload chunks to backend
      setState('uploading')
      const uploadRes = await api.upload(null, messages)
      setSession(uploadRes.session_id, uploadRes.message_count, uploadRes.participants)

      // Step 3: Run full analysis
      setState('analyzing')
      setAnalyzing(true)
      setProgress('Running AI analysis… this takes ~30 seconds')

      const analysis = await api.analyze(uploadRes.session_id)
      setAnalysis(analysis)

      setState('done')
      setProgress('Analysis complete!')
      setTimeout(() => router.push('/dashboard'), 600)
    } catch (err: any) {
      setState('error')
      setProgress(err.message || 'Something went wrong. Please try again.')
      setError(err.message)
    }
  }, [router, setSession, setAnalysis, setAnalyzing, setError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const isLoading = ['parsing', 'uploading', 'analyzing'].includes(state)

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`relative card px-8 py-12 text-center transition-all duration-200
          ${!isLoading ? 'cursor-pointer' : ''}
          ${dragOver ? 'border-2 border-dashed' : 'border border-dashed'}
        `}
        style={{
          borderColor: dragOver ? 'var(--wa-green)' : 'var(--wa-border)',
          background: dragOver ? '#F0FDF4' : 'var(--wa-surface)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />

        {state === 'idle' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: '#F0FDF4' }}>
              <Upload size={28} style={{ color: 'var(--wa-green)' }} />
            </div>
            <p className="text-base font-semibold mb-1">Drop your WhatsApp export here</p>
            <p className="text-sm mb-5" style={{ color: 'var(--wa-muted)' }}>
              or click to browse — .txt files only
            </p>
            <span className="chip text-xs" style={{ fontSize: '0.75rem' }}>
              <FileText size={12} className="mr-1.5" /> Supports Android & iPhone exports
            </span>
          </>
        )}

        {isLoading && (
          <>
            <Loader2 size={36} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--wa-green)' }} />
            <p className="text-sm font-medium">{progress}</p>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden mx-auto w-48"
              style={{ background: 'var(--wa-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  background: 'var(--wa-green)',
                  width: state === 'parsing' ? '25%' : state === 'uploading' ? '55%' : '85%',
                }}
              />
            </div>
          </>
        )}

        {state === 'done' && (
          <>
            <CheckCircle size={36} className="mx-auto mb-3" style={{ color: 'var(--wa-green)' }} />
            <p className="text-sm font-medium text-green-700">Analysis complete! Redirecting…</p>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle size={36} className="mx-auto mb-3 text-red-500" />
            <p className="text-sm font-medium text-red-600 mb-3">{progress}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setState('idle'); setProgress('') }}
              className="chip text-sm"
            >
              Try again
            </button>
          </>
        )}
      </div>

      <p className="text-center text-xs mt-3" style={{ color: 'var(--wa-muted)' }}>
        Files are parsed in your browser. Nothing is stored on our servers.
      </p>
    </div>
  )
}
