import { useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound, Printer, Sparkles } from 'lucide-react'
import type { AutoPlayStatus } from '../narration/useAutoPlay'

interface Props {
  onSettings?: () => void
  onStartAutoPlay?: () => void
  autoPlayStatus?: AutoPlayStatus
  narrationReady?: boolean
  presentationMode?: boolean
}

export default function Slide0Cover({
  onSettings,
  onStartAutoPlay,
  autoPlayStatus = 'idle',
  narrationReady = false,
  presentationMode = true,
}: Props) {
  const navigate = useNavigate()
  const starting = autoPlayStatus === 'loading' || autoPlayStatus === 'playing' || autoPlayStatus === 'paused'

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 lg:px-10 py-10 text-center relative">
      {/* Decorative blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/5 border border-accent-blue/15 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="text-md font-semibold text-accent-blue tracking-wider uppercase">By Jason Shaw</span>
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2rem,8vw,5.1rem)] font-extrabold leading-[1.05] mb-6 text-text-primary px-2">
          Why Renewable Energy Is Harder Than{' '}
          <span className="bg-linear-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
            "Just Add Solar"
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[clamp(1.02rem,2.2vw,1.45rem)] text-text-secondary font-light mb-10 max-w-3xl mx-auto leading-relaxed">
          A systems-level, engineering-first guide for non-experts
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={onStartAutoPlay}
            disabled={!narrationReady || starting}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-linear-to-r from-accent-cyan to-accent-blue text-white font-bold text-base shadow-xl shadow-accent-blue/20 hover:shadow-accent-blue/30 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {starting ? 'AI Presentation Running' : 'Start AI Presentation'}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/slide/1')}
            className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-bg-card border border-border text-text-secondary hover:text-text-primary font-semibold text-base shadow-sm transition-all duration-200"
          >
            Start Manual
          </button>
        </div>

        {!presentationMode && (
          <p className="text-xs text-text-muted mb-6">
            {narrationReady
              ? 'Narration manifest loaded. One click starts full autoplay.'
              : 'Narration manifest not loaded yet. Manual mode is still available.'}
          </p>
        )}

        {!presentationMode && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={onSettings}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-surface border border-border hover:border-border-hover text-text-muted hover:text-text-secondary font-medium text-sm transition-all"
            >
              <KeyRound className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => window.open(window.location.origin + window.location.pathname + '#/print', '_blank')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-surface border border-border hover:border-border-hover text-text-muted hover:text-text-secondary font-medium text-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Notes
            </button>
          </div>
        )}

        {/* Nav hints */}
        <div className="mt-5 p-3 rounded-xl bg-bg-card/85 border border-border shadow-sm inline-block">
          <p className="text-xs text-text-muted">
            Navigate with{' '}
            <kbd className="px-2 py-0.5 bg-bg-surface rounded-md text-accent-blue text-xs font-mono border border-border shadow-sm mx-0.5">←</kbd>
            <kbd className="px-2 py-0.5 bg-bg-surface rounded-md text-accent-blue text-xs font-mono border border-border shadow-sm mx-0.5">→</kbd>
            {' '}or{' '}
            <kbd className="px-2 py-0.5 bg-bg-surface rounded-md text-accent-blue text-xs font-mono border border-border shadow-sm mx-0.5">Space</kbd>
          </p>
        </div>
      </div>
    </div>
  )
}
