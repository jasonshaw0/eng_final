import { useAnimationTimer } from '../components/useAnimationTimer'
import type { VisualFocusProps } from './types'

type VizProps = VisualFocusProps

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export default function TransmissionCongestionViz({
  focusTargetId,
  focusEffect,
}: VizProps) {
  const CYCLE = 12
  const { elapsed } = useAnimationTimer(CYCLE)
  const phase = elapsed % CYCLE
  const congestionLevel = phase < 4
    ? 0.46 + 0.12 * (phase / 4)
    : phase < 8
      ? 0.68 + 0.2 * ((phase - 4) / 4)
      : 0.9 + 0.1 * ((phase - 8) / 4)
  const utilization = Math.round(congestionLevel * 100)
  const lineColor = congestionLevel < 0.65 ? '#10b981' : congestionLevel < 0.9 ? '#f59e0b' : '#ef4444'
  const status = congestionLevel < 0.65 ? 'Normal Transfer' : congestionLevel < 0.9 ? 'Heavy Transfer' : 'Congestion'
  const focusOpacity = focusEffect === 'glow' ? 0.25 : 0.15

  const flowHead = 220 + ((elapsed * 104) % 280)
  const flowTail = Math.max(220, flowHead - 66)
  const flowHeadT = clamp((flowHead - 220) / 280, 0, 1)
  const flowTailT = clamp((flowTail - 220) / 280, 0, 1)
  const topY = (t: number) => lerp(154, 146, t)
  const bottomY = (t: number) => lerp(188, 180, t)

  const isFocused = (target: string) => focusTargetId === target

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        Familiar path, stronger visual context: generation <strong className="text-text-secondary">through a constrained corridor</strong> into substation and city demand.
      </p>
      <svg viewBox="0 0 760 360" className="w-full max-w-2xl">
        <defs>
          <linearGradient id="tx-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#081225" />
            <stop offset="65%" stopColor="#102549" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="tx-ground" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10283d" />
            <stop offset="100%" stopColor="#173754" />
          </linearGradient>
          <linearGradient id="tx-panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a3358" />
            <stop offset="100%" stopColor="#12213d" />
          </linearGradient>
          <pattern id="tx-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(147,197,253,0.16)" strokeWidth="0.7" />
          </pattern>
          <filter id="tx-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="8" y="8" width="744" height="344" rx="24" fill="url(#tx-sky)" />
        <rect x="8" y="8" width="744" height="344" rx="24" fill="url(#tx-grid)" opacity="0.2" />
        <polygon points="18,228 468,158 748,214 298,286" fill="url(#tx-ground)" opacity="0.88" />
        <polygon points="18,228 468,158 748,214 298,286" fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />

        {isFocused('generators') && (
          <ellipse cx="146" cy="194" rx="118" ry="72" fill="#14b8a6" opacity={focusOpacity} />
        )}
        {isFocused('corridor') && (
          <rect x="210" y="126" width="326" height="98" rx="14" fill="#38bdf8" opacity={focusOpacity} />
        )}
        {isFocused('substation') && (
          <ellipse cx="552" cy="174" rx="60" ry="54" fill="#fb923c" opacity={focusOpacity} />
        )}
        {isFocused('city-load') && (
          <ellipse cx="658" cy="174" rx="66" ry="58" fill="#818cf8" opacity={focusOpacity} />
        )}

        <g>
          <ellipse cx="80" cy="210" rx="40" ry="10" fill="rgba(15,23,42,0.45)" />
          <rect x="50" y="176" width="60" height="38" rx="6" fill="#334155" />
          <rect x="72" y="144" width="16" height="32" rx="2" fill="#475569" />
          <rect x="58" y="182" width="14" height="14" rx="2" fill="#64748b" />
          <rect x="88" y="182" width="14" height="14" rx="2" fill="#64748b" />
        </g>

        <g transform="translate(146 168)">
          <line x1="0" y1="0" x2="0" y2="56" stroke="#94a3b8" strokeWidth="4" />
          <g transform={`rotate(${elapsed * 62})`}>
            {[0, 120, 240].map((angle) => (
              <line
                key={angle}
                x1="0"
                y1="0"
                x2={34 * Math.cos((angle * Math.PI) / 180)}
                y2={34 * Math.sin((angle * Math.PI) / 180)}
                stroke="#cbd5e1"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </g>
          <circle cx="0" cy="0" r="4.5" fill="#f8fafc" />
        </g>
        <g transform="translate(182 154) scale(0.84)">
          <line x1="0" y1="0" x2="0" y2="56" stroke="#94a3b8" strokeWidth="4" />
          <g transform={`rotate(${elapsed * 47 + 18})`}>
            {[0, 120, 240].map((angle) => (
              <line
                key={angle}
                x1="0"
                y1="0"
                x2={32 * Math.cos((angle * Math.PI) / 180)}
                y2={32 * Math.sin((angle * Math.PI) / 180)}
                stroke="#cbd5e1"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </g>
          <circle cx="0" cy="0" r="4.5" fill="#f8fafc" />
        </g>

        <g transform="translate(86 212) skewX(-26)">
          <rect x="0" y="0" width="24" height="15" rx="2" fill="url(#tx-panel)" stroke="#5b6f95" />
          <rect x="30" y="0" width="24" height="15" rx="2" fill="url(#tx-panel)" stroke="#5b6f95" />
          <rect x="60" y="0" width="24" height="15" rx="2" fill="url(#tx-panel)" stroke="#5b6f95" />
          <rect x="90" y="0" width="24" height="15" rx="2" fill="url(#tx-panel)" stroke="#5b6f95" />
        </g>
        <text x="48" y="254" fill="#cbd5e1" fontSize="12" fontWeight="700">Generation</text>

        <g opacity="0.86">
          <line x1="220" y1="154" x2="500" y2="146" stroke={lineColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="220" y1="188" x2="500" y2="180" stroke={lineColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="220" y1="154" x2="500" y2="146" stroke="rgba(15,23,42,0.5)" strokeWidth="2.2" strokeDasharray="10 10" />
          <line x1="220" y1="188" x2="500" y2="180" stroke="rgba(15,23,42,0.5)" strokeWidth="2.2" strokeDasharray="10 10" />
          <circle cx={flowHead} cy={topY(flowHeadT)} r="6" fill={lineColor} filter="url(#tx-glow)" />
          <circle cx={flowTail} cy={bottomY(flowTailT)} r="5.5" fill={lineColor} opacity="0.95" filter="url(#tx-glow)" />
          <rect x="302" y="94" width="104" height="28" rx="14" fill="rgba(15,23,42,0.62)" stroke="rgba(148,163,184,0.4)" />
          <text x="354" y="112" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="700">
            Transmission
          </text>
        </g>

        <g transform="translate(548 171)">
          <rect x="-38" y="-28" width="76" height="56" rx="10" fill="#c7d2fe" fillOpacity="0.88" stroke="#64748b" strokeWidth="2.4" />
          <rect x="-28" y="-18" width="20" height="16" rx="3" fill="#94a3b8" />
          <rect x="8" y="-18" width="20" height="16" rx="3" fill="#94a3b8" />
          <line x1="0" y1="28" x2="0" y2="58" stroke="#64748b" strokeWidth="4" />
          <line x1="38" y1="-2" x2="62" y2="8" stroke={lineColor} strokeWidth="4" />
          <line x1="38" y1="14" x2="62" y2="16" stroke={lineColor} strokeWidth="4" />
        </g>
        <text x="548" y="256" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="700">Substation</text>

        <g transform="translate(650 222)">
          <rect x="-36" y="-64" width="20" height="64" fill="#64748b" />
          <rect x="-10" y="-78" width="24" height="78" fill="#475569" />
          <rect x="20" y="-52" width="20" height="52" fill="#64748b" />
          <rect x="46" y="-70" width="18" height="70" fill="#475569" />
          <rect x="72" y="-44" width="16" height="44" fill="#64748b" />
        </g>
        <text x="650" y="256" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="700">City Load</text>

        <g transform="translate(584 30)">
          <rect x="0" y="0" width="150" height="72" rx="12" fill="rgba(15,23,42,0.68)" stroke="rgba(148,163,184,0.38)" />
          <text x="14" y="22" fill="#cbd5e1" fontSize="10" fontWeight="700">CORRIDOR UTILIZATION</text>
          <rect x="14" y="32" width="122" height="12" rx="6" fill="rgba(30,41,59,0.82)" />
          <rect x="14" y="32" width={122 * congestionLevel} height="12" rx="6" fill={lineColor} />
          <text x="14" y="60" fill={lineColor} fontSize="12" fontWeight="800">{utilization}% {status}</text>
        </g>

        <rect x="284" y="292" width="192" height="34" rx="17" fill="rgba(15,23,42,0.7)" stroke={lineColor} strokeWidth="2.2" />
        <text x="380" y="314" textAnchor="middle" fill={lineColor} fontSize="12" fontWeight="800">
          {status}
        </text>
      </svg>
    </div>
  )
}
