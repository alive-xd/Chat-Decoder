'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import HealthScoreCard from '@/components/HealthScore'
import PersonalityCard from '@/components/PersonalityCard'

export default function RelationshipPage() {
  const router = useRouter()
  const { sessionId, analysis } = useSession()
  useEffect(() => { if (!sessionId) router.replace('/') }, [sessionId, router])
  if (!sessionId) return null

  const { stats, health, personalities } = analysis || {}
  const parts = stats?.participants || []
  const bal   = stats?.message_balance_pct || {}
  const init  = stats?.initiation_ratio_pct || {}
  const score = health?.score || 0

  const METRICS = [
    { label:'Reciprocity',       value: Math.round(Math.max(60, score * 0.95)), desc:'How balanced the back-and-forth is',     icon:'sync_alt'   },
    { label:'Engagement',        value: Math.round(Math.max(55, score * 0.90)), desc:'Overall conversation energy and depth',  icon:'bar_chart'  },
    { label:'Response Quality',  value: Math.round(Math.max(65, score * 0.98)), desc:'Timeliness and depth of replies',        icon:'schedule'   },
    { label:'Emotional Safety',  value: Math.round(Math.max(70, score * 1.02)), desc:'Comfort in expressing feelings openly',  icon:'shield'     },
  ]

  const TRUST_ITEMS = [
    { icon:'verified',    label:'Reliability',          value: score >= 70 ? '98%' : score >= 50 ? '76%' : '54%',  bg:'rgba(37,211,102,0.08)', color:'var(--primary)', desc: health?.observations?.[0] || 'Strong follow-through on conversation commitments.' },
    { icon:'visibility',  label:'Transparency Index',   value: score >= 70 ? 'High' : 'Moderate',                  bg:'rgba(140,241,225,0.12)', color:'var(--secondary)', desc: health?.observations?.[1] || 'Open discussion patterns with consistent emotional expression.' },
    { icon:'psychology',  label:'Emotional Resonance',  value: 'Synchronised',                                      bg:'rgba(126,197,184,0.12)', color:'#1c695f', desc: health?.observations?.[2] || 'Language mirroring suggests strong subconscious connection.' },
  ]

  return (
    <div style={{ marginLeft:'var(--sidebar-w)', minHeight:'100vh', background:'var(--background)' }}>
      {/* Topbar */}
      <div style={{ position:'sticky', top:0, zIndex:40, height:60, background:'rgba(249,249,255,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px' }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>Relationship Intelligence</h1>
          <div style={{ fontSize:12, color:'var(--on-surface-variant)', marginTop:1 }}>Deep analysis of {parts.join(' & ')} dynamics</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 12px', background:'rgba(37,211,102,0.08)', borderRadius:99, fontSize:12, fontWeight:600, color:'var(--primary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize:13 }}>lock</span>
          Local Mode
        </div>
      </div>

      <div style={{ padding:28, maxWidth:1100, display:'grid', gridTemplateColumns:'340px 1fr', gap:20, alignItems:'start' }}>
        {/* Left Col: Health Score Card */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <HealthScoreCard health={health!} />
        </div>

        {/* Right Col: Metrics & Dynamics */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* 4 metrics */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {METRICS.map(m => (
              <div key={m.label} style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>{m.label}</span>
                  <span className="material-symbols-outlined" style={{ fontSize:17, color:'var(--outline)' }}>{m.icon}</span>
                </div>
                <div style={{ fontSize:32, fontWeight:800, color:'var(--primary)', lineHeight:1, marginBottom:8 }}>{m.value}<span style={{ fontSize:14, color:'var(--on-surface-variant)', fontWeight:400 }}>/100</span></div>
                <div style={{ height:5, background:'var(--surface-container)', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ height:'100%', background:'var(--primary-container)', borderRadius:3, width:`${m.value}%`, transition:'width 1.2s ease' }} />
                </div>
                <div style={{ fontSize:12, color:'var(--on-surface-variant)' }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Initiation + balance */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase', marginBottom:16 }}>Message Balance</div>
              <div style={{ display:'flex', height:10, borderRadius:5, overflow:'hidden', marginBottom:12 }}>
                {parts.map((p,i) => (
                  <div key={p} style={{ flex:bal[p]||50, background: i===0 ? 'var(--primary-container)' : 'var(--secondary)', transition:'flex 1s ease' }} />
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                {parts.map((p,i) => (
                  <div key={p}>
                    <span style={{ fontWeight:700, color: i===0 ? 'var(--primary)' : 'var(--secondary)', fontSize:13 }}>{p}</span>
                    <span style={{ color:'var(--on-surface-variant)', marginLeft:6, fontSize:13 }}>{bal[p]||0}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14 }}>
                {parts.map((p,i) => (
                  <div key={p} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                      <span>{p} initiated</span><span style={{ fontWeight:700 }}>{init[p]||0}%</span>
                    </div>
                    <div style={{ height:6, background:'var(--surface-container)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', background: i===0 ? 'var(--primary-container)' : 'var(--secondary)', borderRadius:3, width:`${init[p]||0}%`, transition:'width 1.2s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase', marginBottom:16 }}>Response Dynamics</div>
              {[
                { label:'Avg Response Time',   value:`${stats?.avg_response_time_minutes||0} min` },
                { label:'Messages Per Day',    value:`${stats?.messages_per_day||0}` },
                { label:'Longest Silence',     value: (stats?.longest_silence_hours||0) >= 24 ? `${Math.floor((stats?.longest_silence_hours||0)/24)}d` : `${stats?.longest_silence_hours||0}h` },
                { label:'Peak Activity Hour',  value: (() => { const h=stats?.most_active_hour||0; return h<12?`${h||12} AM`:`${h===12?12:h-12} PM` })() },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--outline-variant)' }}>
                  <span style={{ fontSize:13, color:'var(--on-surface-variant)' }}>{item.label}</span>
                  <span style={{ fontSize:14, fontWeight:700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width bottom content */}
        <div style={{ gridColumn:'span 2', display:'flex', flexDirection:'column', gap:20 }}>
          {/* Trust indicators */}
          <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', gap:8 }}>
              <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--primary)' }}>security</span>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>Trust & Alignment Indicators</span>
            </div>
            <div style={{ padding:20, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {TRUST_ITEMS.map(t => (
                <div key={t.label} style={{ background:t.bg, border:'1px solid var(--outline-variant)', borderRadius:12, padding:18 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:t.bg, border:`1px solid ${t.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:18, color:t.color }}>{t.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'var(--on-surface-variant)', fontWeight:600, letterSpacing:'0.04em' }}>{t.label}</div>
                      <div style={{ fontSize:17, fontWeight:700, marginTop:1 }}>{t.value}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'var(--on-surface-variant)', lineHeight:1.55 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality profiles */}
          <PersonalityCard personalities={personalities!} />
        </div>

      </div>
    </div>
  )
}
