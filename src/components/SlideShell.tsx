import type { ReactNode } from 'react'
import type { SlideData } from '../content/slides'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SlideNav from './SlideNav'
import ProgressBar from './ProgressBar'
import PresenterNotesDrawer from './PresenterNotesDrawer'
import GoDeeper from './GoDeeper'

interface Props {
  slideData: SlideData
  currentIndex: number
  totalSlides: number
  showNotes: boolean
  onToggleNotes: () => void
  onNext: () => void
  onPrev: () => void
  onGoTo: (index: number) => void
  onShowHelp: () => void
  children: ReactNode
}

export default function SlideShell({
  slideData,
  currentIndex,
  totalSlides,
  showNotes,
  onToggleNotes,
  onNext,
  onPrev,
  onGoTo,
  onShowHelp,
  children,
}: Props) {
  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Top nav */}
      <SlideNav
        currentIndex={currentIndex}
        onGoTo={onGoTo}
        onToggleNotes={onToggleNotes}
        onShowHelp={onShowHelp}
        showNotes={showNotes}
      />

      {/* Main slide area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 overflow-hidden ${showNotes ? 'pr-0' : ''}`}>
          {children}
        </div>
        <PresenterNotesDrawer
          notes={slideData.notes}
          isOpen={showNotes}
          onClose={onToggleNotes}
        />
      </div>

      {/* Go Deeper accordion */}
      {slideData.deeper.length > 0 && currentIndex > 0 && currentIndex < totalSlides - 1 && (
        <div className="no-print absolute bottom-20 left-12 lg:left-20 z-10" style={{ maxWidth: showNotes ? 'calc(100% - 420px)' : '48%' }}>
          <GoDeeper items={slideData.deeper} />
        </div>
      )}

      {/* Bottom bar */}
      <div className="no-print h-16 flex items-center justify-between px-8 bg-white/90 backdrop-blur-md border-t border-border z-20 shrink-0">
        {/* Left: Nav buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all border border-border hover:border-border-hover shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalSlides - 1}
            aria-label="Next slide"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all shadow-md shadow-accent-blue/15"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-surface rounded-xl border border-border">
            <span className="text-[13px] text-text-secondary font-semibold tabular-nums font-mono">
              {currentIndex + 1}
            </span>
            <span className="text-text-muted text-xs">/</span>
            <span className="text-[13px] text-text-secondary font-semibold tabular-nums font-mono">
              {totalSlides}
            </span>
          </div>
          <ProgressBar current={currentIndex} total={totalSlides} />
        </div>
      </div>
    </div>
  )
}
