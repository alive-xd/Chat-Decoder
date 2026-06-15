'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AnalysisResult } from '@/lib/api'

interface SessionState {
  sessionId: string | null
  messageCount: number
  participants: string[]
  analysis: AnalysisResult | null
  isAnalyzing: boolean
  error: string | null
}

interface SessionContextValue extends SessionState {
  setSession: (id: string, count: number, participants: string[]) => void
  setAnalysis: (data: AnalysisResult) => void
  setAnalyzing: (v: boolean) => void
  setError: (e: string | null) => void
  clearSession: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    messageCount: 0,
    participants: [],
    analysis: null,
    isAnalyzing: false,
    error: null,
  })

  const setSession = useCallback((id: string, count: number, participants: string[]) => {
    setState(s => ({ ...s, sessionId: id, messageCount: count, participants }))
  }, [])

  const setAnalysis = useCallback((data: AnalysisResult) => {
    setState(s => ({ ...s, analysis: data, isAnalyzing: false }))
  }, [])

  const setAnalyzing = useCallback((v: boolean) => {
    setState(s => ({ ...s, isAnalyzing: v }))
  }, [])

  const setError = useCallback((e: string | null) => {
    setState(s => ({ ...s, error: e }))
  }, [])

  const clearSession = useCallback(() => {
    setState({
      sessionId: null,
      messageCount: 0,
      participants: [],
      analysis: null,
      isAnalyzing: false,
      error: null,
    })
  }, [])

  return (
    <SessionContext.Provider value={{ ...state, setSession, setAnalysis, setAnalyzing, setError, clearSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
