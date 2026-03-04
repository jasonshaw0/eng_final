import { useAnimationTimer } from '../components/useAnimationTimer'
import type { VisualFocusProps, VisualRuntimeProps } from './types'

interface Props extends VisualFocusProps, VisualRuntimeProps { }

function asNumber(value: number | string | boolean | undefined, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

function cloudPath(x: number, y: number, scale = 1): string {
  return `M ${x} ${y}
    c ${18 * scale} ${-22 * scale}, ${56 * scale} ${-20 * scale}, ${66 * scale} ${2 * scale}
    c ${22 * scale} ${-5 * scale}, ${42 * scale} ${12 * scale}, ${36 * scale} ${30 * scale}
    h ${-112 * scale}
    c ${-19 * scale} ${-2 * scale}, ${-27 * scale} ${-17 * scale}, ${-18 * scale} ${-32 * scale} z`
}

export default function CapacityRealityViz({
  focusTargetId,
  focusEffect,
  timelineMs = 0,
  keyframeState = {},
  autoplayActive = false,
}: Props) {
  const CYCLE = 10
  const { elapsed } = useAnimationTimer(CYCLE)

  const weatherProgress = autoplayActive
    ? Math.max(0, Math.min(1, asNumber(keyframeState['capacity.weatherProgress'], timelineMs / 18000)))
    : (elapsed % CYCLE) / CYCLE
  const cloudsLevel = autoplayActive
    ? Math.max(0, Math.min(1, asNumber(keyframeState['capacity.cloudDensity'], weatherProgress)))
    : 0.4 + 0.45 * Math.sin(elapsed * 0.85) ** 2
  const sunlight = 1 - cloudsLevel * 0.8
  const factor = Math.max(0.08, Math.min(0.55, 0.18 + sunlight * 0.32))

  const w = 440
  const h = 340
  const barW = 96
  const gap = 82
  const maxH = 210
  const baseY = 280
  const actualH = maxH * factor
  const pct = Math.round(factor * 100)
  const color = pct > 35 ? '#059669' : pct > 20 ? '#d97706' : '#e11d48'
  const weather = pct > 35 ? 'Clear Sky' : pct > 20 ? 'Partly Cloudy' : 'Overcast'
  const leftX = w / 2 - barW - gap / 2
  const rightX = w / 2 + gap / 2
  const focusOpacity = focusEffect === 'glow' ? 0.25 : 0.15

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-xs leading-relaxed">
        A 100 MW label is a peak rating. Real output changes with <strong className="text-text-secondary">cloud cover and sunlight</strong>.
      </p>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="100%" stopColor="#7dacffff" stopOpacity={0} />
          </linearGradient>
        </defs>

        <rect x="12" y="16" width={w - 24} height="86" rx="14" fill="url(#skyGrad)" />
        <circle cx={w - 64} cy="52" r="16" fill="#facc15" opacity={0.25 + sunlight * 0.5} />

        <path d={cloudPath(70 + Math.sin(weatherProgress * 6) * 6, 62, 0.62)} fill="#54585cff" opacity={0.25 + cloudsLevel * 0.52} />
        <path d={cloudPath(184 + Math.cos(weatherProgress * 8) * 7, 52, 0.42)} fill="#e2e8f0" opacity={0.22 + cloudsLevel * 0.62} />
        <path d={cloudPath(300 + Math.sin(weatherProgress * 10) * 5, 66, 0.58)} fill="#cbd5e1" opacity={0.2 + cloudsLevel * 0.55} />

        {focusTargetId === 'cloud-band' && (
          <rect x={20} y={22} width={w - 40} height={74} rx="12" fill="#ffffffff" opacity={focusOpacity} />
        )}

        <text x={w / 2} y={30} textAnchor="middle" fill="#ffffffff" fontSize="13" fontWeight="700">{weather}</text>

        {focusTargetId === 'nameplate' && (
          <rect x={leftX - 10} y={baseY - maxH - 16} width={barW + 20} height={maxH + 32} rx="14" fill="#1d4ed8" opacity={focusOpacity} />
        )}

        <rect x={leftX} y={baseY - maxH} width={barW} height={maxH} rx="10" fill="#1d4ed8" opacity="0.6" />
        <rect x={leftX} y={baseY - maxH} width={barW} height={maxH} rx="10" fill="none" stroke="#1d4ed8" strokeWidth="2" opacity="0.6" />
        <text x={leftX + barW / 2} y={baseY - maxH - 12} textAnchor="middle" fill="#1d4ed8" fontSize="16" fontWeight="800">100 MW</text>
        <text x={leftX + barW / 2} y={baseY + 26} textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">Nameplate</text>

        {focusTargetId === 'output-meter' && (
          <rect x={rightX - 10} y={baseY - maxH - 16} width={barW + 20} height={maxH + 32} rx="14" fill={color} opacity={focusOpacity} />
        )}

        <rect x={rightX} y={baseY - actualH} width={barW} height={Math.max(actualH, 2)} rx="10" fill={color} opacity="0.16" />
        <rect x={rightX} y={baseY - actualH} width={barW} height={Math.max(actualH, 2)} rx="10" fill="none" stroke={color} strokeWidth="2" />
        <text x={rightX + barW / 2} y={baseY - actualH - 12} textAnchor="middle" fill={color} fontSize="16" fontWeight="800">{pct} MW</text>
        <text x={rightX + barW / 2} y={baseY + 26} textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">Actual</text>

        <text x={w / 2} y={baseY + 52} textAnchor="middle" fill={color} fontSize="12" fontWeight="700">
          Capacity Factor: {pct}%
        </text>
        <line x1={36} y1={baseY} x2={w - 36} y2={baseY} stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>

    </div>
  )
}
