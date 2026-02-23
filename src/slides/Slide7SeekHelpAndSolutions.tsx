import { GitBranch, AlertTriangle, Wrench } from 'lucide-react'
import { slides } from '../content/slides'
import SolutionsPipelineViz from '../visuals/SolutionsPipelineViz'
const slide = slides[7]
interface Props { showAnimControls?: boolean }
export default function Slide7SeekHelpAndSolutions({ showAnimControls = true }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center px-12 lg:px-20 py-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-stretch gap-8">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-2xl border border-border p-8 card-shadow h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan text-sm font-bold font-mono border border-accent-cyan/20">07</span>
              <div><span className="text-xs text-text-muted uppercase tracking-widest font-semibold">Take Action</span><div className="w-12 h-0.5 bg-accent-cyan/30 rounded-full mt-1" /></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary leading-snug">{slide.title}</h2>
            <p className="text-base text-text-secondary leading-relaxed mb-5 font-light">{slide.hero}</p>
            <div className="mb-4 p-5 rounded-xl bg-amber-50 border border-amber-200">
              <h3 className="text-base font-bold text-accent-amber mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                When Should You Seek Expert Help?
              </h3>
              <ul className="space-y-2">
                {['Bills rising or unpredictable', 'Frequent outages or power quality issues', 'Considering solar, storage, or an EV', 'Switching to time-of-use rate plan', 'Running a business with demand charges'].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary"><span className="text-accent-amber font-bold mt-0.5">▸</span> {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <h3 className="text-base font-bold text-accent-emerald mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                What Does the Solution Process Entail?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Energy audit → Load profiling → Rate plan review → Efficiency upgrades first →
                Solar sizing → Storage sizing → EV charging strategy → Backup needs →
                Permits & interconnection → Ongoing maintenance & expectations.
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-border p-6 card-shadow flex-1 flex flex-col min-h-80">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border"><GitBranch className="w-4 h-4 text-accent-cyan" /><span className="text-xs font-bold text-text-muted uppercase tracking-widest">Solution Pipeline</span></div>
            <div className="flex-1 flex items-center justify-center"><SolutionsPipelineViz showControls={showAnimControls} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
