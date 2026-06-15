'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import StatsGrid from '@/components/StatsGrid'
import MoodChart from '@/components/MoodChart'
import HealthScoreCard from '@/components/HealthScore'
import PersonalityCard from '@/components/PersonalityCard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { sessionId, analysis, isAnalyzing } = useSession()

  useEffect(() => { if (!sessionId) router.replace('/') }, [sessionId, router])
  if (!sessionId) return null

  if (isAnalyzing || !analysis) return (
    <div style={{ marginLeft:'var(--sidebar-w)', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'var(--background)' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--outline-variant)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <div style={{ fontSize:15, fontWeight:600 }}>Running AI analysis…</div>
      <div style={{ fontSize:13, color:'var(--on-surface-variant)' }}>This usually takes 20–40 seconds</div>
    </div>
  )

  const { stats, sentiment, health, personalities } = analysis

  return (
    <div style={{ marginLeft:'var(--sidebar-w)', minHeight:'100vh', background:'var(--background)' }}>
      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:40, height:60, background:'rgba(249,249,255,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px' }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.01em' }}>Dashboard</h1>
          <div style={{ fontSize:12, color:'var(--on-surface-variant)', marginTop:1 }}>{stats?.participants?.join(' & ')} · {(stats?.total_messages||0).toLocaleString()} messages · {stats?.total_days||0} days</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px', background:'rgba(37,211,102,0.08)', borderRadius:99, fontSize:12, fontWeight:600, color:'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize:13 }}>lock</span>
          Local Mode
        </div>
      </div>

      <div style={{ padding:28, maxWidth:1200, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Left col */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <StatsGrid stats={stats} />
          <HealthScoreCard health={health} />
        </div>
        {/* Right col */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <MoodChart sentiment={sentiment} participants={stats?.participants||[]} />
          <PersonalityCard personalities={personalities} />
        </div>
      </div>
    </div>
  )
}
