const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ParsedMessage {
  sender: string
  timestamp: string
  message: string
  is_media: boolean
}

export interface UploadResponse {
  session_id: string
  message_count: number
  chunk_count: number
  participants: string[]
}

export interface StatsData {
  total_messages: number
  participants: string[]
  messages_per_participant: Record<string, number>
  message_balance_pct: Record<string, number>
  avg_response_time_minutes: number
  most_active_hour: number
  longest_silence_hours: number
  initiation_ratio_pct: Record<string, number>
  first_message_date: string
  last_message_date: string
  total_days: number
  messages_per_day: number
}

export interface SentimentPoint {
  participant: string
  date: string
  score: number
}

export interface HealthScore {
  score: number
  label: string
  observations: string[]
}

export interface PersonalityProfile {
  tone: string
  humor: string
  assertiveness: string
  empathy: string
  summary: string
}

export interface TimelineEvent {
  date: string
  event: string
  type: 'first_message' | 'milestone' | 'silence' | 'emotional_peak' | 'topic_shift'
}

export interface AnalysisResult {
  stats: StatsData
  sentiment: SentimentPoint[]
  health: HealthScore
  personalities: Record<string, PersonalityProfile>
  timeline: TimelineEvent[]
}

export interface AskResponse {
  answer: string
  sources: Array<{ chunk_index: number; preview: string }>
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}

export const api = {
  upload: (sessionId: string | null, messages: ParsedMessage[]) =>
    apiFetch<UploadResponse>('/upload', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, messages }),
    }),

  analyze: (sessionId: string) =>
    apiFetch<AnalysisResult>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),

  ask: (sessionId: string, question: string) =>
    apiFetch<AskResponse>('/ask', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, question }),
    }),

  wipeSession: (sessionId: string) =>
    apiFetch<{ success: boolean; message: string }>(`/session/${sessionId}`, {
      method: 'DELETE',
    }),

  health: () => apiFetch<{ status: string }>('/health'),
}
