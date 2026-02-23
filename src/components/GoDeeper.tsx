import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface DeeperItem {
  text: string
  katex?: string
}

interface Props {
  items: DeeperItem[]
}

export default function GoDeeper({ items }: Props) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <div className="w-full max-w-3xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-amber hover:text-accent-amber/80 bg-white/95 backdrop-blur rounded-xl border border-amber-200 hover:border-amber-300 shadow-sm transition-all"
        aria-expanded={open}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Go Deeper
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur rounded-xl border border-border p-5 space-y-3 card-shadow-lg">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-accent-amber text-sm mt-0.5 font-bold">▸</span>
              <div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.text}</p>
                {item.katex && (
                  <div
                    className="mt-2 text-sm bg-bg-surface rounded-lg p-2 border border-border"
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(item.katex, {
                        throwOnError: false,
                        displayMode: true,
                      }),
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
