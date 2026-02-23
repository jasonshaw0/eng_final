import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

const levels = [
  { label: '4 hours', height: 45, color: '#059669', desc: 'Evening peak' },
  { label: '12 hours', height: 100, color: '#2563eb', desc: 'Overnight' },
  { label: '24 hours', height: 160, color: '#7c3aed', desc: 'Full day' },
  { label: '3 days (72h)', height: 235, color: '#e11d48', desc: 'Weather event' },
]
const costMultipliers = [1, 3, 6, 18]

interface Props { showControls?: boolean }

export default function StorageScaleViz({ showControls = true }: Props) {
  const CYCLE = 12
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)
  let phase = 0
  if (elapsed < 3) phase = 0; else if (elapsed < 6) phase = 1; else if (elapsed < 9) phase = 2; else phase = 3

  const w = 500, h = 350, barX = 95, barW = 100, baseY = 300
  const activeLevel = levels[phase], targetH = activeLevel.height

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        Storing energy for <strong className="text-text-secondary">4 hours is easy; 72 hours is 18× costlier</strong>. Duration is the hidden variable in the storage equation.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md">
        {/* Ghost bars */}
        {levels.map((l, i) => (
          <rect key={i} x={barX} y={baseY - l.height} width={barW} height={l.height} rx="8" fill={l.color} opacity={i <= phase ? 0 : 0.03} stroke={l.color} strokeWidth="0.5" strokeOpacity={0.08} />
        ))}
        {/* Active bar — no CSS transition, driven by state phase */}
        <rect x={barX} y={baseY - targetH} width={barW} height={targetH} rx="8" fill={activeLevel.color} opacity="0.12" />
        <rect x={barX} y={baseY - targetH} width={barW} height={targetH} rx="8" fill="none" stroke={activeLevel.color} strokeWidth="2.5" />
        <text x={barX + barW / 2} y={baseY - targetH - 16} textAnchor="middle" fill={activeLevel.color} fontSize="16" fontWeight="800">{activeLevel.label}</text>
        <text x={barX + barW / 2} y={baseY - targetH / 2 + 5} textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">{activeLevel.desc}</text>
        <text x={barX + barW / 2} y={baseY + 22} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="500">Duration</text>

        {/* Cost bars */}
        <g transform="translate(250, 50)">
          <text x="0" y="0" fill="#475569" fontSize="14" fontWeight="800">Relative Cost</text>
          {levels.map((l, i) => {
            const bw = Math.min(costMultipliers[i] * 8, 150), active = i === phase
            return (
              <g key={i} transform={`translate(0, ${24 + i * 48})`}>
                <text x="0" y="0" fill={active ? l.color : '#94a3b8'} fontSize="12" fontWeight={active ? '700' : '400'}>{l.label}</text>
                <rect x="0" y="10" width={bw} height="14" rx="4" fill={l.color} opacity={active ? 0.3 : 0.06} />
                <text x={bw + 10} y="22" fill={active ? l.color : '#94a3b8'} fontSize="13" fontWeight={active ? '800' : '400'}>{costMultipliers[i]}×</text>
              </g>
            )
          })}
        </g>
        <line x1={barX - 10} y1={baseY} x2={barX + barW + 10} y2={baseY} stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
