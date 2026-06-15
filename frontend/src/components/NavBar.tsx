'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import { api } from '@/lib/api'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',    icon: 'dashboard',   label: 'Dashboard'     },
  { href: '/mood',         icon: 'trending_up', label: 'Mood Analysis' },
  { href: '/relationship', icon: 'favorite',    label: 'Relationship'  },
  { href: '/ask',          icon: 'psychology',  label: 'Ask AI'        },
  { href: '/timeline',     icon: 'history',     label: 'Timeline'      },
]

export default function NavBar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { sessionId, clearSession } = useSession()
  const [clearing, setClearing] = useState(false)
  const [toast, setToast]       = useState('')

  async function handleClear() {
    if (!sessionId) return
    setClearing(true)
    try {
      await api.wipeSession(sessionId)
      clearSession()
      setToast('All your data has been cleared')
      setTimeout(() => { setToast(''); router.push('/') }, 2000)
    } catch { setToast('Failed to clear data') }
    finally { setClearing(false) }
  }

  // Landing page — no sidebar
  if (!sessionId && pathname === '/') return null

  return (
    <>
      {/* Sidebar */}
      <aside style={{
        position:'fixed', top:0, left:0, width:'var(--sidebar-w)', height:'100vh',
        background:'var(--surface-lowest)', borderRight:'1px solid var(--outline-variant)',
        display:'flex', flexDirection:'column', padding:'16px', zIndex:50, overflowY:'auto',
      }}>
        {/* Brand */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', padding:'8px 8px 20px' }}>
          <div style={{ width:30, height:30, background:'var(--primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span className="material-symbols-outlined" style={{ color:'#fff', fontSize:16 }}>chat</span>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--primary)', lineHeight:1.2 }}>Chat Decoder</div>
            <div style={{ fontSize:11, color:'var(--on-surface-variant)', fontWeight:500 }}>AI Intelligence</div>
          </div>
        </Link>

        {/* Upload CTA */}
        <Link href="/" style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          background:'var(--primary)', color:'#fff', borderRadius:10,
          padding:'10px 16px', fontSize:13, fontWeight:600, textDecoration:'none', marginBottom:16,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize:16 }}>upload</span>
          Upload Chat
        </Link>

        {/* Nav links */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderRadius:8, fontSize:14, fontWeight: active ? 700 : 500, textDecoration:'none',
                background: active ? 'var(--secondary-container)' : 'transparent',
                color: active ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
                transition:'background 0.12s, color 0.12s',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize:20 }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop:'1px solid var(--outline-variant)', paddingTop:12, display:'flex', flexDirection:'column', gap:4 }}>
          <button onClick={handleClear} disabled={clearing} style={{
            display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
            borderRadius:8, fontSize:14, fontWeight:500, border:'none', background:'none',
            color:'var(--error)', cursor:'pointer', width:'100%', textAlign:'left',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize:20 }}>delete_sweep</span>
            {clearing ? 'Clearing…' : 'Clear My Data'}
          </button>
          <div style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
            <span className="material-symbols-outlined" style={{ fontSize:13, color:'var(--primary)' }}>lock</span>
            <span style={{ fontSize:11, fontWeight:700, color:'var(--primary)', letterSpacing:'0.05em' }}>LOCAL MODE ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background:'#1a1a2e', color:'#fff', padding:'12px 24px',
          borderRadius:24, fontSize:14, fontWeight:600, zIndex:9999,
          boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
        }}>{toast}</div>
      )}
    </>
  )
}
