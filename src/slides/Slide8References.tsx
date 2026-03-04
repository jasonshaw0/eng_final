import { BookOpen, ExternalLink, Printer } from 'lucide-react'
import { references, visualCredits } from '../content/slides'
interface Props {
  activeFocusTarget?: string | null
}
export default function Slide8References({ activeFocusTarget }: Props) {
  const highlightReferences = activeFocusTarget === 'references'
  const highlightCredits = activeFocusTarget === 'credits'
  const highlightThanks = activeFocusTarget === 'thanks'

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-12 lg:px-20 py-8">
      <div className="max-w-4xl w-full">
        <div
          className={`bg-bg-card rounded-2xl border p-8 card-shadow transition-all duration-500 ${
            highlightReferences ? 'border-accent-blue shadow-lg shadow-accent-blue/10' : 'border-border'
          }`}
          id="references"
        >
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
          <div
            className={`p-5 rounded-xl bg-bg-surface border transition-all duration-500 ${
              highlightCredits ? 'border-accent-emerald shadow-md shadow-accent-emerald/10' : 'border-border'
            }`}
            id="credits"
          >
            <h3 className="text-sm font-bold text-text-primary mb-2 uppercase tracking-wider">Credits</h3>
            <div className="space-y-3">
              {visualCredits.map((credit) => (
                <div key={credit.id} className="rounded-lg border border-border/80 bg-bg-card p-3">
                  <p className="text-sm font-semibold text-text-secondary leading-snug">{credit.asset}</p>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">Source: {credit.source}</p>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">{credit.method} Author: {credit.author}.</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 text-center" id="thanks">
            <button
              onClick={() => window.open(window.location.origin + window.location.pathname + '#/print', '_blank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-surface border border-border hover:border-border-hover text-text-secondary hover:text-text-primary text-sm font-medium shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print-Friendly Notes View
            </button>
            <p className={`mt-4 text-sm transition-colors duration-500 ${highlightThanks ? 'text-accent-blue font-semibold' : 'text-text-muted'}`}>
              Thank you for listening.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
