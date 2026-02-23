import { Notebook, X } from 'lucide-react'

interface Props {
  notes: string
  isOpen: boolean
  onClose: () => void
}

export default function PresenterNotesDrawer({ notes, isOpen, onClose }: Props) {
  return (
    <div
      className={`h-full bg-bg-secondary border-l border-border transition-all duration-300 ease-in-out overflow-y-auto shrink-0 ${
        isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'
      }`}
      aria-label="Presenter notes"
      role="complementary"
    >
      {isOpen && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-accent-purple flex items-center gap-2 uppercase tracking-wider">
              <Notebook className="w-4 h-4" />
              Speaker Notes
            </h3>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-secondary p-1.5 rounded-lg hover:bg-bg-surface transition-colors"
              aria-label="Close notes"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-white border border-border card-shadow">
            <p className="text-sm text-text-secondary leading-relaxed">{notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
