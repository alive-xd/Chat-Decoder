'use client'
import { HealthScore } from '@/lib/api'

interface Props { health: HealthScore }

const LABEL_COLOR: Record<string,string> = {
  Thriving:'#25d366', Healthy:'#006b5f', Developing:'#F59E0B',
  Strained:'#F97316', Critical:'#ba1a1a', Unavailable:'#6c7b6b',
}

export default function HealthScoreCard({ health }: Props) {
  const score = health?.score ?? 0
  const label = health?.label || 'Unavailable'
  const color = LABEL_COLOR[label] || '#6c7b6b'

  // SVG arc
  const r    = 60
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', gap:8 }}>
        <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--primary)' }}>favorite</span>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>Relationship Health</span>
      </div>
      <div style={{ padding:20, display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        {/* Gauge */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width={144} height={144} viewBox="0 0 144 144" style={{ transform:'rotate(-90deg)' }}>
            <circle cx={72} cy={72} r={r} fill="none" stroke="var(--surface-container)" strokeWidth={10} />
            <circle cx={72} cy={72} r={r} fill="none" stroke={color} strokeWidth={10}
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
          </svg>
          <div style={{ position:'absolute', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <span style={{ fontSize:32, fontWeight:800, lineHeight:1, color:'var(--on-background)' }}>{score}</span>
            <span style={{ fontSize:11, color:'var(--on-surface-variant)' }}>/100</span>
          </div>
        </div>

        {/* Observations */}
        <div style={{ width:'100%' }}>
          <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:700, marginBottom:14, background:`${color}18`, color }}>
            {label}
          </span>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(health?.observations||[]).map((obs,i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary-container)', flexShrink:0, marginTop:6 }} />
                <span style={{ fontSize:13, lineHeight:1.55, color:'var(--on-surface)' }}>{obs}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
