interface Props {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: Props) {
  const pct = ((current + 1) / total) * 100

  return (
    <div className="w-48 h-2 bg-bg-surface rounded-full overflow-hidden border border-border" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      <div
        className="h-full bg-linear-gradient-to-r from-accent-cyan to-accent-blue rounded-full transition-all duration-500 ease-out progress-glow"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
