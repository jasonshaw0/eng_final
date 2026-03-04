import { useCallback } from 'react'
import { Play, Pause } from 'lucide-react'

interface Props {
  cycleDuration: number
  elapsed: number
  onPauseChange: (paused: boolean) => void
  onSpeedChange: (speed: number) => void
  paused: boolean
  speed: number
  visible?: boolean
}

const speeds = [0.5, 1, 1.5, 2, 3]

export default function AnimationControls({ cycleDuration, elapsed, onPauseChange, onSpeedChange, paused, speed, visible = true }: Props) {
  const cycleNext = useCallback(() => {
    const idx = speeds.indexOf(speed)
    onSpeedChange(speeds[(idx + 1) % speeds.length])
  }, [speed, onSpeedChange])
  const pct = cycleDuration > 0 ? Math.min((elapsed / cycleDuration) * 100, 100) : 0

  if (!visible) return null

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-bg-card border border-border shadow-sm text-xs select-none">
      {/* Play/Pause */}
      <button
        onClick={() => onPauseChange(!paused)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-surface hover:bg-border text-text-secondary hover:text-text-primary transition-colors border border-border"
        aria-label={paused ? 'Play animation' : 'Pause animation'}
        title={paused ? 'Play' : 'Pause'}
      >
        {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
      </button>

      {/* Progress bar */}
      <div className="w-24 h-2 bg-bg-surface rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-linear-to-r from-accent-cyan to-accent-blue rounded-full"
          style={{ width: `${pct}%`, transition: paused ? 'none' : 'width 0.15s linear' }}
        />
      </div>

      {/* Time */}
      <span className="text-text-muted font-mono tabular-nums text-[11px] w-16 text-center">
        {elapsed.toFixed(1)}s / {cycleDuration}s
      </span>

      {/* Speed */}
      <button
        onClick={cycleNext}
        className="px-2.5 py-1.5 rounded-lg bg-accent-blue/8 text-accent-blue hover:bg-accent-blue/15 font-mono font-bold text-[11px] transition-colors border border-accent-blue/15"
        aria-label={`Speed: ${speed}x. Click to change.`}
        title={`Speed: ${speed}×`}
      >
        {speed}×
      </button>
    </div>
  )
}
