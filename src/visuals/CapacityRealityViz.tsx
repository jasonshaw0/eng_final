import AnimationControls, { useAnimationTimer } from '../components/AnimationControls'

interface Props { showControls?: boolean }

export default function CapacityRealityViz({ showControls = true }: Props) {
  const CYCLE = 8
  const { elapsed, paused, setPaused, speed, setSpeed } = useAnimationTimer(CYCLE)

  const base = 0.25
  const cloud = 0.15 * Math.sin(elapsed * 0.7) * Math.sin(elapsed * 1.3)
  const wind = 0.08 * Math.cos(elapsed * 2.1)
  const gust = 0.05 * Math.sin(elapsed * 3.7)
  const factor = Math.max(0.05, Math.min(0.55, base + cloud + wind + gust))

  const w = 420, h = 340, barW = 100, gap = 80, maxH = 210, baseY = 280
  const actualH = maxH * factor
  const pct = Math.round(factor * 100)
  const color = pct > 35 ? '#059669' : pct > 20 ? '#d97706' : '#e11d48'
  const weather = pct > 35 ? 'Clear Sky' : pct > 20 ? 'Partly Cloudy' : 'Overcast'
  const leftX = w / 2 - barW - gap / 2
  const rightX = w / 2 + gap / 2

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-xs leading-relaxed">
        A 100 MW solar farm rarely produces 100 MW — weather and angle of sunlight cause the <strong className="text-text-secondary">actual output to fluctuate</strong> throughout the day.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm">
        {/* Weather status */}
        <text x={w / 2} y={30} textAnchor="middle" fill="#475569" fontSize="14" fontWeight="700">{weather}</text>

        {/* Nameplate bar — full, static */}
        <rect x={leftX} y={baseY - maxH} width={barW} height={maxH} rx="10" fill="#2563eb" opacity="0.08" />
        <rect x={leftX} y={baseY - maxH} width={barW} height={maxH} rx="10" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.4" />
        <text x={leftX + barW / 2} y={baseY - maxH - 14} textAnchor="middle" fill="#2563eb" fontSize="16" fontWeight="800">100 MW</text>
        <text x={leftX + barW / 2} y={baseY + 26} textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">Nameplate</text>

        {/* Actual bar — changes with factor, NO CSS transition so RAF values render directly */}
        <rect x={rightX} y={baseY - actualH} width={barW} height={Math.max(actualH, 2)} rx="10" fill={color} opacity="0.15" />
        <rect x={rightX} y={baseY - actualH} width={barW} height={Math.max(actualH, 2)} rx="10" fill="none" stroke={color} strokeWidth="2" />
        <text x={rightX + barW / 2} y={baseY - actualH - 14} textAnchor="middle" fill={color} fontSize="16" fontWeight="800">{pct} MW</text>
        <text x={rightX + barW / 2} y={baseY + 26} textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">Actual</text>

        {/* Percentage Gap indicator */}
        <text x={w / 2} y={baseY + 52} textAnchor="middle" fill={color} fontSize="12" fontWeight="700">
          Capacity Factor: {pct}%
        </text>

        {/* Baseline */}
        <line x1={40} y1={baseY} x2={w - 40} y2={baseY} stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>
      <AnimationControls cycleDuration={CYCLE} elapsed={elapsed} onPauseChange={setPaused} onSpeedChange={setSpeed} paused={paused} speed={speed} visible={showControls} />
    </div>
  )
}
