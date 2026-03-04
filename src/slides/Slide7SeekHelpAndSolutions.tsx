import { GitBranch, AlertTriangle, Wrench } from 'lucide-react'
import { slides } from '../content/slides'
import SolutionsPipelineViz from '../visuals/SolutionsPipelineViz'
const slide = slides[7]
interface Props {
  activeFocusTarget?: string | null
  focusEffect?: 'pulse' | 'glow' | null
}
export default function Slide7SeekHelpAndSolutions({
  activeFocusTarget,
  focusEffect,
}: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center px-12 lg:px-20 py-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-stretch gap-8">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-bg-card rounded-2xl border border-border p-8 card-shadow h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan text-sm font-bold font-mono border border-accent-cyan/20">07</span>
              <div><span className="text-xs text-text-muted uppercase tracking-widest font-semibold">Implementation Playbook</span><div className="w-12 h-0.5 bg-accent-cyan/30 rounded-full mt-1" /></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary leading-snug">{slide.title}</h2>
            <p className="text-base text-text-secondary leading-relaxed mb-5 font-light">{slide.hero}</p>

            <div className="mb-4 p-5 rounded-xl bg-gradient-to-r from-accent-amber/14 to-accent-amber/6 border border-accent-amber/30">
              <h3 className="text-base font-bold text-accent-amber mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                When Should You Seek Expert Help?
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Bills rising or hard to explain',
                  'Frequent outages or power quality issues',
                  'Planning solar, battery, or EV charging',
                  'Large equipment changes at home or business',
                  'Considering a new utility rate plan',
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary"><span className="text-accent-amber font-bold mt-0.5">▸</span> {item}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-r from-accent-emerald/14 to-accent-cyan/6 border border-accent-emerald/30">
              <h3 className="text-base font-bold text-accent-emerald mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                What Does the Solution Process Entail?
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  '1. Audit',
                  '2. Load Profile',
                  '3. Efficiency First',
                  '4. Right-size Solar',
                  '5. Storage (if needed)',
                  '6. EV + Rate Plan',
                  '7. Permits + Interconnection',
                  '8. Commissioning',
                  '9. Monitoring',
                ].map((step) => (
                  <span
                    key={step}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-bg-surface border border-border text-text-secondary"
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="bg-bg-card rounded-2xl border border-border p-6 card-shadow flex-1 flex flex-col min-h-80">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border"><GitBranch className="w-4 h-4 text-accent-cyan" /><span className="text-xs font-bold text-text-muted uppercase tracking-widest">Solution Pipeline Map</span></div>
            <div className="flex-1 flex items-center justify-center">
              <SolutionsPipelineViz
                focusTargetId={activeFocusTarget}
                focusEffect={focusEffect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
