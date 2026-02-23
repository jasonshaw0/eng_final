import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

interface Node { id: string; x: number; y: number; label: string; type: 'gen' | 'load' | 'junction' }
interface Link { from: string; to: string; capacity: number }

const nodes: Node[] = [
  { id: 'wind', x: 70, y: 70, label: 'Wind Farm', type: 'gen' },
  { id: 'solar', x: 70, y: 220, label: 'Solar Farm', type: 'gen' },
  { id: 'hub1', x: 220, y: 140, label: 'Substation A', type: 'junction' },
  { id: 'hub2', x: 370, y: 140, label: 'Substation B', type: 'junction' },
  { id: 'city', x: 510, y: 70, label: 'City', type: 'load' },
  { id: 'suburb', x: 510, y: 220, label: 'Suburb', type: 'load' },
]
const links: Link[] = [
  { from: 'wind', to: 'hub1', capacity: 100 },
  { from: 'solar', to: 'hub1', capacity: 80 },
  { from: 'hub1', to: 'hub2', capacity: 60 },
  { from: 'hub2', to: 'city', capacity: 50 },
  { from: 'hub2', to: 'suburb', capacity: 40 },
]

interface VizProps { showControls?: boolean }

export default function TransmissionCongestionViz({ showControls = true }: VizProps) {
  const CYCLE = 10
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)
  const pulseOffset = (elapsed * 60) % 200
  let flowPhase = 0
  const cycle = elapsed % 10
  if (cycle < 3) flowPhase = 0; else if (cycle < 6) flowPhase = 1; else flowPhase = 2

  const w = 590, h = 310
  const getNode = (id: string) => nodes.find((n) => n.id === id)!
  const flowMult = [0.4, 0.75, 1.1][flowPhase]
  const getLinkColor = (link: Link) => { const u = flowMult * (link.capacity / 100); return u > 0.9 ? '#e11d48' : u > 0.65 ? '#d97706' : '#059669' }
  const getLinkWidth = (link: Link) => 2 + flowMult * (link.capacity / 100) * 3.5
  const statusLabels = ['Normal Flow', 'High Demand', 'Congested!']
  const statusColors = ['#059669', '#d97706', '#e11d48']

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        Renewable energy is often generated <strong className="text-text-secondary">far from cities</strong>. Transmission lines become bottlenecks when demand surges.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        <defs>
          <pattern id="pulse" x={pulseOffset} y="0" width="20" height="4" patternUnits="userSpaceOnUse">
            <rect width="10" height="4" fill="#0f172a" opacity="0.12" />
          </pattern>
        </defs>
        {links.map((link) => {
          const from = getNode(link.from), to = getNode(link.to), color = getLinkColor(link), width = getLinkWidth(link)
          const isCongested = flowMult * (link.capacity / 100) > 0.9
          return (
            <g key={`${link.from}-${link.to}`}>
              {isCongested && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#e11d48" strokeWidth={width + 8} opacity="0.06" />}
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={width} strokeLinecap="round" opacity="0.7" />
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="url(#pulse)" strokeWidth={width - 0.5} opacity="0.2" />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 12} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{Math.round(flowMult * link.capacity)}%</text>
            </g>
          )
        })}
        {nodes.map((node) => {
          const isGen = node.type === 'gen', isLoad = node.type === 'load'
          const radius = node.type === 'junction' ? 14 : 22
          const fill = isGen ? '#059669' : isLoad ? '#2563eb' : '#94a3b8'
          return (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={radius + 5} fill={fill} opacity="0.06" />
              <circle cx={node.x} cy={node.y} r={radius} fill="white" stroke={fill} strokeWidth="2.5" />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={fill}>{isGen ? (node.id === 'wind' ? 'W' : 'S') : isLoad ? 'L' : 'T'}</text>
              <text x={node.x} y={node.y + radius + 18} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">{node.label}</text>
            </g>
          )
        })}
        <rect x={w / 2 - 80} y={h - 40} width="160" height="28" rx="14" fill="white" stroke={statusColors[flowPhase]} strokeWidth="2" />
        <text x={w / 2} y={h - 22} textAnchor="middle" fill={statusColors[flowPhase]} fontSize="12" fontWeight="800">{statusLabels[flowPhase]}</text>
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
