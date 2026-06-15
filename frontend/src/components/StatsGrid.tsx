'use client'
import { StatsData } from '@/lib/api'

interface Props { stats: StatsData }

function StatCard({ icon, label, value, sub, accent }: { icon:string; label:string; value:string; sub?:string; accent?:boolean }) {
  return (
    <div style={{
      background: accent ? 'var(--primary-container)' : 'var(--surface-lowest)',
      border:'1px solid var(--outline-variant)', borderRadius:14, padding:'20px',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', right:-8, top:-8, fontSize:64, opacity:0.06 }}>
        <span className="material-symbols-outlined" style={{ fontSize:64 }}>{icon}</span>
      </div>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color: accent ? 'var(--on-primary-container)' : 'var(--on-surface-variant)', marginBottom:12, textTransform:'uppercase' }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:800, lineHeight:1, letterSpacing:'-0.02em', color: accent ? 'var(--on-primary-container)' : 'var(--primary)' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color: accent ? 'rgba(0,0,0,0.5)' : 'var(--on-surface-variant)', marginTop:6 }}>{sub}</div>}
    </div>
  )
}

export default function StatsGrid({ stats }: Props) {
  const parts = stats.participants || []
  const bal   = stats.message_balance_pct || {}
  const init  = stats.initiation_ratio_pct || {}
  const hour  = stats.most_active_hour ?? 0
  const ampm  = hour < 12 ? `${hour||12} AM` : `${hour===12?12:hour-12} PM`
  const sil   = (stats.longest_silence_hours||0) >= 24
    ? `${Math.floor((stats.longest_silence_hours||0)/24)}d`
    : `${stats.longest_silence_hours||0}h`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        <StatCard icon="chat_bubble" label="Total Messages" value={(stats.total_messages||0).toLocaleString()} sub={`${stats.messages_per_day||0} per day avg`} />
        <StatCard icon="schedule"    label="Avg Response"   value={`${stats.avg_response_time_minutes||0}m`} sub="median reply time" />
        <StatCard icon="bolt"        label="Peak Hour"       value={ampm} sub="most active time" />
        <StatCard icon="timer_off"   label="Longest Silence" value={sil} sub="biggest gap" />
      </div>

      {/* Balance bar */}
      <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
          <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--primary)' }}>swap_horiz</span>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>Message Balance</span>
        </div>
        {/* Split bar */}
        <div style={{ display:'flex', height:8, borderRadius:4, overflow:'hidden', marginBottom:12 }}>
          {parts.map((p,i) => (
            <div key={p} style={{ flex:bal[p]||50, background: i===0 ? 'var(--primary-container)' : 'var(--secondary)', transition:'flex 1s ease' }} />
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          {parts.map((p,i) => (
            <div key={p} style={{ fontSize:12 }}>
              <span style={{ fontWeight:700, color: i===0 ? 'var(--primary)' : 'var(--secondary)' }}>{p}</span>
              <span style={{ color:'var(--on-surface-variant)', marginLeft:6 }}>{bal[p]||0}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-participant rows */}
      <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase', marginBottom:14 }}>Initiation Rate</div>
        {parts.map((p,i) => (
          <div key={p} style={{ marginBottom: i < parts.length-1 ? 14 : 0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
              <span style={{ fontWeight:500 }}>{p}</span>
              <span style={{ fontWeight:700 }}>{init[p]||0}%</span>
            </div>
            <div style={{ height:6, background:'var(--surface-container)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', background: i===0 ? 'var(--primary-container)' : 'var(--secondary)', borderRadius:3, width:`${init[p]||0}%`, transition:'width 1.2s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
