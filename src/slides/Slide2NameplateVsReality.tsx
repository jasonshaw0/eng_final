import { BarChart3 } from 'lucide-react'
import { slides } from '../content/slides'
import CapacityRealityViz from '../visuals/CapacityRealityViz'
const slide = slides[2]
interface Props { showAnimControls?: boolean }
export default function Slide2NameplateVsReality({ showAnimControls = true }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center px-12 lg:px-20 py-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-stretch gap-8">
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-2xl border border-border p-8 card-shadow h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue text-sm font-bold font-mono border border-accent-blue/20">02</span>
              <div><span className="text-xs text-text-muted uppercase tracking-widest font-semibold">The Misconception</span><div className="w-12 h-0.5 bg-accent-blue/30 rounded-full mt-1" /></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary leading-snug">{slide.title}</h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-6 font-light">{slide.hero}</p>
            <div className="space-y-3 bg-bg-surface rounded-xl p-5 border border-border">
              {slide.bullets.map((b, i) => (<div key={i} className="flex gap-3 items-start"><span className="w-2 h-2 rounded-full bg-accent-blue mt-2.5 shrink-0" /><span className="text-base text-text-secondary leading-relaxed">{b}</span></div>))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-2xl border border-border p-6 card-shadow flex-1 flex flex-col min-h-80">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border"><BarChart3 className="w-4 h-4 text-accent-blue" /><span className="text-xs font-bold text-text-muted uppercase tracking-widest">Capacity Meter</span></div>
            <div className="flex-1 flex items-center justify-center"><CapacityRealityViz showControls={showAnimControls} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
