'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import ChatQA from '@/components/ChatQA'

export default function AskPage() {
  const router = useRouter()
  const { sessionId, analysis } = useSession()
  useEffect(() => { if (!sessionId) router.replace('/') }, [sessionId, router])
  if (!sessionId) return null

  return (
    <div style={{ marginLeft:'var(--sidebar-w)', height:'100vh', display:'flex', flexDirection:'column', background:'var(--background)' }}>
      {/* Topbar */}
      <div style={{ height:60, background:'rgba(249,249,255,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>Ask AI</h1>
          <div style={{ fontSize:12, color:'var(--on-surface-variant)', marginTop:1 }}>
            RAG-powered · {(analysis?.stats?.participants||[]).join(' & ')} · 10 queries/min
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px', background:'rgba(37,211,102,0.08)', borderRadius:99, fontSize:12, fontWeight:600, color:'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize:13 }}>lock</span>
          Local Mode
        </div>
      </div>

      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <ChatQA />
      </div>
    </div>
  )
}
