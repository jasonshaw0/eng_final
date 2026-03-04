import { useAnimationTimer } from '../components/useAnimationTimer'
import type { VisualFocusProps, VisualRuntimeProps } from './types'

interface Props extends VisualFocusProps, VisualRuntimeProps {}

function asNumber(value: number | string | boolean | undefined, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

export default function SupplyDemandViz({
  focusTargetId,
  focusEffect,
  timelineMs = 0,
  keyframeState = {},
  autoplayActive = false,
}: Props) {
  const CYCLE = 14
  const { elapsed } = useAnimationTimer(CYCLE)

  const manualTime = (elapsed / CYCLE) * 24
  const dayProgress = autoplayActive
    ? Math.max(0, Math.min(1, asNumber(keyframeState['balance.dayProgress'], timelineMs / 20000)))
    : manualTime / 24
  const time = dayProgress * 24

  const mismatchGlow = autoplayActive
    ? asNumber(keyframeState['balance.mismatchGlow'], 0)
    : 0
  const reserveGlow = autoplayActive
    ? asNumber(keyframeState['balance.reserveGlow'], 0)
    : 0

  const w = 520
  const h = 300
  const pad = 50

  const demandCurve = (t: number) => 55 + 25 * Math.exp(-((t - 8) ** 2) / 8) + 35 * Math.exp(-((t - 18) ** 2) / 6) - 15 * Math.exp(-((t - 3) ** 2) / 10)
  const supplyCurve = (t: number) => demandCurve(t) + 2 * Math.sin(t * 0.8) + 1.5 * Math.cos(t * 1.3)
  const toX = (t: number) => pad + (t / 24) * (w - 2 * pad)
  const toY = (val: number) => h - pad - ((val - 20) / 100) * (h - 2 * pad)
  const makePath = (fn: (t: number) => number) =>
    Array.from({ length: 120 }, (_, i) => {
      const t = (i / 119) * 24
      return `${i === 0 ? 'M' : 'L'}${toX(t).toFixed(1)},${toY(fn(t)).toFixed(1)}`
    }).join(' ')

  const cursorX = toX(time)
  const gap = supplyCurve(time) - demandCurve(time)
  const focusOpacity = focusEffect === 'glow' ? 0.25 : 0.15
  const focusDemand = focusTargetId === 'demand-line'
  const focusAlert = focusTargetId === 'frequency-alert'
  const focusReserve = focusTargetId === 'reserve-plant'

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        The grid must <strong className="text-text-secondary">match supply to demand every second</strong>. Watch one full day unfold.
      </p>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        {(focusDemand || mismatchGlow > 0.1) && (
          <rect
            x={pad + 4}
            y={pad + 18}
            width={w - pad * 2 - 10}
            height={h - pad * 2 - 22}
            rx="16"
            fill="#0891b2"
            opacity={Math.max(focusDemand ? focusOpacity : 0, mismatchGlow * 0.12)}
          />
        )}

        {[0, 6, 12, 18, 24].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={pad} x2={toX(t)} y2={h - pad} stroke="#e2e8f0" strokeWidth="1" />
            <text x={toX(t)} y={h - 16} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="var(--font-mono)">
              {t === 0 ? '12am' : t === 6 ? '6am' : t === 12 ? '12pm' : t === 18 ? '6pm' : '12am'}
            </text>
          </g>
        ))}

        <path d={makePath(demandCurve)} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
        <path d={makePath(supplyCurve)} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />

        <line x1={cursorX} y1={pad} x2={cursorX} y2={h - pad} stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.18" />
        <circle cx={cursorX} cy={toY(demandCurve(time))} r="6" fill="#d97706" stroke="white" strokeWidth="2" />
        <circle cx={cursorX} cy={toY(supplyCurve(time))} r="6" fill="#0891b2" stroke="white" strokeWidth="2" />

        {Math.abs(gap) > 1.5 && (
          <line
            x1={cursorX}
            y1={toY(demandCurve(time))}
            x2={cursorX}
            y2={toY(supplyCurve(time))}
            stroke={gap > 0 ? '#059669' : '#e11d48'}
            strokeWidth="2.5"
            opacity={0.6 + mismatchGlow * 0.2}
          />
        )}

        {(focusAlert || mismatchGlow > 0.1) && (
          <rect
            x={cursorX - 12}
            y={pad + 4}
            width={24}
            height={h - pad * 2 - 8}
            rx="10"
            fill="#e11d48"
            opacity={Math.max(focusAlert ? focusOpacity : 0, mismatchGlow * 0.22)}
          />
        )}

        <g transform={`translate(${pad + 8}, ${pad + 6})`}>
          <rect x="-6" y="-10" width="146" height="54" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="6" y1="4" x2="28" y2="4" stroke="#0891b2" strokeWidth="2.5" />
          <text x="34" y="8" fill="#475569" fontSize="12" fontWeight="600">Supply</text>
          <line x1="6" y1="28" x2="28" y2="28" stroke="#d97706" strokeWidth="2.5" />
          <text x="34" y="32" fill="#475569" fontSize="12" fontWeight="600">Demand</text>
        </g>

        {(focusReserve || reserveGlow > 0.1) && (
          <g>
            <rect x={w - 164} y={pad + 6} width="132" height="42" rx="10" fill="#059669" opacity={Math.max(focusReserve ? focusOpacity : 0, reserveGlow * 0.2)} />
            <text x={w - 98} y={pad + 32} textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="800">
              Reserve Response
            </text>
          </g>
        )}

        <text x="16" y={h / 2} textAnchor="middle" fill="#94a3b8" fontSize="12" transform={`rotate(-90, 16, ${h / 2})`}>
          Power (GW)
        </text>
      </svg>

    </div>
  )
}
