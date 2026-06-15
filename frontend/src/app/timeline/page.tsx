'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import TimelineView from '@/components/TimelineView'

export default function TimelinePage() {
  const router = useRouter()
  const { sessionId, analysis } = useSession()
  useEffect(() => { if (!sessionId) router.replace('/') }, [sessionId, router])
  if (!sessionId) return null

  return (
    <div style={{ marginLeft:'var(--sidebar-w)', minHeight:'100vh', background:'var(--background)' }}>
      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:40, height:60, background:'rgba(249,249,255,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px' }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>Timeline</h1>
          <div style={{ fontSize:12, color:'var(--on-surface-variant)', marginTop:1 }}>
            {(analysis?.timeline||[]).length} key moments · {(analysis?.stats?.participants||[]).join(' & ')}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px', background:'rgba(37,211,102,0.08)', borderRadius:99, fontSize:12, fontWeight:600, color:'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize:13 }}>lock</span>
          Local Mode
        </div>
      </div>

      <div style={{ padding:28, maxWidth:800 }}>
        <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:24 }}>
          <TimelineView events={analysis?.timeline||[]} />
        </div>
        <p style={{ fontSize:12, color:'var(--on-surface-variant)', textAlign:'center', marginTop:16 }}>
          Timeline events are detected from anonymised conversation statistics. No raw messages are analysed.
        </p>
      </div>
    </div>
  )
}
