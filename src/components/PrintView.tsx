import { useEffect } from 'react'
import { Printer, FileText, BookOpen } from 'lucide-react'
import { slides, references } from '../content/slides'
import { narrations } from '../narration/narrationScripts'

export default function PrintView() {
  // Auto-trigger print dialog after render
  useEffect(() => {
    const timeout = setTimeout(() => window.print(), 600)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      {/* Print-specific styles + override global clipping */}
      <style>{`
        /* Override the global overflow:hidden / height:100vh that clips content */
        html, #root {
          overflow: auto !important;
          height: auto !important;
        }
        #root {
          width: auto !important;
        }
        @media print {
          @page {
            size: letter;
            margin: 0.75in 0.9in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-page-break { page-break-before: always; }
          .print-avoid-break { page-break-inside: avoid; }
        }
        @media screen {
          .print-container {
            max-width: 52rem;
            margin: 0 auto;
            padding: 2rem;
          }
        }
      `}</style>

      <div className="print-container bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontSize: '11pt', lineHeight: '1.6' }}>
        {/* Screen-only header bar */}
        <div className="no-print bg-gray-50 border-b border-gray-200 px-6 py-4 mb-8 rounded-xl flex items-center justify-between" style={{ maxWidth: '52rem', margin: '0 auto 2rem' }}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-gray-800">PDF Export Preview</p>
              <p className="text-xs text-gray-500">Print dialog should open automatically. If not, click the button.</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>

        {/* ── Title Page ── */}
        <div className="text-center mb-4" style={{ paddingTop: '2.5in', paddingBottom: '1in' }}>
          <h1 style={{ fontSize: '22pt', fontWeight: 800, lineHeight: 1.2, marginBottom: '12pt', color: '#0f172a' }}>
            Why Renewable Energy Is Harder<br />Than "Just Add Solar"
          </h1>
          <p style={{ fontSize: '12pt', color: '#64748b', fontWeight: 500, marginBottom: '6pt' }}>
            A Systems-Level, Engineering-First Guide for Non-Experts
          </p>
          <div style={{ width: '60pt', height: '2pt', background: '#3b82f6', margin: '18pt auto', borderRadius: '1pt' }} />
          <p style={{ fontSize: '10pt', color: '#94a3b8', marginBottom: '4pt' }}>Presenter Notes & Narration Script</p>
          <p style={{ fontSize: '10pt', color: '#94a3b8' }}>Jason Shaw</p>
        </div>

        {/* ── Slides ── */}
        {slides.slice(1).map((slide, idx) => {
          const narration = narrations[slide.id]
          return (
            <div key={slide.id} className={idx > 0 ? 'print-page-break' : ''} style={{ marginBottom: '36pt' }}>
              {/* Slide header */}
              <div className="print-avoid-break" style={{ marginBottom: '14pt' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10pt', marginBottom: '6pt' }}>
                  <span style={{ fontSize: '9pt', fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace', background: '#eff6ff', padding: '2pt 6pt', borderRadius: '4pt', border: '1px solid #dbeafe' }}>
                    {String(slide.id).padStart(2, '0')}
                  </span>
                  <h2 style={{ fontSize: '15pt', fontWeight: 800, color: '#0f172a', margin: 0 }}>{slide.title}</h2>
                </div>
                <div style={{ height: '1.5pt', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', borderRadius: '1pt', marginBottom: '10pt' }} />
              </div>

              {/* Hero statement */}
              <p className="print-avoid-break" style={{ fontSize: '11pt', fontWeight: 600, color: '#334155', marginBottom: '10pt', paddingLeft: '10pt', borderLeft: '3pt solid #3b82f6' }}>
                {slide.hero}
              </p>

              {/* Bullets */}
              <div className="print-avoid-break" style={{ marginBottom: '14pt' }}>
                <ul style={{ paddingLeft: '18pt', margin: 0 }}>
                  {slide.bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: '10.5pt', color: '#475569', marginBottom: '4pt' }}>{b}</li>
                  ))}
                </ul>
              </div>

              {/* Go Deeper content */}
              {slide.deeper.length > 0 && (
                <div className="print-avoid-break" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6pt', padding: '10pt 14pt', marginBottom: '14pt' }}>
                  <p style={{ fontSize: '8pt', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: '6pt' }}>Technical Detail</p>
                  {slide.deeper.map((d, i) => (
                    <p key={i} style={{ fontSize: '10pt', color: '#475569', marginBottom: '4pt' }}>
                      • {d.text}
                      {d.katex && <code style={{ fontSize: '9pt', background: '#f1f5f9', padding: '1pt 4pt', borderRadius: '3pt', marginLeft: '4pt', fontFamily: 'monospace', color: '#6366f1' }}>{d.katex}</code>}
                    </p>
                  ))}
                </div>
              )}

              {/* Speaker Notes */}
              {slide.notes && (
                <div className="print-avoid-break" style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '6pt', padding: '10pt 14pt', marginBottom: '14pt' }}>
                  <p style={{ fontSize: '8pt', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: '4pt' }}>Speaker Notes</p>
                  <p style={{ fontSize: '10pt', color: '#78350f', lineHeight: 1.55 }}>{slide.notes}</p>
                </div>
              )}

              {/* Narration Script */}
              {narration && (
                <div className="print-avoid-break" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6pt', padding: '10pt 14pt' }}>
                  <p style={{ fontSize: '8pt', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: '4pt' }}>Narration Script</p>
                  <p style={{ fontSize: '10pt', color: '#14532d', lineHeight: 1.55, fontStyle: 'italic' }}>
                    {narration.segments.map((s) => s.text).join(' ')}
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {/* ── References ── */}
        <div className="print-page-break">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', marginBottom: '12pt' }}>
            <BookOpen className="w-4 h-4" style={{ color: '#3b82f6' }} />
            <h2 style={{ fontSize: '15pt', fontWeight: 800, color: '#0f172a', margin: 0 }}>References</h2>
          </div>
          <div style={{ height: '1.5pt', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', borderRadius: '1pt', marginBottom: '14pt' }} />

          <ol style={{ paddingLeft: '18pt', margin: 0 }}>
            {references.map((ref) => (
              <li key={ref.id} className="print-avoid-break" style={{ fontSize: '10pt', color: '#475569', marginBottom: '8pt' }}>
                {ref.citation}
                <br />
                <span style={{ fontSize: '9pt', color: '#3b82f6', wordBreak: 'break-all' }}>{ref.url}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '36pt', borderTop: '1pt solid #e2e8f0', paddingTop: '10pt', textAlign: 'center' }}>
          <p style={{ fontSize: '8pt', color: '#94a3b8', margin: 0 }}>
            All visualizations are original SVG graphics created programmatically for this presentation.
          </p>
        </div>
      </div>
    </>
  )
}
