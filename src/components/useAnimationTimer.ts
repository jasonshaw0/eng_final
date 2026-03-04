import { useState, useEffect, useRef } from 'react'

/** Hook to manage animation state with play/pause + speed */
export function useAnimationTimer(cycleDuration: number) {
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number>(0)
  const lastRef = useRef<number>(0)

  useEffect(() => {
    if (paused) return

    lastRef.current = performance.now()

    const tick = (now: number) => {
      const dt = ((now - lastRef.current) / 1000) * speed
      lastRef.current = now
      setElapsed((prev) => {
        const next = prev + dt
        return cycleDuration > 0 ? next % cycleDuration : next
      })
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [paused, speed, cycleDuration])

  return { elapsed, paused, setPaused, speed, setSpeed }
}

