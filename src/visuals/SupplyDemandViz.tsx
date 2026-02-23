import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

interface Props { showControls?: boolean }

export default function SupplyDemandViz({ showControls = true }: Props) {
  const CYCLE = 12
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)
  const time = (elapsed / CYCLE) * 24
  const w = 520, h = 300, pad = 50

  const demandCurve = (t: number) => 55 + 25 * Math.exp(-((t - 8) ** 2) / 8) + 35 * Math.exp(-((t - 18) ** 2) / 6) - 15 * Math.exp(-((t - 3) ** 2) / 10)
  const supplyCurve = (t: number) => demandCurve(t) + 2 * Math.sin(t * 0.8) + 1.5 * Math.cos(t * 1.3)
  const toX = (t: number) => pad + (t / 24) * (w - 2 * pad)
  const toY = (val: number) => h - pad - ((val - 20) / 100) * (h - 2 * pad)
  const makePath = (fn: (t: number) => number) => Array.from({ length: 120 }, (_, i) => { const t = (i / 119) * 24; return `${i === 0 ? 'M' : 'L'}${toX(t).toFixed(1)},${toY(fn(t)).toFixed(1)}` }).join(' ')
  const cursorX = toX(time)
  const gap = supplyCurve(time) - demandCurve(time)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        The grid must <strong className="text-text-secondary">match supply to demand every second</strong>. Watch the gap between the two curves as time sweeps across a 24-hour day.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        {[0, 6, 12, 18, 24].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={pad} x2={toX(t)} y2={h - pad} stroke="#e2e8f0" strokeWidth="1" />
            <text x={toX(t)} y={h - 16} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="var(--font-mono)">{t === 0 ? '12am' : t === 6 ? '6am' : t === 12 ? '12pm' : t === 18 ? '6pm' : '12am'}</text>
          </g>
        ))}
        <path d={makePath(demandCurve)} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
        <path d={makePath(supplyCurve)} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={cursorX} y1={pad} x2={cursorX} y2={h - pad} stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.15" />
        <circle cx={cursorX} cy={toY(demandCurve(time))} r="6" fill="#d97706" stroke="white" strokeWidth="2" />
        <circle cx={cursorX} cy={toY(supplyCurve(time))} r="6" fill="#0891b2" stroke="white" strokeWidth="2" />
        {Math.abs(gap) > 2 && (
          <line x1={cursorX} y1={toY(demandCurve(time))} x2={cursorX} y2={toY(supplyCurve(time))} stroke={gap > 0 ? '#059669' : '#e11d48'} strokeWidth="2.5" opacity="0.5" />
        )}
        <g transform={`translate(${pad + 8}, ${pad + 6})`}>
          <rect x="-6" y="-10" width="140" height="50" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="6" y1="4" x2="28" y2="4" stroke="#0891b2" strokeWidth="2.5" />
          <text x="34" y="8" fill="#475569" fontSize="12" fontWeight="500">Supply</text>
          <line x1="6" y1="26" x2="28" y2="26" stroke="#d97706" strokeWidth="2.5" />
          <text x="34" y="30" fill="#475569" fontSize="12" fontWeight="500">Demand</text>
        </g>
        <text x="16" y={h / 2} textAnchor="middle" fill="#94a3b8" fontSize="12" transform={`rotate(-90, 16, ${h / 2})`}>Power (GW)</text>
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
