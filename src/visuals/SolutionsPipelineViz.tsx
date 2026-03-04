import { useAnimationTimer } from '../components/useAnimationTimer'
import type { VisualFocusProps } from './types'

const steps = [
  { label: 'Energy Audit', icon: 'EA', desc: 'Assess current usage and failure points.', color: '#0ea5e9' },
  { label: 'Load Profile', icon: 'LP', desc: 'Map hour-by-hour usage and peaks.', color: '#3b82f6' },
  { label: 'Rate Review', icon: 'RR', desc: 'Match tariffs to operation patterns.', color: '#6366f1' },
  { label: 'Efficiency', icon: 'EF', desc: 'Lower base demand before sizing assets.', color: '#22c55e' },
  { label: 'Solar Size', icon: 'SS', desc: 'Right-size PV against site constraints.', color: '#f59e0b' },
  { label: 'Storage', icon: 'ST', desc: 'Add duration for evening and outage risk.', color: '#fb923c' },
  { label: 'EV Plan', icon: 'EV', desc: 'Coordinate charging strategy and panel limits.', color: '#ec4899' },
  { label: 'Permits', icon: 'PM', desc: 'Handle utility and local approvals.', color: '#8b5cf6' },
  { label: 'Maintain', icon: 'MN', desc: 'Monitor, tune, and verify savings.', color: '#14b8a6' },
]

type Props = VisualFocusProps

const nodePositions = [
  { x: 198, y: 96 },
  { x: 298, y: 96 },
  { x: 398, y: 96 },
  { x: 398, y: 166 },
  { x: 298, y: 166 },
  { x: 198, y: 166 },
  { x: 198, y: 236 },
  { x: 298, y: 236 },
  { x: 398, y: 236 },
]

function buildPolyline(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
}

export default function SolutionsPipelineViz({ focusTargetId, focusEffect }: Props) {
  const CYCLE = 14
  const { elapsed } = useAnimationTimer(CYCLE)
  const progress = elapsed - 1
  const activeStep = progress < 0 ? -1 : Math.min(Math.floor(progress), steps.length - 1)
  const segmentProgress = progress < 0 ? 0 : progress - Math.floor(progress)

  const nextIndex = Math.min(activeStep + 1, nodePositions.length - 1)
  const currentPos = activeStep < 0
    ? nodePositions[0]
    : activeStep >= nodePositions.length - 1
      ? nodePositions[nodePositions.length - 1]
      : {
        x: nodePositions[activeStep].x + (nodePositions[nextIndex].x - nodePositions[activeStep].x) * segmentProgress,
        y: nodePositions[activeStep].y + (nodePositions[nextIndex].y - nodePositions[activeStep].y) * segmentProgress,
      }

  const activePathPoints = activeStep < 0
    ? [nodePositions[0]]
    : activeStep >= nodePositions.length - 1
      ? nodePositions
      : [...nodePositions.slice(0, activeStep + 1), currentPos]

  const trackPath = buildPolyline(nodePositions)
  const activePath = buildPolyline(activePathPoints)
  const focusOpacity = focusEffect === 'glow' ? 0.25 : 0.16
  const pathwayFocus = focusTargetId === 'pathway'
  const triggerFocus = focusTargetId === 'trigger-signs'
  const outcomesFocus = focusTargetId === 'outcomes'

  const currentLabel = activeStep < 0
    ? 'Starting sequence'
    : `Step ${activeStep + 1}: ${steps[activeStep].label}`
  const currentDescription = activeStep < 0 ? 'Queueing first action...' : steps[activeStep].desc

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        Slide 7 now shows a real workflow map: <strong className="text-text-secondary">warning signs enter a 9-step engineering sequence that drives measurable outcomes</strong>.
      </p>
      <svg viewBox="0 0 620 320" className="w-full max-w-xl">
        <defs>
          <linearGradient id="pipeline-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#081327" />
            <stop offset="52%" stopColor="#10233f" />
            <stop offset="100%" stopColor="#0b162d" />
          </linearGradient>
          <pattern id="pipeline-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="0.8" />
          </pattern>
          <filter id="pipeline-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="6" y="6" width="608" height="308" rx="20" fill="url(#pipeline-bg)" />
        <rect x="6" y="6" width="608" height="308" rx="20" fill="url(#pipeline-grid)" opacity="0.3" />

        {triggerFocus && (
          <rect x="20" y="76" width="140" height="174" rx="14" fill="#f59e0b" opacity={focusOpacity} />
        )}
        {pathwayFocus && (
          <rect x="168" y="66" width="260" height="184" rx="14" fill="#0ea5e9" opacity={focusOpacity} />
        )}
        {outcomesFocus && (
          <rect x="454" y="76" width="146" height="174" rx="14" fill="#10b981" opacity={focusOpacity} />
        )}

        <g transform="translate(24 80)">
          <rect x="0" y="0" width="132" height="166" rx="12" fill="rgba(15,23,42,0.64)" stroke="rgba(148,163,184,0.38)" />
          <text x="12" y="22" fill="#fbbf24" fontSize="11" fontWeight="800">TRIGGER SIGNS</text>
          {[
            'Bills jump',
            'Outages repeat',
            'Major upgrade',
            'Tariff confusion',
          ].map((item, idx) => (
            <g key={item} transform={`translate(12 ${44 + idx * 28})`}>
              <circle cx="0" cy="-4" r="4" fill="#f59e0b" />
              <text x="10" y="0" fill="#cbd5e1" fontSize="10.5" fontWeight="600">{item}</text>
            </g>
          ))}
        </g>

        <path d={trackPath} fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d={activePath} fill="none" stroke="#38bdf8" strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round" filter="url(#pipeline-glow)" />

        {nodePositions.map((node, index) => {
          const isReached = index <= activeStep
          const isCurrent = index === activeStep
          const nodeColor = steps[index].color
          return (
            <g key={steps[index].icon}>
              {isCurrent && <circle cx={node.x} cy={node.y} r="20" fill={nodeColor} opacity="0.2" />}
              <circle
                cx={node.x}
                cy={node.y}
                r="14"
                fill={isReached ? 'rgba(15,23,42,0.95)' : 'rgba(30,41,59,0.6)'}
                stroke={isReached ? nodeColor : 'rgba(148,163,184,0.6)'}
                strokeWidth={isCurrent ? 2.8 : 1.8}
              />
              <text
                x={node.x}
                y={node.y + 3.5}
                textAnchor="middle"
                fill={isReached ? nodeColor : '#94a3b8'}
                fontSize="8.5"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                {steps[index].icon}
              </text>
            </g>
          )
        })}

        <circle cx={currentPos.x} cy={currentPos.y} r="5.5" fill="#7dd3fc" filter="url(#pipeline-glow)" />

        <g transform="translate(458 80)">
          <rect x="0" y="0" width="138" height="166" rx="12" fill="rgba(15,23,42,0.64)" stroke="rgba(148,163,184,0.38)" />
          <text x="12" y="22" fill="#34d399" fontSize="11" fontWeight="800">EXPECTED OUTCOMES</text>

          {[
            { label: 'Bill Stability', value: 0.82 },
            { label: 'Reliability', value: 0.9 },
            { label: 'Control', value: 0.76 },
          ].map((metric, idx) => (
            <g key={metric.label} transform={`translate(12 ${52 + idx * 36})`}>
              <text x="0" y="0" fill="#cbd5e1" fontSize="10" fontWeight="600">{metric.label}</text>
              <rect x="0" y="8" width="114" height="8" rx="4" fill="rgba(30,41,59,0.9)" />
              <rect x="0" y="8" width={114 * metric.value} height="8" rx="4" fill="#10b981" />
            </g>
          ))}
        </g>

        <g transform="translate(178 270)">
          <rect x="0" y="0" width="244" height="34" rx="10" fill="rgba(15,23,42,0.74)" stroke="rgba(148,163,184,0.34)" />
          <text x="12" y="13" fill="#93c5fd" fontSize="11" fontWeight="700">{currentLabel}</text>
          <text x="12" y="27" fill="#cbd5e1" fontSize="10">{currentDescription}</text>
        </g>
      </svg>
    </div>
  )
}
