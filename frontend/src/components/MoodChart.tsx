'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { SentimentPoint } from '@/lib/api'

interface Props { sentiment: SentimentPoint[]; participants: string[] }

const COLORS = ['#25d366','#006b5f','#1c695f','#a8f0e3']

function buildData(sentiment: SentimentPoint[], participants: string[]) {
  const dates = [...new Set(sentiment.map(s => s.date))].sort()
  return dates.map(date => {
    const row: Record<string,any> = { date: date.slice(0,7) }
    participants.forEach(p => {
      const pt = sentiment.find(s => s.date === date && s.participant === p)
      row[p] = pt ? Math.round(pt.score * 100) / 100 : null
    })
    return row
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:10, padding:'10px 14px', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight:600, marginBottom:4 }}>{label}</p>
      {payload.map((e:any) => (
        <p key={e.name} style={{ color:e.color }}>{e.name}: {e.value > 0 ? '+' : ''}{e.value}</p>
      ))}
    </div>
  )
}

export default function MoodChart({ sentiment, participants }: Props) {
  if (!sentiment?.length) return (
    <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, padding:32, textAlign:'center', color:'var(--on-surface-variant)', fontSize:14 }}>
      Not enough data to show mood timeline.
    </div>
  )

  const data = buildData(sentiment, participants)

  return (
    <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--outline-variant)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.07em', color:'var(--on-surface-variant)', textTransform:'uppercase' }}>Mood Timeline</div>
          <div style={{ fontSize:13, color:'var(--on-surface-variant)', marginTop:2 }}>Sentiment score · 2-week windows</div>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {participants.slice(0,4).map((p,i) => (
            <div key={p} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--on-surface-variant)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i] }} />
              <span style={{ maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'20px 20px 12px' }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top:4, right:8, left:-28, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
            <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--on-surface-variant)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[-1,1]} tick={{ fontSize:10, fill:'var(--on-surface-variant)' }} tickLine={false} axisLine={false} tickFormatter={v => v > 0 ? `+${v}` : `${v}`} />
            <ReferenceLine y={0} stroke="var(--outline-variant)" strokeWidth={1.5} />
            <Tooltip content={<CustomTooltip />} />
            {participants.slice(0,4).map((p,i) => (
              <Line key={p} type="monotone" dataKey={p} stroke={COLORS[i]} strokeWidth={2.5} dot={false}
                activeDot={{ r:4, strokeWidth:0 }} connectNulls strokeDasharray={i===1?'6 3':undefined} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--on-surface-variant)', marginTop:8, padding:'0 4px' }}>
          <span>← more negative</span><span>more positive →</span>
        </div>
      </div>
    </div>
  )
}
