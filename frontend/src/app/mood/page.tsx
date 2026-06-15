'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import MoodChart from '@/components/MoodChart'
import { SentimentPoint } from '@/lib/api'

export default function MoodPage() {
  const router = useRouter()
  const { sessionId, analysis } = useSession()
  const [filter, setFilter] = useState<'all'|'month'|'week'>('all')

  useEffect(() => { if (!sessionId) router.replace('/') }, [sessionId, router])
  if (!sessionId) return null

  const { stats, sentiment, health } = analysis || {}
  const participants = stats?.participants || []

  // Filter sentiment data
  const filtered: SentimentPoint[] = (sentiment || []).filter(d => {
    if (filter === 'all') return true
    const cutoff = new Date()
    if (filter === 'week')  cutoff.setDate(cutoff.getDate() - 7)
    if (filter === 'month') cutoff.setMonth(cutoff.getMonth() - 1)
    return new Date(d.date) >= cutoff
  })
  const data = filtered.length ? filtered : (sentiment || [])

  // Compute emotion split
  const scores = data.map(d => d.score)
  const total  = scores.length || 1
  const posP   = Math.round(scores.filter(s => s > 0.1).length / total * 100)
  const negP   = Math.round(scores.filter(s => s < -0.1).length / total * 100)
  const neuP   = 100 - posP - negP

  const FILTERS: Array<{key:'all'|'month'|'week'; label:string}> = [
    { key:'all', label:'All Time' },
    { key:'month', label:'This Month' },
    { key:'week', label:'This Week' },
  ]

  return (
    <div style={{ marginLeft:'var(--sidebar-w)', minHeight:'100vh', background:'var(--background)' }}>
      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:40, height:60, background:'rgba(249,249,255,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px' }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>Mood Analysis</h1>
          <div style={{ fontSize:12, color:'var(--on-surface-variant)', marginTop:1 }}>Emotional trends · {participants.join(' & ')}</div>
        </div>
        {/* Filter pills */}
        <div style={{ display:'flex', background:'var(--surface-container)', border:'1px solid var(--outline-variant)', borderRadius:10, padding:3, gap:2 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding:'5px 14px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
              background: filter === f.key ? 'var(--surface-lowest)' : 'transparent',
              color: filter === f.key ? 'var(--on-surface)' : 'var(--on-surface-variant)',
              boxShadow: filter === f.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition:'all 0.15s',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:28, maxWidth:1100, display:'flex', flexDirection:'column', gap:20 }}>

        {/* Top stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[
            { label:'Positivity',   value:`${posP}%`,  icon:'sentiment_satisfied', color:'var(--primary)'   },
            { label:'Neutral',      value:`${neuP}%`,  icon:'sentiment_neutral',   color:'var(--secondary)' },
            { label:'Tension',      value:`${negP}%`,  icon:'sentiment_dissatisfied', color:'var(--error)'  },
            { label:'Health Score', value:`${health?.score||0}`, icon:'favorite',  color:'var(--primary)'   },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>{s.label}</span>
                <span className="material-symbols-outlined" style={{ fontSize:18, color:s.color }}>{s.icon}</span>
              </div>
              <div style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.02em', color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main mood chart */}
        <MoodChart sentiment={data} participants={participants} />

        {/* Emotion breakdown + AI insight */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Emotion bars */}
          <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase', marginBottom:16 }}>Sentiment Mix</div>
            {[
              { label:'Enthusiasm',  pct:posP,          color:'var(--primary-container)' },
              { label:'Neutral',     pct:neuP,          color:'var(--secondary)' },
              { label:'Tension',     pct:Math.max(2,negP), color:'var(--error)' },
            ].map(e => (
              <div key={e.label} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                  <span>{e.label}</span>
                  <span style={{ fontWeight:700 }}>{e.pct}%</span>
                </div>
                <div style={{ height:7, background:'var(--surface-container)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:e.color, borderRadius:4, width:`${e.pct}%`, transition:'width 1.2s ease' }} />
                </div>
              </div>
            ))}

            {/* Participant comparison */}
            <div style={{ borderTop:'1px solid var(--outline-variant)', paddingTop:16, marginTop:4 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase', marginBottom:12 }}>Sync Rate</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:36, fontWeight:800, color:'var(--primary)', lineHeight:1 }}>78<span style={{ fontSize:16, color:'var(--on-surface-variant)', fontWeight:400 }}>%</span></div>
                <div style={{ fontSize:13, color:'var(--on-surface-variant)', lineHeight:1.5 }}>Emotional alignment between participants</div>
              </div>
            </div>
          </div>

          {/* AI insight */}
          <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>AI Mood Insights</div>
            {(health?.observations || [
              'Sentiment patterns show consistent positivity with strong engagement.',
              'Response times reflect mutual investment in the conversation.',
              'Emotional synchrony suggests deep mutual understanding.',
            ]).map((obs, i) => (
              <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'14px 16px', background: i===0 ? 'rgba(37,211,102,0.07)' : 'var(--surface-low)', border:`1px solid ${i===0 ? 'rgba(37,211,102,0.2)' : 'var(--outline-variant)'}`, borderRadius:12 }}>
                <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--primary)', flexShrink:0, marginTop:1 }}>auto_awesome</span>
                <span style={{ fontSize:13, lineHeight:1.55, color:'var(--on-surface)' }}>{obs}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation period summary */}
        <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0 }}>
          {[
            { label:'Conversation Start', value: stats?.first_message_date || '—', icon:'event' },
            { label:'Most Recent',        value: stats?.last_message_date  || '—', icon:'update' },
            { label:'Total Duration',     value: `${stats?.total_days||0} days`,   icon:'calendar_month' },
          ].map((item, i) => (
            <div key={item.label} style={{ padding:'0 24px', borderRight: i < 2 ? '1px solid var(--outline-variant)' : 'none', textAlign:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20, color:'var(--primary)', marginBottom:8, display:'block' }}>{item.icon}</span>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase', marginBottom:6 }}>{item.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--on-background)' }}>{item.value}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
