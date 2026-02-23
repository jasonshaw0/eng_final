import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

interface Props { showControls?: boolean }

export default function FrequencyResponseViz({ showControls = true }: Props) {
  const CYCLE = 15
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)
  const cycleTime = elapsed * 1000
  let freq = 60.0
  let phase: 'normal' | 'spike' | 'dip' | 'recovery' = 'normal'

  // 0–4s: stable idle with tiny jitter
  if (cycleTime < 4000) {
    freq = 60.0 + 0.003 * Math.sin(elapsed * 6) + 0.002 * Math.cos(elapsed * 11)
    phase = 'normal'
  }
  // 4–5.5s: demand spike causes frequency to drop
  else if (cycleTime < 5500) {
    const t = (cycleTime - 4000) / 1500
    freq = 60.0 - 0.2 * t * t
    phase = 'spike'
  }
  // 5.5–8s: frequency nadir — bottoms out around 59.75 Hz
  else if (cycleTime < 8000) {
    const t = (cycleTime - 5500) / 2500
    freq = 59.8 - 0.05 * Math.exp(-t * 1.5) + 0.02 * Math.sin(t * 8)
    phase = 'dip'
  }
  // 8–12s: governor response slowly restores frequency
  else if (cycleTime < 12000) {
    const t = (cycleTime - 8000) / 4000
    freq = 59.78 + 0.22 * (1 - Math.exp(-t * 2.5))
    phase = 'recovery'
  }
  // 12–15s: back to normal
  else {
    freq = 60.0 + 0.003 * Math.sin(elapsed * 8)
    phase = 'normal'
  }

  const w = 440, h = 320, cx = w / 2, cy = 175, r = 115
  const startAngle = -210, endAngle = 30, freqMin = 59.5, freqMax = 60.5
  const freqToAngle = (f: number) => startAngle + ((f - freqMin) / (freqMax - freqMin)) * (endAngle - startAngle)
  const angle = freqToAngle(freq), rad = (angle * Math.PI) / 180, needleLen = r - 15
  const needleColor = phase === 'normal' ? '#059669' : phase === 'spike' ? '#d97706' : phase === 'dip' ? '#e11d48' : '#2563eb'
  const statusText = phase === 'normal' ? 'Stable' : phase === 'spike' ? 'Demand Spike!' : phase === 'dip' ? 'Frequency Nadir' : 'Recovering...'
  const polarToCart = (a: number, r2: number) => ({ x: cx + r2 * Math.cos((a * Math.PI) / 180), y: cy + r2 * Math.sin((a * Math.PI) / 180) })
  const arcPath = (sA: number, eA: number, radius: number) => { const s = polarToCart(sA, radius), e = polarToCart(eA, radius); return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${eA - sA > 180 ? 1 : 0} 1 ${e.x} ${e.y}` }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-xs leading-relaxed">
        Grid frequency must stay at <strong className="text-text-secondary">exactly 60 Hz</strong>. Watch what happens when a power plant trips offline — frequency dips, then recovers.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm">
        <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
        <path d={arcPath(startAngle, startAngle + 60, r)} fill="none" stroke="#e11d48" strokeWidth="14" strokeLinecap="round" opacity="0.12" />
        <path d={arcPath(startAngle + 60, startAngle + 90, r)} fill="none" stroke="#d97706" strokeWidth="14" strokeLinecap="round" opacity="0.12" />
        <path d={arcPath(startAngle + 90, endAngle - 90, r)} fill="none" stroke="#059669" strokeWidth="14" strokeLinecap="round" opacity="0.15" />
        <path d={arcPath(endAngle - 90, endAngle - 60, r)} fill="none" stroke="#d97706" strokeWidth="14" strokeLinecap="round" opacity="0.12" />
        <path d={arcPath(endAngle - 60, endAngle, r)} fill="none" stroke="#e11d48" strokeWidth="14" strokeLinecap="round" opacity="0.12" />
        {Array.from({ length: 11 }, (_, i) => {
          const f = freqMin + (i / 10) * (freqMax - freqMin), a = freqToAngle(f)
          const inner = polarToCart(a, r - 22), outer = polarToCart(a, r - 8)
          return (
            <g key={i}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#94a3b8" strokeWidth="1.5" />
              {i % 2 === 0 && <text x={polarToCart(a, r - 34).x} y={polarToCart(a, r - 34).y + 3} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="var(--font-mono)">{f.toFixed(1)}</text>}
            </g>
          )
        })}
        <line x1={cx} y1={cy} x2={cx + needleLen * Math.cos(rad)} y2={cy + needleLen * Math.sin(rad)} stroke={needleColor} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="9" fill="white" stroke="#e2e8f0" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="4.5" fill={needleColor} />
        <text x={cx} y={cy + 45} textAnchor="middle" fill={needleColor} fontSize="26" fontWeight="800" fontFamily="var(--font-mono)">{freq.toFixed(3)} Hz</text>
        <text x={cx} y={cy + 68} textAnchor="middle" fill={needleColor} fontSize="14" fontWeight="700">{statusText}</text>
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
