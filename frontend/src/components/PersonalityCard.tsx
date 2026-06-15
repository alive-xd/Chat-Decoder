'use client'
import { PersonalityProfile } from '@/lib/api'

interface Props { personalities: Record<string, PersonalityProfile> }

const TRAIT_STYLE: Record<string,{bg:string;color:string}> = {
  High:      { bg:'rgba(37,211,102,0.12)',  color:'#004d20' },
  Moderate:  { bg:'rgba(140,241,225,0.2)',  color:'#004d44' },
  Low:       { bg:'rgba(186,26,26,0.08)',   color:'#ba1a1a' },
  Warm:      { bg:'rgba(37,211,102,0.12)',  color:'#004d20' },
  Direct:    { bg:'rgba(59,130,246,0.1)',   color:'#1e40af' },
  Playful:   { bg:'rgba(139,92,246,0.1)',   color:'#6b21a8' },
  Formal:    { bg:'rgba(107,114,128,0.1)',  color:'#374151' },
  Sarcastic: { bg:'rgba(249,115,22,0.1)',   color:'#9a3412' },
  Dry:       { bg:'rgba(107,114,128,0.1)',  color:'#374151' },
}

function TraitBadge({ label, value }: { label:string; value:string }) {
  const style = TRAIT_STYLE[value] || { bg:'rgba(37,211,102,0.1)', color:'#004d20' }
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:11, color:'var(--on-surface-variant)', width:70, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:99, background:style.bg, color:style.color }}>{value||'—'}</span>
    </div>
  )
}

export default function PersonalityCard({ personalities }: Props) {
  const entries = Object.entries(personalities || {})
  if (!entries.length) return (
    <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:20, fontSize:14, color:'var(--on-surface-variant)' }}>
      No personality data available.
    </div>
  )

  return (
    <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--outline-variant)', display:'flex', alignItems:'center', gap:8 }}>
        <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--primary)' }}>person</span>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>Personality Profiles</span>
      </div>
      <div style={{ padding:20, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:16 }}>
        {entries.map(([name, p]) => (
          <div key={name} style={{ background:'var(--surface-low)', border:'1px solid var(--outline-variant)', borderRadius:12, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {name[0]?.toUpperCase()}
              </div>
              <div style={{ fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
              <TraitBadge label="Tone"       value={p.tone||'—'} />
              <TraitBadge label="Humor"      value={p.humor||'—'} />
              <TraitBadge label="Assertive"  value={p.assertiveness||'—'} />
              <TraitBadge label="Empathy"    value={p.empathy||'—'} />
            </div>
            {p.summary && (
              <div style={{ fontSize:12, fontStyle:'italic', lineHeight:1.55, color:'var(--on-surface-variant)', borderTop:'1px solid var(--outline-variant)', paddingTop:10 }}>
                "{p.summary}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
