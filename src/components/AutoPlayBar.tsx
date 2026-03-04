import { Mic, Pause, Play, RotateCcw } from 'lucide-react'
import type { NarrationSegment } from '../narration/manifestTypes'
import type { AutoPlayStatus } from '../narration/useAutoPlay'

interface Props {
  status: AutoPlayStatus
  segment: NarrationSegment | null
  error: string | null
  autoPlayActive: boolean
  alignmentWarning?: string | null
  onPause: () => void
  onResume: () => void
  onReset: () => void
}

function truncateLine(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  if (maxChars <= 1) return '…'
  return `${text.slice(0, maxChars - 1).trimEnd()}…`
}

function wrapSubtitle(text: string, maxChars = 54, maxLines = 2): string[] {
  const cleaned = text.trim().replace(/\s+/g, ' ')
  if (!cleaned) return []

  const chunks: string[] = []
  const phrases = cleaned.split(/(?<=[,;:.!?])\s+/)
  let current = ''

  for (const phrase of phrases) {
    const words = phrase.split(/\s+/)
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (next.length <= maxChars) {
        current = next
        continue
      }
      if (current) chunks.push(current)
      current = word
    }
    if (current && /[,.!?;:]$/.test(current)) {
      chunks.push(current)
      current = ''
    }
  }
  if (current) chunks.push(current)

  if (chunks.length <= maxLines) return chunks

  const clipped = chunks.slice(0, maxLines)
  clipped[maxLines - 1] = truncateLine(clipped[maxLines - 1], maxChars)
  return clipped
}

export default function AutoPlayBar({
  status,
  segment,
  error,
  autoPlayActive,
  alignmentWarning,
  onPause,
  onResume,
  onReset,
}: Props) {
  if (!autoPlayActive && !error && !alignmentWarning) return null

  const lines = segment ? wrapSubtitle(segment.text) : []
  const showSubtitle = (status === 'playing' || status === 'paused') && lines.length > 0
  const controlsVisible = status === 'playing' || status === 'paused' || status === 'loading'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {showSubtitle && (
        <div className="px-6 pb-4 flex justify-center">
          <div
            key={segment?.id || 'subtitle'}
            className="max-w-4xl w-full md:w-auto rounded-2xl border border-border bg-bg-secondary/88 text-text-primary shadow-xl backdrop-blur-md transition-opacity duration-150"
          >
            <div className="px-5 py-3 flex items-start gap-3">
              <Mic className="w-4 h-4 shrink-0 mt-1 text-accent-cyan" />
              <div className="leading-relaxed text-[15px] font-medium tracking-[0.01em]">
                {lines.map((line, idx) => (
                  <p key={`${segment?.id || 'line'}-${idx}`}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {controlsVisible && (
        <div className="px-6 pb-4 flex justify-center">
          <div className="pointer-events-auto rounded-full border border-border bg-bg-secondary/88 backdrop-blur-md shadow-lg px-2 py-1.5 flex items-center gap-1.5">
            {status === 'playing' ? (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                aria-label="Pause narration"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                aria-label="Resume narration"
                disabled={status === 'loading'}
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
              aria-label="Reset narration"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6 pb-4 flex justify-center">
          <div className="max-w-3xl w-full md:w-auto rounded-xl border border-rose-300/40 bg-rose-950/72 text-rose-100 px-4 py-2 text-sm shadow-lg">
            {error}
          </div>
        </div>
      )}

      {alignmentWarning && (
        <div className="px-6 pb-4 flex justify-center">
          <div className="max-w-3xl w-full md:w-auto rounded-xl border border-amber-300/40 bg-amber-950/65 text-amber-100 px-4 py-2 text-sm shadow-lg">
            {alignmentWarning}
          </div>
        </div>
      )}
    </div>
  )
}
