import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

interface Props { showControls?: boolean }

export default function DuckCurveViz({ showControls = true }: Props) {
  const CYCLE = 10
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)
  const moreSolar = elapsed >= 5
  const w = 520, h = 300, pad = 50

  const grossLoad = (hour: number) => 22 + 8 * Math.exp(-((hour - 9) ** 2) / 12) + 14 * Math.exp(-((hour - 19) ** 2) / 8) - 5 * Math.exp(-((hour - 3) ** 2) / 15)
  const solarGen = (hour: number) => (hour < 5 || hour > 20) ? 0 : (moreSolar ? 22 : 12) * Math.exp(-((hour - 12.5) ** 2) / 12)
  const netLoad = (hour: number) => grossLoad(hour) - solarGen(hour)
  const toX = (hour: number) => pad + (hour / 24) * (w - 2 * pad)
  const toY = (val: number) => h - pad - ((val - 5) / 40) * (h - 2 * pad)
  const makePath = (fn: (h: number) => number) => Array.from({ length: 120 }, (_, i) => { const hour = (i / 119) * 24; return `${i === 0 ? 'M' : 'L'}${toX(hour).toFixed(1)},${toY(fn(hour)).toFixed(1)}` }).join(' ')

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        As solar grows, <strong className="text-text-secondary">net load dips midday then ramps sharply at sunset</strong> — the famous "duck curve" that stresses grid operators.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        <text x={w / 2} y={22} textAnchor="middle" fill="#475569" fontSize="13" fontWeight="700">
          {moreSolar ? 'High Solar Penetration' : 'Moderate Solar'}
        </text>
        {[0, 6, 12, 18, 24].map((hr) => (
          <g key={hr}>
            <line x1={toX(hr)} y1={pad + 10} x2={toX(hr)} y2={h - pad} stroke="#e2e8f0" strokeWidth="1" />
            <text x={toX(hr)} y={h - 16} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="var(--font-mono)">{hr === 0 ? '12a' : hr === 6 ? '6a' : hr === 12 ? '12p' : hr === 18 ? '6p' : '12a'}</text>
          </g>
        ))}
        <path d={makePath(grossLoad)} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 3" />
        <path d={makePath(netLoad)} fill="none" stroke={moreSolar ? '#d97706' : '#0891b2'} strokeWidth="3" strokeLinecap="round" />
        <path d={`${makePath(solarGen)} L${toX(24).toFixed(1)},${toY(0).toFixed(1)} L${toX(0).toFixed(1)},${toY(0).toFixed(1)} Z`} fill="#d97706" opacity="0.07" />
        {moreSolar && (
          <g>
            <text x={toX(12)} y={toY(netLoad(12)) - 14} textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="800">belly</text>
            <text x={toX(19)} y={toY(netLoad(19)) - 14} textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="800">neck</text>
          </g>
        )}
        <g transform={`translate(${pad + 5}, ${pad + 14})`}>
          <rect x="-6" y="-10" width="140" height="50" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="6" y1="4" x2="26" y2="4" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="32" y="8" fill="#475569" fontSize="11" fontWeight="500">Gross Load</text>
          <line x1="6" y1="26" x2="26" y2="26" stroke={moreSolar ? '#d97706' : '#0891b2'} strokeWidth="2.5" />
          <text x="32" y="30" fill="#475569" fontSize="11" fontWeight="500">Net Load</text>
        </g>
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
