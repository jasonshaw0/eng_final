import { Play, Pause, SkipForward, Square, Settings, Mic } from 'lucide-react'
import type { AutoPlayStatus } from '../narration/useAutoPlay'
import { narrations } from '../narration/narrationScripts'

interface Props {
  status: AutoPlayStatus
  currentSlide: number
  currentSegment: number
  generationProgress: { done: number; total: number }
  error: string | null
  playbackRate: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onSkip: () => void
  onSpeedChange: (rate: number) => void
  onSettings: () => void
}

const speeds = [0.75, 1, 1.25, 1.5, 2]

export default function AutoPlayBar({
  status,
  currentSlide,
  currentSegment,
  generationProgress,
  error,
  playbackRate,
  onPause,
  onResume,
  onStop,
  onSkip,
  onSpeedChange,
  onSettings,
}: Props) {
  if (status === 'idle') return null

  const narration = narrations[currentSlide]
  const isPlaying = status === 'playing'
  const isPaused = status === 'paused'
  const isGenerating = status === 'generating'

  const nextSpeed = () => {
    const idx = speeds.indexOf(playbackRate)
    onSpeedChange(speeds[(idx + 1) % speeds.length])
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Current sentence subtitle */}
      {(isPlaying || isPaused) && narration && currentSegment >= 0 && narration.segments[currentSegment] && (
        <div className="mb-1 flex justify-center px-8">
          <div className="inline-flex items-start gap-2.5 px-5 py-3 bg-white/95 backdrop-blur-md rounded-xl border border-border shadow-lg max-w-3xl">
            <Mic className="w-3.5 h-3.5 text-accent-blue shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary leading-relaxed font-medium">
              {narration.segments[currentSegment].text}
            </p>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="bg-white/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Status */}
          <div className="flex items-center gap-3 min-w-0">
            {isGenerating && (
              <>
                <div className="w-5 h-5 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-text-primary">
                    Generating audio...
                  </span>
                  <span className="text-xs text-text-muted ml-2">
                    {generationProgress.done}/{generationProgress.total} slides
                  </span>
                  <div className="w-32 h-1.5 bg-bg-surface rounded-full overflow-hidden mt-1.5 border border-border">
                    <div
                      className="h-full bg-accent-blue rounded-full transition-all duration-300"
                      style={{ width: `${(generationProgress.done / generationProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              </>
            )}
            {(isPlaying || isPaused) && (
              <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                {isPlaying ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    Playing
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-amber" />
                    Paused
                  </span>
                )}
              </span>
            )}
            {error && (
              <span className="text-sm text-accent-rose font-medium truncate">{error}</span>
            )}
          </div>

          {/* Center: Transport controls */}
          {(isPlaying || isPaused) && (
            <div className="flex items-center gap-2">
              <button
                onClick={isPaused ? onResume : onPause}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface hover:bg-border border border-border transition-colors"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={onSkip}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface hover:bg-border border border-border transition-colors"
                title="Skip to next slide"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={nextSpeed}
                className="px-3 py-2.5 rounded-xl bg-accent-blue/8 text-accent-blue font-mono font-bold text-xs border border-accent-blue/15 hover:bg-accent-blue/15 transition-colors"
                title="Playback speed"
              >
                {playbackRate}×
              </button>
            </div>
          )}

          {/* Right: Stop / Settings */}
          <div className="flex items-center gap-2">
            {(isPlaying || isPaused) && (
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-rose/10 text-accent-rose border border-accent-rose/20 text-sm font-semibold hover:bg-accent-rose/20 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
            )}
            <button
              onClick={onSettings}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-surface hover:bg-border border border-border text-text-muted hover:text-text-secondary transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
