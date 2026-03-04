import { X, Settings2 } from 'lucide-react'

interface Props {
  onClose: () => void
  presentationMode: boolean
  onTogglePresentationMode: () => void
}

export default function ApiKeyModal({
  onClose,
  presentationMode,
  onTogglePresentationMode,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-bg-secondary border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/12 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-accent-cyan" />
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
              <span className="text-sm font-bold text-text-primary">Presentation Mode</span>
              <span className="text-xs text-text-muted">Hide dense chrome during autoplay (`P` hotkey)</span>
            </div>
            <button
              onClick={onTogglePresentationMode}
              className={`relative w-11 h-6 transition-colors rounded-full ${presentationMode ? 'bg-accent-cyan' : 'bg-border'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-bg-card rounded-full transition-transform ${presentationMode ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/25">
            <p className="text-xs text-accent-cyan leading-relaxed font-medium">
              AI autoplay uses pre-rendered narration files and alignment metadata in <code>public/narration</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-linear-to-r from-accent-cyan to-accent-blue text-white text-sm font-bold hover:opacity-95 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
