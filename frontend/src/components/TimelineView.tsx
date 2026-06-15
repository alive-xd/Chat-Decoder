'use client'
import { TimelineEvent } from '@/lib/api'

interface Props { events: TimelineEvent[] }

const CONFIG: Record<string,{color:string;bg:string;icon:string;label:string}> = {
  first_message:  { color:'#25d366', bg:'rgba(37,211,102,0.12)',  icon:'chat_bubble', label:'First Message'   },
  milestone:      { color:'#006b5f', bg:'rgba(140,241,225,0.2)',  icon:'star',        label:'Milestone'        },
  silence:        { color:'#6c7b6b', bg:'rgba(108,123,107,0.1)', icon:'timer_off',   label:'Silence Period'   },
  emotional_peak: { color:'#EC4899', bg:'rgba(236,72,153,0.12)', icon:'favorite',    label:'Emotional Peak'   },
  topic_shift:    { color:'#8B5CF6', bg:'rgba(139,92,246,0.12)', icon:'trending_up', label:'Topic Shift'      },
}
const DEFAULT_CFG = { color:'#006b5f', bg:'rgba(140,241,225,0.2)', icon:'star', label:'Event' }

function fmt(d: string) {
  try { return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }
  catch { return d }
}

export default function TimelineView({ events }: Props) {
  if (!events?.length) return (
    <div style={{ textAlign:'center', padding:'48px 0', color:'var(--on-surface-variant)' }}>
      <span className="material-symbols-outlined" style={{ fontSize:36, display:'block', marginBottom:12, opacity:0.35 }}>history</span>
      <div style={{ fontSize:14, fontWeight:600 }}>No timeline events detected</div>
    </div>
  )

  const sorted = [...events].sort((a,b) => a.date.localeCompare(b.date))

  return (
    <div style={{ position:'relative', paddingLeft:40 }}>
      {/* Spine */}
      <div style={{ position:'absolute', left:11, top:8, bottom:8, width:2, background:'linear-gradient(to bottom, transparent, var(--outline-variant) 8%, var(--outline-variant) 92%, transparent)' }} />

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {sorted.map((ev, i) => {
          const cfg = CONFIG[ev.type] || DEFAULT_CFG
          return (
            <div key={i} style={{ position:'relative', animation:`fadeSlideUp 0.3s ${i*50}ms ease both` }}>
              {/* Dot */}
              <div style={{
                position:'absolute', left:-32, top:14,
                width:16, height:16, borderRadius:'50%',
                background:cfg.bg, border:`2px solid ${cfg.color}`,
                display:'flex', alignItems:'center', justifyContent:'center', zIndex:2,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize:8, color:cfg.color }}>{cfg.icon}</span>
              </div>

              {/* Card */}
              <div style={{
                background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)',
                borderRadius:12, padding:'16px 18px',
                transition:'border-color 0.15s, box-shadow 0.15s',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor=cfg.color; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)' }}
                onMouseOut={e  => { e.currentTarget.style.borderColor='var(--outline-variant)'; e.currentTarget.style.boxShadow='none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize:11, color:'var(--on-surface-variant)' }}>{fmt(ev.date)}</span>
                    </div>
                    <div style={{ fontSize:14, lineHeight:1.55, color:'var(--on-surface)' }}>{ev.event}</div>
                  </div>
                  <div style={{ width:34, height:34, borderRadius:9, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:16, color:cfg.color }}>{cfg.icon}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
