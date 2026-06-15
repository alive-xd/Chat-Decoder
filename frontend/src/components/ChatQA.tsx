'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session-context'

interface Message { role:'user'|'assistant'; content:string; sources?:Array<{chunk_index:number;preview:string}> }

const SUGGESTIONS = [
  { icon:'diversity_3',  text:'What topics caused the most disagreement?' },
  { icon:'schedule',     text:'When were we most active?' },
  { icon:'insights',     text:'How did our communication change over time?' },
  { icon:'favorite',     text:'What are the most positive moments?' },
  { icon:'psychology',   text:'What is each person\'s communication style?' },
  { icon:'trending_up',  text:'Who initiates conversations more?' },
]

export default function ChatQA() {
  const { sessionId } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  async function send(q: string) {
    if (!q.trim() || !sessionId || loading) return
    setError('')
    setMessages(prev => [...prev, { role:'user', content:q }])
    setInput('')
    setLoading(true)
    try {
      const res = await api.ask(sessionId, q)
      setMessages(prev => [...prev, { role:'assistant', content:res.answer, sources:res.sources }])
    } catch(e:any) {
      if (e.message?.includes('429') || e.message?.includes('Rate')) setError('Rate limit reached (10/min). Please wait a moment.')
      else setError(e.message || 'Failed to get an answer.')
      setMessages(prev => prev.slice(0,-1))
    } finally { setLoading(false); inputRef.current?.focus() }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:520 }}>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 16px', background:'var(--background)' }}>

        {/* Welcome */}
        {!messages.length && (
          <div style={{ textAlign:'center', paddingTop:24, paddingBottom:32 }}>
            <div style={{ width:48, height:48, background:'rgba(37,211,102,0.1)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize:24, color:'var(--primary)' }}>psychology</span>
            </div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Ask anything</div>
            <div style={{ fontSize:13, color:'var(--on-surface-variant)', marginBottom:24 }}>RAG-powered · 10 queries/minute · Cited answers</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, maxWidth:620, margin:'0 auto' }}>
              {SUGGESTIONS.map(s => (
                <button key={s.text} onClick={() => send(s.text)} style={{
                  padding:'12px 14px', background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)',
                  borderRadius:12, cursor:'pointer', textAlign:'left', transition:'border-color 0.15s',
                  fontFamily:'inherit',
                }}
                  onMouseOver={e => (e.currentTarget.style.borderColor='var(--primary-container)')}
                  onMouseOut={e  => (e.currentTarget.style.borderColor='var(--outline-variant)')}>
                  <span className="material-symbols-outlined" style={{ fontSize:16, color:'var(--primary)', display:'block', marginBottom:6 }}>{s.icon}</span>
                  <span style={{ fontSize:12, color:'var(--on-surface-variant)', lineHeight:1.4 }}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat bubbles */}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom:20, display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start', animation:'fadeSlideUp 0.25s ease' }}>
            {msg.role === 'user' ? (
              <div style={{ maxWidth:'72%', background:'var(--primary-container)', color:'var(--on-primary-container)', padding:'13px 16px', borderRadius:'18px 18px 4px 18px', fontSize:14, lineHeight:1.55 }}>
                {msg.content}
              </div>
            ) : (
              <div style={{ maxWidth:'78%' }}>
                <div style={{ display:'flex', gap:10, marginBottom:6 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:14, color:'#fff' }}>auto_awesome</span>
                  </div>
                  <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:'4px 18px 18px 18px', padding:'14px 16px', fontSize:14, lineHeight:1.65, color:'var(--on-surface)' }}>
                    {msg.content}
                  </div>
                </div>
                {msg.sources?.length ? (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', paddingLeft:38 }}>
                    {msg.sources.slice(0,3).map((s,j) => (
                      <span key={j} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', background:'var(--surface-container)', border:'1px solid var(--outline-variant)', borderRadius:99, fontSize:11, color:'var(--on-surface-variant)', cursor:'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:11 }}>description</span>
                        Segment {j+1}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}

        {/* Typing */}
        {loading && (
          <div style={{ display:'flex', gap:10, marginBottom:20, animation:'fadeSlideUp 0.25s ease' }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span className="material-symbols-outlined" style={{ fontSize:14, color:'#fff' }}>auto_awesome</span>
            </div>
            <div style={{ background:'var(--surface-lowest)', border:'1px solid var(--outline-variant)', borderRadius:'4px 18px 18px 18px', padding:'14px 18px', display:'flex', gap:4, alignItems:'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--outline)', animation:`typingBounce 1.2s ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div style={{ padding:'10px 20px', background:'var(--error-container)', fontSize:13, color:'var(--error)', fontWeight:500 }}>{error}</div>
      )}

      {/* Input */}
      <div style={{ padding:'12px 16px', background:'var(--surface-lowest)', borderTop:'1px solid var(--outline-variant)', display:'flex', gap:10, alignItems:'center' }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Ask something about your conversation…"
          disabled={loading || !sessionId}
          style={{
            flex:1, padding:'11px 16px', fontSize:14, fontFamily:'inherit',
            background:'var(--background)', border:'1px solid var(--outline-variant)',
            borderRadius:99, outline:'none', color:'var(--on-surface)',
            transition:'border-color 0.15s',
          }}
          onFocus={e  => (e.target.style.borderColor='var(--primary-container)')}
          onBlur={e   => (e.target.style.borderColor='var(--outline-variant)')}
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim() || !sessionId}
          style={{
            width:40, height:40, borderRadius:'50%', background:'var(--primary)', border:'none',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            flexShrink:0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition:'opacity 0.15s',
          }}>
          <span className="material-symbols-outlined" style={{ color:'#fff', fontSize:18 }}>arrow_upward</span>
        </button>
      </div>
    </div>
  )
}
