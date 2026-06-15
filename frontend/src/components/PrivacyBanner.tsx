'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/session-context'

export default function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(false)
  const pathname = usePathname()
  const { sessionId } = useSession()
  
  if (dismissed || pathname === '/') return null
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'8px 20px', fontSize:12, fontWeight:600,
      background:'rgba(37,211,102,0.08)', borderBottom:'1px solid rgba(37,211,102,0.2)',
      color:'var(--primary)',
      marginLeft: sessionId ? 'var(--sidebar-w)' : 0,
      transition: 'margin-left 0.15s ease-in-out',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize:14 }}>lock</span>
      <span>
        Your chat is parsed locally in your browser — no messages are stored or sent to our servers.
        Session clears after 30 minutes.
      </span>
      <button onClick={() => setDismissed(true)} style={{
        marginLeft:'auto', background:'none', border:'none', cursor:'pointer',
        color:'var(--primary)', fontSize:11, fontWeight:600, flexShrink:0,
      }}>Dismiss</button>
    </div>
  )
}
