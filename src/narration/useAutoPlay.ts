import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  KeyframeConfig,
  NarrationManifest,
  NarrationSegment,
  NarrationSlideTrack,
  NarrationTimelineState,
  SlideTimelineKeyframe,
} from './manifestTypes'

export type AutoPlayStatus = 'idle' | 'loading' | 'playing' | 'paused'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function describePlaybackError(error: unknown): string {
  if (error instanceof DOMException) {
    return `${error.name}: ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'unknown playback error'
}

function resolveAssetPath(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/'
  if (!relativePath) return ''
  return `${base.replace(/\/+$/, '/')}${relativePath.replace(/^\/+/, '')}`
}

function normalizeTrack(track: NarrationSlideTrack): NarrationSlideTrack {
  if (track.segments && track.segments.length > 0) {
    return track
  }

  const cues = track.cues || []
  const normalizedSegments = cues.map((cue) => ({
    id: cue.id,
    text: cue.subtitle,
    startMs: cue.startMs,
    endMs: cue.endMs,
    focusTargetId: cue.focusTargetId,
    effect: cue.effect,
  }))

  return {
    ...track,
    segments: normalizedSegments,
    words: track.words || [],
  }
}

function getSegmentForTime(track: NarrationSlideTrack, currentMs: number): { segment: NarrationSegment | null; index: number } {
  const segments = track.segments || []
  if (segments.length === 0) return { segment: null, index: -1 }

  for (let i = 0; i < segments.length; i++) {
    if (currentMs >= segments[i].startMs && currentMs <= segments[i].endMs) {
      return { segment: segments[i], index: i }
    }
  }

  if (currentMs > segments[segments.length - 1].endMs) {
    return { segment: segments[segments.length - 1], index: segments.length - 1 }
  }
  return { segment: null, index: -1 }
}

function applyEasing(value: number, easing: SlideTimelineKeyframe['easing']): number {
  const t = Math.max(0, Math.min(1, value))
  switch (easing) {
    case 'easeIn':
      return t * t
    case 'easeOut':
      return 1 - (1 - t) * (1 - t)
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    case 'linear':
    default:
      return t
  }
}

function interpolate(from: number | string | boolean, to: number | string | boolean, progress: number): number | string | boolean {
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * progress
  }
  return progress < 0.5 ? from : to
}

function buildKeyframeState(keyframes: SlideTimelineKeyframe[], timelineMs: number): NarrationTimelineState['keyframeState'] {
  const state: NarrationTimelineState['keyframeState'] = {}
  if (!keyframes || keyframes.length === 0) return state

  const sortedFrames = [...keyframes].sort((a, b) => {
    if (a.startMs !== b.startMs) return a.startMs - b.startMs
    return a.endMs - b.endMs
  })

  // Track per-keyframe progress for optional debugging/UI.
  for (const frame of sortedFrames) {
    const span = Math.max(1, frame.endMs - frame.startMs)
    const raw = (timelineMs - frame.startMs) / span
    const progress = applyEasing(raw, frame.easing || 'linear')
    const clampedProgress = Math.max(0, Math.min(1, progress))
    state[frame.keyframeId] = clampedProgress
  }

  // Resolve each target.property from the active timeline window only.
  const groups = new Map<string, SlideTimelineKeyframe[]>()
  for (const frame of sortedFrames) {
    const key = `${frame.target}.${frame.property}`
    const list = groups.get(key)
    if (list) {
      list.push(frame)
    } else {
      groups.set(key, [frame])
    }
  }

  for (const [groupKey, frames] of groups.entries()) {
    const first = frames[0]
    const last = frames[frames.length - 1]

    if (timelineMs <= first.startMs) {
      state[groupKey] = first.from
      continue
    }
    if (timelineMs >= last.endMs) {
      state[groupKey] = last.to
      continue
    }

    const active = frames.find((frame) => timelineMs >= frame.startMs && timelineMs <= frame.endMs)
    if (active) {
      const span = Math.max(1, active.endMs - active.startMs)
      const raw = (timelineMs - active.startMs) / span
      const eased = applyEasing(raw, active.easing || 'linear')
      const clamped = Math.max(0, Math.min(1, eased))
      state[groupKey] = interpolate(active.from, active.to, clamped)
      continue
    }

    const previous = [...frames].reverse().find((frame) => timelineMs > frame.endMs)
    state[groupKey] = previous ? previous.to : first.from
  }

  return state
}

export function useAutoPlay(
  navigateTo: (index: number) => void,
  manifest: NarrationManifest | null,
  keyframeConfig: KeyframeConfig | null,
) {
  const [status, setStatus] = useState<AutoPlayStatus>('idle')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1)
  const [currentSegment, setCurrentSegment] = useState<NarrationSegment | null>(null)
  const [timelineState, setTimelineState] = useState<NarrationTimelineState>({
    timelineMs: 0,
    activeSegmentId: null,
    keyframeState: {},
  })
  const [error, setError] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)

  const isRunningRef = useRef(false)
  const pausedRef = useRef(false)
  const skipTokenRef = useRef(0)
  const playbackRateRef = useRef(playbackRate)
  const segmentIndexRef = useRef(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    playbackRateRef.current = playbackRate
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const clearAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
      audioRef.current = null
    }
  }, [])

  const updateTimeline = useCallback((track: NarrationSlideTrack, timelineMs: number) => {
    const normalized = normalizeTrack(track)
    const segmentState = getSegmentForTime(normalized, timelineMs)
    if (segmentState.index !== segmentIndexRef.current) {
      segmentIndexRef.current = segmentState.index
      setCurrentSegmentIndex(segmentState.index)
      setCurrentSegment(segmentState.segment)
    }

    const slideKeyframes = keyframeConfig?.slides?.[String(normalized.slideIndex)] || []
    setTimelineState({
      timelineMs,
      activeSegmentId: segmentState.segment?.id || null,
      keyframeState: buildKeyframeState(slideKeyframes, timelineMs),
    })
  }, [keyframeConfig])

  const waitWithPause = useCallback(async (durationMs: number, skipToken: number) => {
    let elapsedMs = 0
    const stepMs = 60
    while (elapsedMs < durationMs && isRunningRef.current && skipTokenRef.current === skipToken) {
      await sleep(stepMs)
      if (pausedRef.current) continue
      elapsedMs += stepMs * playbackRateRef.current
    }
  }, [])

  const playTimedFallback = useCallback(async (track: NarrationSlideTrack, skipToken: number) => {
    const normalized = normalizeTrack(track)
    const timelineMs = Math.max(
      normalized.durationMs || 0,
      normalized.segments.length > 0 ? normalized.segments[normalized.segments.length - 1].endMs : 0,
      2000,
    )

    let elapsedMs = 0
    const stepMs = 50

    while (elapsedMs < timelineMs && isRunningRef.current && skipTokenRef.current === skipToken) {
      updateTimeline(normalized, elapsedMs)
      await sleep(stepMs)
      if (pausedRef.current) continue
      elapsedMs += stepMs * playbackRateRef.current
    }
  }, [updateTimeline])

  const playTrack = useCallback(async (track: NarrationSlideTrack, skipToken: number): Promise<void> => {
    const normalized = normalizeTrack(track)
    const src = resolveAssetPath(normalized.audioSrc)
    if (!src) {
      await playTimedFallback(normalized, skipToken)
      return
    }

    const audio = audioRef.current || new Audio()
    audioRef.current = audio
    audio.preload = 'auto'
    audio.setAttribute('playsinline', 'true')
    audio.playbackRate = playbackRateRef.current
    audio.pause()
    audio.src = src
    audio.currentTime = 0
    audio.load()

    try {
      await audio.play()
    } catch (firstErr) {
      await sleep(120)
      try {
        await audio.play()
      } catch (secondErr) {
        const reason = describePlaybackError(secondErr || firstErr)
        setError(`Slide ${normalized.slideIndex + 1} audio playback failed (${reason}). Using fallback timing.`)
        audio.pause()
        await playTimedFallback(normalized, skipToken)
        return
      }
    }

    await new Promise<void>((resolve) => {
      let done = false

      const finish = () => {
        if (done) return
        done = true
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
        audio.removeEventListener('ended', onEnded)
        audio.removeEventListener('error', onError)
        resolve()
      }

      const loop = () => {
        if (!audioRef.current || done) return
        updateTimeline(normalized, audio.currentTime * 1000)
        rafRef.current = requestAnimationFrame(loop)
      }

      const onError = async () => {
        setError(`Slide ${normalized.slideIndex + 1} audio missing. Using fallback timing.`)
        clearAudio()
        await playTimedFallback(normalized, skipToken)
        finish()
      }

      const onEnded = () => {
        finish()
      }

      audio.addEventListener('ended', onEnded)
      audio.addEventListener('error', onError)
      rafRef.current = requestAnimationFrame(loop)
    })
  }, [clearAudio, playTimedFallback, updateTimeline])

  const stop = useCallback(() => {
    isRunningRef.current = false
    pausedRef.current = false
    skipTokenRef.current += 1
    clearAudio()
    setStatus('idle')
    segmentIndexRef.current = -1
    setCurrentSegmentIndex(-1)
    setCurrentSegment(null)
    setTimelineState({ timelineMs: 0, activeSegmentId: null, keyframeState: {} })
  }, [clearAudio])

  const startPresentation = useCallback(async () => {
    if (!manifest?.slides?.length) {
      setError('Narration manifest not found. Run `npm run narration:build` and redeploy.')
      return
    }

    const orderedTracks = [...manifest.slides].sort((a, b) => a.slideIndex - b.slideIndex).map(normalizeTrack)
    setError(null)
    setStatus('loading')
    isRunningRef.current = true
    pausedRef.current = false

    for (let i = 0; i < orderedTracks.length; i++) {
      if (!isRunningRef.current) break
      const track = orderedTracks[i]
      const skipToken = skipTokenRef.current

      setCurrentSlide(track.slideIndex)
      segmentIndexRef.current = -1
      setCurrentSegmentIndex(-1)
      setCurrentSegment(null)
      setTimelineState({ timelineMs: 0, activeSegmentId: null, keyframeState: {} })
      navigateTo(track.slideIndex)

      const nextTrack = orderedTracks[i + 1]
      if (nextTrack?.audioSrc) {
        const preload = new Audio(resolveAssetPath(nextTrack.audioSrc))
        preload.preload = 'auto'
      }

      await waitWithPause(900, skipToken)
      if (!isRunningRef.current || skipTokenRef.current !== skipToken) continue

      setStatus(pausedRef.current ? 'paused' : 'playing')
      await playTrack(track, skipToken)

      if (i < orderedTracks.length - 1 && isRunningRef.current) {
        await waitWithPause(1100, skipToken)
      }
    }

    isRunningRef.current = false
    pausedRef.current = false
    setStatus('idle')
  }, [clearAudio, manifest, navigateTo, playTrack, waitWithPause])

  const pause = useCallback(() => {
    if (!isRunningRef.current) return
    pausedRef.current = true
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    if (!isRunningRef.current) return
    pausedRef.current = false
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setError('Playback resumed without audio output on this slide.')
      })
    }
    setStatus('playing')
  }, [])

  const skipSlide = useCallback(() => {
    if (!isRunningRef.current) return
    skipTokenRef.current += 1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.dispatchEvent(new Event('ended'))
    }
  }, [])

  const changeSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate)
    playbackRateRef.current = rate
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [])

  useEffect(() => {
    return () => {
      isRunningRef.current = false
      pausedRef.current = false
      clearAudio()
    }
  }, [clearAudio])

  return {
    status,
    currentSlide,
    currentSegmentIndex,
    currentSegment,
    timelineState,
    error,
    playbackRate,
    startPresentation,
    pause,
    resume,
    stop,
    skipSlide,
    changeSpeed,
  }
}
