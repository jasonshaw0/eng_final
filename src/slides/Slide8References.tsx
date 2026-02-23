import { BookOpen, ExternalLink, Printer } from 'lucide-react'
import { references } from '../content/slides'
interface Props { showAnimControls?: boolean }
export default function Slide8References(_props: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-12 lg:px-20 py-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl border border-border p-8 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
              <BookOpen className="w-4 h-4 text-accent-blue" />
            </div>
            <div><span className="text-xs text-text-muted uppercase tracking-widest font-semibold">References</span><div className="w-12 h-0.5 bg-accent-blue/30 rounded-full mt-1" /></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary">References & Credits</h2>
          <div className="space-y-3 mb-8">
            {references.map((ref) => (
              <div key={ref.id} className="flex gap-3 p-4 rounded-xl bg-bg-surface border border-border hover:border-border-hover transition-colors">
                <span className="w-7 h-7 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-bold font-mono border border-accent-blue/20 shrink-0 mt-0.5">{ref.id}</span>
                <div className="min-w-0">
                  <p className="text-sm text-text-secondary leading-relaxed">{ref.citation}</p>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-cyan hover:underline break-all mt-1 font-medium inline-flex items-center gap-1">
                    {ref.url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-xl bg-bg-surface border border-border">
            <h3 className="text-sm font-bold text-text-primary mb-2 uppercase tracking-wider">Credits</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              All visualizations — supply/demand animation, frequency response gauge, duck curve morph, capacity meter,
              storage scale diagram, transmission congestion map, and solutions pipeline — are original SVG graphics
              created programmatically for this presentation. No external chart libraries or stock images were used.
            </p>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => window.open(window.location.origin + window.location.pathname + '#/print', '_blank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-surface border border-border hover:border-border-hover text-text-secondary hover:text-text-primary text-sm font-medium shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print-Friendly Notes View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
