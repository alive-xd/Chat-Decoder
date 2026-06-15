/**
 * Client-side WhatsApp .txt parser.
 * Runs entirely in the browser — raw file content never leaves the device.
 * Handles Android and iPhone export formats.
 */

export interface ParsedMessage {
  sender: string
  timestamp: string
  message: string
  is_media: boolean
}

const MEDIA_TOKENS = [
  '<media omitted>',
  'image omitted',
  'video omitted',
  'audio omitted',
  'document omitted',
  'gif omitted',
  'sticker omitted',
  'contact card omitted',
]

const SYSTEM_PATTERNS = [
  /messages and calls are end-to-end encrypted/i,
  /created group/i,
  /added .+/i,
  /changed the subject/i,
  /changed this group/i,
  /security code changed/i,
  /your messages are end-to-end encrypted/i,
  /was added/i,
  /left/i,
]

// Android: "01/23/2024, 14:05 - Alice: Hey"
const ANDROID_RE = /^(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s+-\s+([^:]+):\s(.*)$/

// iPhone: "[01/23/2024, 2:05:33 PM] Alice: Hey"
const IPHONE_RE = /^\[(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s+([^:]+):\s(.*)$/

function parseDate(dateStr: string, timeStr: string): string | null {
  const combined = `${dateStr.trim()} ${timeStr.trim()}`

  const formats: Array<(s: string) => Date | null> = [
    // DD/MM/YYYY HH:MM
    (s) => {
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
      if (!m) return null
      return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T${m[4].padStart(2,'0')}:${m[5]}:${m[6]||'00'}`)
    },
    // MM/DD/YYYY HH:MM
    (s) => {
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
      if (!m) return null
      const d = new Date(`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}T${m[4].padStart(2,'0')}:${m[5]}:${m[6]||'00'}`)
      return isNaN(d.getTime()) ? null : d
    },
    // With AM/PM
    (s) => {
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d
    },
  ]

  for (const fmt of formats) {
    try {
      const d = fmt(combined)
      if (d && !isNaN(d.getTime())) return d.toISOString()
    } catch { /* continue */ }
  }
  return null
}

function isSystemMessage(text: string): boolean {
  return SYSTEM_PATTERNS.some(p => p.test(text))
}

function isMedia(text: string): boolean {
  const lower = text.toLowerCase()
  return MEDIA_TOKENS.some(t => lower.includes(t))
}

export function parseWhatsAppExport(text: string): ParsedMessage[] {
  const lines = text.split('\n')
  const messages: ParsedMessage[] = []
  let currentMsg: ParsedMessage | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Try iPhone format first, then Android
    const iphoneMatch = trimmed.match(IPHONE_RE)
    const androidMatch = trimmed.match(ANDROID_RE)
    const match = iphoneMatch || androidMatch

    if (match) {
      // Save previous accumulated message
      if (currentMsg) messages.push(currentMsg)

      const [, dateStr, timeStr, sender, body] = match
      const senderTrimmed = sender.trim()
      const bodyTrimmed = body.trim()

      if (isSystemMessage(bodyTrimmed)) {
        currentMsg = null
        continue
      }

      const timestamp = parseDate(dateStr, timeStr)
      if (!timestamp) {
        currentMsg = null
        continue
      }

      currentMsg = {
        sender: senderTrimmed,
        timestamp,
        message: bodyTrimmed,
        is_media: isMedia(bodyTrimmed),
      }
    } else if (currentMsg) {
      // Continuation line — append to current message
      currentMsg.message += '\n' + trimmed
    }
  }

  // Push last message
  if (currentMsg) messages.push(currentMsg)

  return messages
}
