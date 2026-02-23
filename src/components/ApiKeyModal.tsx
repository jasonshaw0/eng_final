import { X, Settings2 } from 'lucide-react'

interface Props {
  onClose: () => void
  showAnimControls: boolean
  onToggleAnimControls: () => void
}

export default function ApiKeyModal({ onClose, showAnimControls, onToggleAnimControls }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-accent-blue" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Presentation Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface border border-border">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-text-primary">Animation Controls</span>
              <span className="text-xs text-text-muted">Show play/pause/speed on visualizations</span>
            </div>
            <button
              onClick={onToggleAnimControls}
              className={`relative w-11 h-6 transition-colors rounded-full ${showAnimControls ? 'bg-accent-blue' : 'bg-border'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showAnimControls ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <p className="text-xs text-blue-600 leading-relaxed font-medium">
              Manual mode navigation: Use arrow keys or the spacebar to advance slides.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-text-primary text-white text-sm font-bold hover:bg-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
