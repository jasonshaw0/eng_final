import { Keyboard, X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  const shortcuts = [
    { key: '→  or  Space', action: 'Next slide' },
    { key: '←', action: 'Previous slide' },
    { key: 'N', action: 'Toggle presenter notes' },
    { key: '?  or  H', action: 'Toggle this help' },
    { key: 'Esc', action: 'Close panels' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="bg-white border border-border rounded-2xl p-7 max-w-sm w-full mx-4 card-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2"><Keyboard className="w-5 h-5" /> Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary p-1.5 rounded-lg hover:bg-bg-surface transition-colors"
            aria-label="Close help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-surface border border-border">
              <kbd className="px-2.5 py-1 bg-white text-accent-blue text-xs font-mono rounded-md border border-border shadow-sm">
                {s.key}
              </kbd>
              <span className="text-sm text-text-secondary font-medium">{s.action}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-5 text-center">
          Click the slide tabs in the header to jump directly
        </p>
      </div>
    </div>
  )
}
