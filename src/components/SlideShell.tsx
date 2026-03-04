import type { ReactNode } from 'react'
import type { SlideData } from '../content/slides'
import { ChevronLeft, ChevronRight, NotebookPen } from 'lucide-react'
import PresenterNotesDrawer from './PresenterNotesDrawer'
import GoDeeper from './GoDeeper'
import SlideTopbar from './SlideTopbar'

interface Props {
  slideData: SlideData
  currentIndex: number
  totalSlides: number
  direction: 'forward' | 'backward'
  transitioning: boolean
  showNotes: boolean
  presentationMode: boolean
  autoPlayActive: boolean
  onToggleNotes: () => void
  onShowHelp: () => void
  onNext: () => void
  onPrev: () => void
  onGoTo: (index: number) => void
  children: ReactNode
}

export default function SlideShell({
  slideData,
  currentIndex,
  totalSlides,
  direction,
  transitioning,
  showNotes,
  presentationMode,
  autoPlayActive,
  onToggleNotes,
  onShowHelp,
  onNext,
  onPrev,
  onGoTo,
  children,
}: Props) {
  const compactChrome = presentationMode && (autoPlayActive || currentIndex === 0)
  const showBottomBar = !compactChrome
  const showDeeper = slideData.deeper.length > 0 && currentIndex > 0 && currentIndex < totalSlides - 1
  const stageWidth = showBottomBar
    ? 'min(100vw, calc((100vh - 12.5rem) * 16 / 9))'
    : 'min(100vw, calc((100vh - 7.25rem) * 16 / 9))'

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="no-print shrink-0 px-3 sm:px-5 pt-3 pb-2">
        <div className="mx-auto" style={{ width: "100%" }}>
          <SlideTopbar
            currentIndex={currentIndex}
            totalSlides={totalSlides}
            showNotes={showNotes}
            onGoTo={onGoTo}
            onToggleNotes={onToggleNotes}
            onShowHelp={onShowHelp}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 px-3 sm:px-5 pb-3">
        <div className="w-full h-full relative flex items-center justify-center">
          <div
            className="relative max-w-[1500px] aspect-video"
            style={{ width: stageWidth }}
          >
            <div className="absolute inset-0">
              <div className="h-full rounded-[1.75rem] border border-border/80 bg-bg-card/72 backdrop-blur-xl overflow-hidden card-shadow relative">
                <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-accent-cyan/5 via-transparent to-accent-purple/5" />
                <div className="absolute inset-0 pointer-events-none opacity-[0.09]" style={{ backgroundImage: 'linear-gradient(rgba(100,130,220,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100,130,220,0.5) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

                {transitioning && (
                  <div
                    className={`absolute inset-y-0 w-[42%] pointer-events-none z-20 slide-sweep ${direction === 'forward' ? 'slide-sweep-forward' : 'slide-sweep-backward'
                      }`}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-accent-cyan/20 to-transparent blur-md" />
                  </div>
                )}

                <div className="relative z-10 h-full overflow-hidden px-1 sm:px-2 py-1 sm:py-2">
                  {children}
                </div>
              </div>
            </div>
          </div>

          {showDeeper && !compactChrome && (
            <div className="no-print absolute left-4 bottom-4 z-30 max-w-[56%]">
              <GoDeeper items={slideData.deeper} />
            </div>
          )}

          <div className="absolute right-0 top-0 bottom-0 z-40 pointer-events-none">
            <div className="h-full pointer-events-auto">
              <PresenterNotesDrawer
                notes={slideData.notes}
                isOpen={showNotes}
                onClose={onToggleNotes}
              />
            </div>
          </div>
        </div>
      </div>

      {showBottomBar && (
        <div className="no-print shrink-0 px-2 sm:px-3 pb-3">
          <div className="w-full flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full glass-panel px-2.5 py-2">
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                aria-label="Previous slide"
                title="Previous slide"
                className="w-9 h-9 rounded-full border border-border bg-bg-surface/90 text-text-secondary hover:text-text-primary hover:border-border-hover disabled:opacity-35 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleNotes}
                aria-label="Toggle speaker notes"
                title="Speaker notes"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${showNotes
                  ? 'text-accent-cyan border-accent-cyan/45 bg-accent-cyan/15'
                  : 'text-text-muted border-border bg-bg-surface/90 hover:text-text-primary hover:border-border-hover'
                  }`}
              >
                <NotebookPen className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                disabled={currentIndex === totalSlides - 1}
                aria-label="Next slide"
                title="Next slide"
                className="w-9 h-9 rounded-full border border-accent-cyan/50 bg-linear-to-r from-accent-cyan/30 to-accent-blue/30 text-text-primary hover:from-accent-cyan/40 hover:to-accent-blue/40 disabled:opacity-35 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
