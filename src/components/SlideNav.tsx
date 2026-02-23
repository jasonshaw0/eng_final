import { slides } from '../content/slides'
import {
  Zap, Notebook, HelpCircle,
} from 'lucide-react'

interface Props {
  currentIndex: number
  onGoTo: (index: number) => void
  onToggleNotes: () => void
  onShowHelp: () => void
  showNotes: boolean
}

export default function SlideNav({ currentIndex, onGoTo, onToggleNotes, onShowHelp, showNotes }: Props) {
  const allItems = [...slides, { id: 8, shortTitle: 'References' }]

  return (
    <nav
      className="no-print h-16 flex items-center justify-between px-8 bg-white/90 backdrop-blur-md border-b border-border z-30 shrink-0"
      aria-label="Slide navigation"
    >
      {/* Left: Logo + Author */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-linear-to-br from-accent-cyan to-accent-blue flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-sm font-bold text-text-primary tracking-tight">Jason Shaw</span>
          <span className="text-[10px] text-text-muted font-medium tracking-wide">ENC2210 · Spring 2026</span>
        </div>
        <div className="w-px h-8 bg-border mx-2 hidden lg:block" />
      </div>

      {/* Center: Slide tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 justify-center mx-4">
        {allItems.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onGoTo(i)}
            className={`px-3.5 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
              i === currentIndex
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface border border-transparent'
            }`}
            aria-current={i === currentIndex ? 'page' : undefined}
          >
            {s.shortTitle}
          </button>
        ))}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleNotes}
          className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
            showNotes
              ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shadow-sm'
              : 'text-text-muted hover:text-text-secondary border border-transparent hover:bg-bg-surface hover:border-border'
          }`}
          aria-label="Toggle presenter notes"
        >
          <Notebook className="w-4 h-4" />
          <span className="hidden sm:inline">Notes</span>
        </button>
        <button
          onClick={onShowHelp}
          className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-secondary rounded-lg hover:bg-bg-surface border border-transparent hover:border-border transition-all"
          aria-label="Show keyboard shortcuts"
          title="Keyboard shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
