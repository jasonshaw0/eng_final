import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

const steps = [
  { label: 'Energy Audit', icon: 'EA', desc: 'Assess current usage', color: '#0891b2' },
  { label: 'Load Profile', icon: 'LP', desc: 'Map when & how much', color: '#2563eb' },
  { label: 'Rate Review', icon: 'RR', desc: 'Evaluate rate plans', color: '#7c3aed' },
  { label: 'Efficiency', icon: 'EF', desc: 'Reduce waste first', color: '#059669' },
  { label: 'Solar Size', icon: 'SS', desc: 'Right-size panels', color: '#d97706' },
  { label: 'Storage', icon: 'ST', desc: 'Battery if needed', color: '#ea580c' },
  { label: 'EV Plan', icon: 'EV', desc: 'Charging setup', color: '#db2777' },
  { label: 'Permits', icon: 'PM', desc: 'Approval process', color: '#4f46e5' },
  { label: 'Maintain', icon: 'MN', desc: 'Ongoing optimization', color: '#0d9488' },
]

interface Props { showControls?: boolean }

export default function SolutionsPipelineViz({ showControls = true }: Props) {
  const CYCLE = 14
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)
  let activeStep = -1
  if (elapsed >= 1) activeStep = Math.min(Math.floor(elapsed - 1), steps.length - 1)

  const w = 540, h = 310, startX = 35, endX = 505
  const stepW = (endX - startX) / steps.length, centerY = 150

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        Going renewable is a <strong className="text-text-secondary">9-step journey</strong> from audit to ongoing maintenance. Each step builds on the last.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        {/* Track */}
        <line x1={startX + stepW / 2} y1={centerY} x2={endX - stepW / 2} y2={centerY} stroke="#e2e8f0" strokeWidth="3" />
        {activeStep >= 0 && (
          <line x1={startX + stepW / 2} y1={centerY} x2={startX + stepW / 2 + stepW * activeStep} y2={centerY} stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
        )}
        {steps.map((step, i) => {
          const cx = startX + stepW / 2 + i * stepW, isActive = i <= activeStep, isCurrent = i === activeStep
          return (
            <g key={i}>
              {isCurrent && <circle cx={cx} cy={centerY} r="26" fill={step.color} opacity="0.06" />}
              <circle cx={cx} cy={centerY} r="20" fill={isActive ? 'white' : '#f8fafc'} stroke={isActive ? step.color : '#e2e8f0'} strokeWidth={isCurrent ? 3 : 1.5} />
              <text x={cx} y={centerY + 5} textAnchor="middle" fontSize="10" fontWeight="800" fill={isActive ? step.color : '#94a3b8'} fontFamily="var(--font-mono)">{step.icon}</text>
              <text x={cx} y={i % 2 === 0 ? centerY - 30 : centerY + 44} textAnchor="middle" fill={isActive ? step.color : '#94a3b8'} fontSize="9" fontWeight={isCurrent ? '800' : '500'}>{step.label}</text>
              {isCurrent && <text x={cx} y={i % 2 === 0 ? centerY - 44 : centerY + 58} textAnchor="middle" fill="#64748b" fontSize="8">{step.desc}</text>}
            </g>
          )
        })}
        <text x={w / 2} y={h - 20} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
          {activeStep >= 0 ? `Step ${activeStep + 1} of ${steps.length}: ${steps[activeStep].label}` : 'Starting pipeline...'}
        </text>
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
