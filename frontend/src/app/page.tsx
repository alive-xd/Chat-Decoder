'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/session-context'
import FileUpload from '@/components/FileUpload'
import { X, ShieldCheck, Upload, Share, CloudOff, TrendingUp, Lock, Trash2, Brain, Database, Heart, Zap, ChevronDown } from 'lucide-react'
import { AnalysisResult } from '@/lib/api'

const MOCK_ANALYSIS: AnalysisResult = {
  stats: {
    total_messages: 14238,
    participants: ["Vanshika", "You"],
    messages_per_participant: { "Vanshika": 7412, "You": 6826 },
    message_balance_pct: { "Vanshika": 52.1, "You": 47.9 },
    avg_response_time_minutes: 14.2,
    most_active_hour: 20,
    longest_silence_hours: 58.0,
    initiation_ratio_pct: { "Vanshika": 48.0, "You": 52.0 },
    first_message_date: "2024-01-15",
    last_message_date: "2024-06-15",
    total_days: 152,
    messages_per_day: 93.7
  },
  sentiment: [
    { participant: "Vanshika", date: "2024-01-15", score: 0.15 },
    { participant: "You", date: "2024-01-15", score: 0.20 },
    { participant: "Vanshika", date: "2024-02-01", score: 0.18 },
    { participant: "You", date: "2024-02-01", score: 0.22 },
    { participant: "Vanshika", date: "2024-02-15", score: 0.05 },
    { participant: "You", date: "2024-02-15", score: 0.10 },
    { participant: "Vanshika", date: "2024-03-01", score: -0.05 },
    { participant: "You", date: "2024-03-01", score: 0.02 },
    { participant: "Vanshika", date: "2024-03-15", score: 0.12 },
    { participant: "You", date: "2024-03-15", score: 0.15 },
    { participant: "Vanshika", date: "2024-04-01", score: 0.25 },
    { participant: "You", date: "2024-04-01", score: 0.28 },
  ],
  health: {
    score: 92,
    label: "Exceptional",
    observations: [
      "Highly reciprocal response pattern with very balanced message frequency (52% vs 48%).",
      "Saturday evening around 8 PM represents your peak engagement window with fast response times.",
      "Topic analysis shows a high density of positive plans, shared interests, and inside jokes."
    ]
  },
  personalities: {
    "Vanshika": {
      tone: "Warm & Assertive",
      humor: "High (Playful)",
      assertiveness: "Moderate-High",
      empathy: "High",
      summary: "Expressive and warm, often initiating plans and bringing playfulness to the conversation."
    },
    "You": {
      tone: "Direct & Supportive",
      humor: "Moderate (Dry)",
      assertiveness: "Moderate",
      empathy: "High",
      summary: "Attentive listener, providing calm stability and steady engagement."
    }
  },
  timeline: [
    { date: "2024-01-15", event: "First connection established", type: "first_message" },
    { date: "2024-02-14", event: "Peak positive emotional window (Valentine's week)", type: "emotional_peak" },
    { date: "2024-03-05", event: "48h silence gap observed (travel overlap)", type: "silence" },
    { date: "2024-04-01", event: "Major shift towards future planning topics", type: "topic_shift" },
    { date: "2024-06-15", event: "Latest chat milestone analyzed", type: "milestone" }
  ]
}

export default function LandingPage() {
  const router = useRouter()
  const { sessionId, setSession, setAnalysis } = useSession()
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (sessionId) {
      router.replace('/dashboard')
    }
  }, [sessionId, router])

  function handleDemo() {
    setSession("demo_session", 14238, ["Vanshika", "You"])
    setAnalysis(MOCK_ANALYSIS)
    router.push('/dashboard')
  }

  if (sessionId) return null

  return (
    <div className="bg-surface text-on-surface font-body-md" style={{ borderColor: 'rgb(187, 203, 185)' }}>
      {/* Navigation Shell */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-bright/80 backdrop-blur-md border-b border-outline-variant px-gutter h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-headline-sm font-black text-on-background">Chat Decoder</span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-8 mr-4">
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How It Works</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#privacy">Privacy</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#faq">FAQ</a>
          </nav>
          <button onClick={handleDemo} className="hidden md:flex text-label-md font-label-md text-on-surface-variant px-4 py-2 hover:bg-surface-container rounded-lg transition-all">Try Demo</button>
          <button className="hidden md:flex text-label-md font-label-md text-on-surface-variant px-4 py-2 hover:bg-surface-container rounded-lg transition-all">Local Mode</button>
          <button onClick={() => setShowUpload(true)} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 transition-all scale-active:95">New Analysis</button>
        </div>
      </header>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-gutter mb-xxl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-on-primary-container px-4 py-2 rounded-full mb-8">
            <ShieldCheck size={16} className="text-primary" />
            <span className="text-label-sm uppercase tracking-wider font-semibold">100% Private — parsed in your browser</span>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-6xl text-on-background mb-6 max-w-4xl mx-auto leading-tight">
            <span className="block text-display-lg md:text-6xl font-bold tracking-tight mb-4 leading-tight text-on-background">
              Understand your <span className="text-primary">WhatsApp chats</span> like never before
            </span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Upload your WhatsApp chat and let our sophisticated intelligence layer transform raw text into deep, actionable behavioral data.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-20">
            <button onClick={() => setShowUpload(true)} className="bg-primary text-on-primary px-10 py-4 rounded-xl font-headline-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3">
              <Upload size={20} />
              Upload Chat
            </button>
            <button onClick={handleDemo} className="bg-surface border border-outline-variant text-on-surface-variant px-10 py-4 rounded-xl font-headline-sm shadow-sm hover:shadow-md hover:bg-surface-container transition-all flex items-center justify-center gap-3">
              <Zap size={20} className="text-primary" />
              Try Demo Mode
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-container-max mx-auto px-gutter mb-xxl" id="how-it-works">
          <div className="mb-xl text-center">
            <span className="text-label-sm text-primary font-label-sm uppercase tracking-wider mb-2 block">Simple 3-Step Process</span>
            <h2 className="font-headline-lg text-headline-lg mb-4 text-on-background">How It Works</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Decode your chat metrics in under a minute without compromising your privacy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 Card */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 flex flex-col text-left transition-all hover:shadow-md hover:border-primary">
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Share size={24} className="text-primary" />
              </div>
              <span className="text-label-sm text-secondary font-label-sm uppercase mb-2 block">Step 01</span>
              <h3 className="font-headline-sm text-headline-sm mb-3 text-on-background">Export Chat</h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Open the WhatsApp chat you want to analyze, tap the contact name or group info, scroll to <strong>Export Chat</strong>, and select <strong>Without Media</strong>. This exports a <code>.txt</code> file.
              </p>
            </div>

            {/* Step 2 Card */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 flex flex-col text-left transition-all hover:shadow-md hover:border-primary">
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <CloudOff size={24} className="text-primary" />
              </div>
              <span className="text-label-sm text-secondary font-label-sm uppercase mb-2 block">Step 02</span>
              <h3 className="font-headline-sm text-headline-sm mb-3 text-on-background">Load Locally</h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Upload the <code>.txt</code> file to Chat Decoder. The parsing is done entirely in your browser's sandboxed memory using local algorithms. <strong>No chat text is ever uploaded or stored.</strong>
              </p>
            </div>

            {/* Step 3 Card */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 flex flex-col text-left transition-all hover:shadow-md hover:border-primary">
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <span className="text-label-sm text-secondary font-label-sm uppercase mb-2 block">Step 03</span>
              <h3 className="font-headline-sm text-headline-sm mb-3 text-on-background">Explore Insights</h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Instantly interact with rich dashboards, emotional sentiment timelines, reciprocity balance statistics, and query your chat history using the built-in local Q&A engine.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-xxl" id="privacy">
          <div className="max-w-container-max mx-auto px-gutter text-center">
            <h2 className="font-display-lg text-headline-lg md:text-5xl mb-6">Your data stays local.</h2>
            <p className="text-headline-sm text-primary font-bold mb-12">We analyze, we don't store.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center mb-6 border border-outline-variant">
                  <Lock size={32} className="text-primary" />
                </div>
                <h4 className="font-headline-sm mb-2">On-Device Processing</h4>
                <p className="text-body-sm text-on-surface-variant">All computations happen locally in your browser's sandboxed environment.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center mb-6 border border-outline-variant">
                  <CloudOff size={32} className="text-primary" />
                </div>
                <h4 className="font-headline-sm mb-2">Offline Capability</h4>
                <p className="text-body-sm text-on-surface-variant">Once loaded, you can disconnect your internet and Chat Decoder will still function.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-surface rounded-full shadow-sm flex items-center justify-center mb-6 border border-outline-variant">
                  <Trash2 size={32} className="text-primary" />
                </div>
                <h4 className="font-headline-sm mb-2">Total Volatility</h4>
                <p className="text-body-sm text-on-surface-variant">Refresh the page and everything is gone. No database, no logs, no traces left behind.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-xl max-w-container-max mx-auto px-gutter border-b border-outline-variant">
          <p className="text-center text-label-sm text-on-surface-variant uppercase tracking-widest mb-10">Powered by high-performance intelligence</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-primary" />
              <span className="font-bold text-headline-sm">NeuralKit</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={20} className="text-primary" />
              <span className="font-bold text-headline-sm">DataCore</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-primary animate-pulse" />
              <span className="font-bold text-headline-sm">PrivacyMesh</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              <span className="font-bold text-headline-sm">FastGraph</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-xxl max-w-3xl mx-auto px-gutter" id="faq">
          <h2 className="font-headline-lg text-center mb-12">Common Questions</h2>
          <div className="space-y-4">
            <details className="group bg-surface border border-outline-variant rounded-xl overflow-hidden" open>
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-container-low transition-colors list-none">
                <span className="font-headline-sm">How do I get my WhatsApp chat file?</span>
                <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-on-surface-variant" />
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant text-body-md text-left">
                Open the chat you want to analyze, tap the contact's name, scroll down to "Export Chat", and select "Without Media". This will generate a .txt file you can upload here.
              </div>
            </details>
            <details className="group bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-container-low transition-colors list-none">
                <span className="font-headline-sm">Does this work for group chats?</span>
                <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-on-surface-variant" />
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant text-body-md text-left">
                Yes! Chat Decoder can analyze group dynamics, identifying the most active participants, primary time slots for activity, and the overall emotional sentiment of the group.
              </div>
            </details>
            <details className="group bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-container-low transition-colors list-none">
                <span className="font-headline-sm">Is my partner's data safe?</span>
                <ChevronDown size={20} className="group-open:rotate-180 transition-transform text-on-surface-variant" />
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant text-body-md text-left">
                Absolutely. Since no data leaves your browser, no one—not even us—has access to the conversation or the identities within it. Privacy is baked into the architecture.
              </div>
            </details>
          </div>
        </section>
      </main>

      <footer className="py-xl border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-headline-sm font-black text-on-background">Chat Decoder</span>
            <span className="text-label-sm text-on-surface-variant">© 2026 Chat Decoder</span>
          </div>
          <div className="md:ml-auto text-label-md text-on-surface-variant">
            Designed with ❤️ | Crafted by <a href="https://instagram.com/sushen.raw" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">Admin</a>
          </div>
        </div>
      </footer>

      {/* File Upload Modal Overlay */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-background/20 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="glass-card w-full max-w-xl p-8 rounded-3xl relative shadow-2xl animate-fade-up" style={{ background: 'var(--surface-lowest)', borderColor: 'var(--outline-variant)' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowUpload(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container"
            >
              <X size={20} />
            </button>
            <div className="mb-6 text-center">
              <h3 className="text-headline-sm font-bold text-on-background">Upload Your Chat</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Select your exported WhatsApp .txt file to decode it locally.</p>
            </div>
            <FileUpload />
          </div>
        </div>
      )}
    </div>
  )
}
