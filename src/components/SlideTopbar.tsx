import { CircleHelp, NotebookPen } from 'lucide-react'
import { slides } from '../content/slides'

interface Props {
  currentIndex: number
  totalSlides: number
  showNotes: boolean
  onGoTo: (index: number) => void
  onToggleNotes: () => void
  onShowHelp: () => void
}

const navItems = [...slides.map((slide) => ({ id: slide.id, shortTitle: slide.shortTitle })), { id: 8, shortTitle: 'References' }]

export default function SlideTopbar({
  currentIndex,
  totalSlides,
  showNotes,
  onGoTo,
  onToggleNotes,
  onShowHelp,
}: Props) {
  const progressPct = ((currentIndex + 1) / totalSlides) * 100

  return (
    <nav className="w-full" aria-label="Slide navigation">
      <div className="w-full rounded-2xl border border-border/75 bg-bg-secondary/72 backdrop-blur-xl overflow-hidden shadow-[0_14px_34px_rgba(2,6,23,0.5)]">
        <div className="px-3 sm:px-4 py-2.5 grid items-center gap-2 grid-cols-[5.25rem_minmax(0,1fr)_5.25rem] md:grid-cols-[11rem_minmax(0,1fr)_11rem]">
          <div className="w-[5.25rem] md:w-[11rem] overflow-hidden whitespace-nowrap">
            <span className="hidden md:block text-[10px] font-medium tracking-[0.08em] text-text-muted/65">
              Renewable Energy · Jason Shaw
            </span>
          </div>

          <div className="min-w-0 overflow-x-auto col-start-2">
            <div className="flex items-center justify-center gap-1.5 w-max min-w-full">
              {navItems.map((item, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={item.id}
                    onClick={() => onGoTo(idx)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Go to slide ${idx + 1}: ${item.shortTitle}`}
                    className={`group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs whitespace-nowrap transition-all duration-200 ${isActive
                      ? 'text-text-primary border-accent-cyan/40 bg-linear-to-r from-accent-cyan/14 to-accent-blue/14 shadow-[0_0_0_1px_rgba(14,165,233,0.18)]'
                      : 'text-text-muted border-border/60 bg-bg-surface/28 hover:text-text-secondary hover:bg-bg-surface/60'
                      }`}
                  >
                    <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-md font-mono text-[10px] ${isActive ? 'bg-accent-cyan/24 text-text-primary' : 'bg-bg-card text-text-muted'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-semibold tracking-[0.01em]">{item.shortTitle}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="col-start-3 justify-self-end w-[5.25rem] md:w-[11rem] flex items-center justify-end gap-1.5">
            <button
              onClick={onToggleNotes}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${showNotes
                ? 'text-accent-cyan border-accent-cyan/45 bg-accent-cyan/15'
                : 'text-text-muted border-border bg-bg-surface/80 hover:text-text-primary hover:border-border-hover'
                }`}
              aria-label="Toggle speaker notes"
              title="Speaker notes"
            >
              <NotebookPen className="w-4 h-4" />
            </button>
            <button
              onClick={onShowHelp}
              className="w-9 h-9 rounded-lg border border-border bg-bg-surface/80 text-text-muted hover:text-text-primary hover:border-border-hover transition-colors flex items-center justify-center"
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <CircleHelp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-[2px] bg-bg-surface/80">
          <div
            className="h-full bg-linear-to-r from-accent-cyan via-accent-blue to-accent-purple progress-glow transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </nav>
  )
}
