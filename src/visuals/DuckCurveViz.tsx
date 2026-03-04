import type { VisualFocusProps } from './types'

type Props = VisualFocusProps

const HOURS = Array.from({ length: 25 }, (_, i) => i)
const YEARS = Array.from({ length: 9 }, (_, i) => 2012 + i)

function grossLoad(hour: number): number {
  return (
    20.8
    - 1.1 * Math.exp(-((hour - 3.5) ** 2) / 7)
    + 0.7 * Math.exp(-((hour - 8) ** 2) / 5)
    + 5.6 * Math.exp(-((hour - 20) ** 2) / 5.5)
    + 0.3 * Math.exp(-((hour - 13) ** 2) / 18)
  )
}

function solarGeneration(hour: number, yearIndex: number): number {
  if (hour < 6 || hour > 20) return 0

  const intensity = 1.6 + yearIndex * 1.1
  const middayBell = intensity * Math.exp(-((hour - 13) ** 2) / 7.2)
  const afternoonShoulder = intensity * 0.24 * Math.exp(-((hour - 16) ** 2) / 2.8)
  return middayBell + afternoonShoulder
}

function buildNetCurve(yearIndex: number): number[] {
  return HOURS.map((hour) => grossLoad(hour) - solarGeneration(hour, yearIndex))
}

function yearColor(yearIndex: number): string {
  const t = yearIndex / (YEARS.length - 1)
  const hue = 205 - t * 187
  const saturation = 40 + t * 36
  const lightness = 70 - t * 34
  return `hsl(${hue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return d
}

export default function DuckCurveViz({ focusTargetId, focusEffect }: Props) {
  const w = 560
  const h = 330
  const padLeft = 58
  const padRight = 26
  const padTop = 34
  const padBottom = 46
  const yMin = 10
  const yMax = 28

  const curves = YEARS.map((year, yearIndex) => ({
    year,
    values: buildNetCurve(yearIndex),
    color: yearColor(yearIndex),
  }))
  const latestCurve = curves[curves.length - 1]
  const earliestCurve = curves[0]
  const grossCurve = HOURS.map((hour) => grossLoad(hour))

  const toX = (hour: number) => padLeft + (hour / 24) * (w - padLeft - padRight)
  const toY = (mw: number) => h - padBottom - ((mw - yMin) / (yMax - yMin)) * (h - padTop - padBottom)

  const curvePath = (values: number[]) =>
    smoothPath(HOURS.map((hour, idx) => ({ x: toX(hour), y: toY(values[idx]) })))

  const grossPath = curvePath(grossCurve)

  const latestMinValue = Math.min(...latestCurve.values)
  const latestMinHour = HOURS[latestCurve.values.indexOf(latestMinValue)]
  const noonX = toX(latestMinHour)
  const sunsetX = toX(18.6)
  const focusOpacity = focusEffect === 'glow' ? 0.25 : 0.15

  const overgenHours = HOURS.filter((hour) => hour >= 9 && hour <= 16)
  const overgenTop = overgenHours
    .map((hour) => `${toX(hour).toFixed(1)},${toY(earliestCurve.values[hour]).toFixed(1)}`)
    .join(' L ')
  const overgenBottom = [...overgenHours]
    .reverse()
    .map((hour) => `${toX(hour).toFixed(1)},${toY(latestCurve.values[hour]).toFixed(1)}`)
    .join(' L ')
  const overgenPath = `M ${overgenTop} L ${overgenBottom} Z`

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <p className="text-xs text-text-muted text-center max-w-sm leading-relaxed">
        Historical traces stay visible while solar grows: <strong className="text-text-secondary">midday net load sinks into the belly, then surges up the neck at sunset</strong>.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg">
        {focusTargetId === 'noon-belly' && (
          <ellipse cx={noonX} cy={toY(latestMinValue)} rx="52" ry="32" fill="#d97706" opacity={focusOpacity} />
        )}
        {focusTargetId === 'sunset-ramp' && (
          <rect x={sunsetX - 30} y={padTop + 16} width="60" height={h - padTop - padBottom - 18} rx="12" fill="#e11d48" opacity={focusOpacity} />
        )}

        <text x={w / 2} y={22} textAnchor="middle" fill="#475569" fontSize="13" fontWeight="700">
          Net Load Duck Curve (2012-2020)
        </text>

        {[10, 12, 14, 16, 18, 20, 22, 24, 26, 28].map((mw) => (
          <g key={`y-${mw}`}>
            <line x1={padLeft} y1={toY(mw)} x2={w - padRight} y2={toY(mw)} stroke="#e2e8f02d" strokeWidth="1" />
            <text x={padLeft - 8} y={toY(mw) + 4} textAnchor="end" fill="#64748b" fontSize="11" fontFamily="var(--font-mono)">
              {mw}
            </text>
          </g>
        ))}

        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((hr) => (
          <g key={hr}>
            <line x1={toX(hr)} y1={padTop} x2={toX(hr)} y2={h - padBottom} stroke="#f1f5f94b" strokeWidth="1" />
            <text
              x={toX(hr)}
              y={h - 16}
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontFamily="var(--font-mono)"
            >
              {hr === 0 || hr === 24 ? '12a' : hr === 12 ? '12p' : hr < 12 ? `${hr}a` : `${hr - 12}p`}
            </text>
          </g>
        ))}

        <path d={overgenPath} fill="#fb923c" opacity="0.08" />
        <text x={toX(10.8)} y={toY(15.1)} textAnchor="end" fill="#b45309" fontSize="11" fontWeight="900">
          Growing midday overgeneration risk
        </text>

        <path d={grossPath} fill="none" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="6 3" />

        {curves.map((curve, curveIndex) => {
          const opacity = 0.3 + (curveIndex / (curves.length - 1)) * 0.6
          const width = curveIndex === curves.length - 1 ? 3.5 : 1.9
          return (
            <path
              key={curve.year}
              d={curvePath(curve.values)}
              fill="none"
              stroke={curve.color}
              strokeWidth={width}
              strokeLinecap="round"
              opacity={opacity}
            />
          )
        })}

        <text x={toX(latestMinHour) - 25} y={toY(latestMinValue) - 12} textAnchor="end" fill="#9a3412" fontSize="12" fontWeight="800">
          Belly
        </text>
        <text x={toX(19.1)} y={toY(latestCurve.values[19]) - 12} textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="800">
          Neck Ramp
        </text>


        {focusTargetId === 'ramp-meter' && (
          <g>
            <rect x={w - 136} y={padTop + 10} width="136" height="44" rx="10" fill="#e11d48" opacity={focusOpacity} />
            <text x={w - 88} y={padTop + 35} textAnchor="end" fill="#881337" fontSize="11" fontWeight="800">
              Ramp Stress
            </text>
          </g>
        )}

        <g transform={`translate(${padLeft + 6}, ${padTop + 14})`}>
          <rect x="-8" y="-12" width="214" height="70" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="8" y1="6" x2="30" y2="6" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="36" y="10" fill="#475569" fontSize="11" fontWeight="500">Gross Load (reference)</text>
          <line x1="8" y1="28" x2="30" y2="28" stroke={earliestCurve.color} strokeWidth="2" opacity="0.6" />
          <text x="36" y="32" fill="#475569" fontSize="11" fontWeight="500">Historic Net Load (2012-2019)</text>
          <line x1="8" y1="50" x2="30" y2="50" stroke={latestCurve.color} strokeWidth="3.5" />
          <text x="36" y="54" fill="#475569" fontSize="11" fontWeight="600">Latest Net Load (2020)</text>
        </g>

        <text x={14} y={h / 2} fill="#64748b" fontSize="11" fontWeight="600" transform={`rotate(-90 14 ${h / 2})`}>
          Net Load (GW)
        </text>
      </svg>
    </div>
  )
}
