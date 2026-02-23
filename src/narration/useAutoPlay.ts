import { useState, useEffect, useRef, useCallback } from 'react'
import { narrations } from './narrationScripts'
import { generateTTS, getApiKey } from './geminiTTS'

export type AutoPlayStatus = 'idle' | 'generating' | 'playing' | 'paused'

export interface AutoPlayState {
  status: AutoPlayStatus
  currentSlide: number
  currentSegment: number
  generationProgress: { done: number; total: number }
  error: string | null
  audioReady: boolean[]
}

export function useAutoPlay(
  totalSlides: number,
  navigateTo: (index: number) => void,
) {
  const [status, setStatus] = useState<AutoPlayStatus>('idle')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentSegment, setCurrentSegment] = useState(-1)
  const [genProgress, setGenProgress] = useState({ done: 0, total: narrations.length })
  const [error, setError] = useState<string | null>(null)
  const [audioReady, setAudioReady] = useState<boolean[]>(new Array(totalSlides).fill(false))
  const [playbackRate, setPlaybackRate] = useState(1)

  const audioBlobsRef = useRef<(Blob | null)[]>(new Array(totalSlides).fill(null))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const isPlayingRef = useRef(false)
  const playbackRateRef = useRef(playbackRate)

  // Keep ref in sync with state
  useEffect(() => {
    playbackRateRef.current = playbackRate
  }, [playbackRate])

  // Generate audio for all slides
  const generateAll = useCallback(async () => {
    const apiKey = getApiKey()
    if (!apiKey) {
      setError('Please set your Gemini API key in Settings first.')
      return false
    }

    setStatus('generating')
    setError(null)
    setGenProgress({ done: 0, total: narrations.length })

    for (let i = 0; i < narrations.length; i++) {
      if (!isPlayingRef.current && i > 0) break // Allow cancellation during generation

      try {
        const result = await generateTTS(narrations[i].fullText, apiKey)
        audioBlobsRef.current[i] = result.blob
        setAudioReady((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
        setGenProgress({ done: i + 1, total: narrations.length })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Slide ${i + 1} failed: ${msg}`)
        setStatus('idle')
        return false
      }
    }

    return true
  }, [])

  // Play audio for a specific slide — returns a Promise that resolves only when audio truly finishes
  const playSlideAudio = useCallback((slideIndex: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const blob = audioBlobsRef.current[slideIndex]
      if (!blob) {
        reject(new Error(`No audio for slide ${slideIndex}`))
        return
      }

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }

      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url

      const audio = new Audio()
      audioRef.current = audio
      audio.playbackRate = playbackRateRef.current

      // Set up segment tracking
      const narration = narrations[slideIndex]
      if (narration && narration.segments.length > 0) {
        const totalChars = narration.fullText.length
        audio.addEventListener('timeupdate', () => {
          if (!audio.duration || audio.duration === Infinity) return
          const progress = audio.currentTime / audio.duration
          let charsSoFar = 0
          for (let s = 0; s < narration.segments.length; s++) {
            charsSoFar += narration.segments[s].text.length
            if (charsSoFar / totalChars > progress) {
              setCurrentSegment(s)
              break
            }
          }
        })
      }

      // Resolve ONLY when audio is done playing
      const cleanup = () => {
        URL.revokeObjectURL(url)
        objectUrlRef.current = null
      }

      audio.addEventListener('ended', () => {
        cleanup()
        resolve()
      }, { once: true })

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        cleanup()
        // Don't reject — just resolve so we move to next slide
        // but add a delay so the user can see the slide content
        setTimeout(resolve, 3000)
      }, { once: true })

      // Wait for audio to be loadable before playing
      audio.addEventListener('canplaythrough', () => {
        audio.play().catch((playErr) => {
          console.error('Audio play() rejected:', playErr)
          cleanup()
          // Browser blocked autoplay — wait and move on
          setTimeout(resolve, 3000)
        })
      }, { once: true })

      // Set source AFTER all listeners are attached
      audio.src = url
      audio.load()
    })
  }, [])

  // Run full presentation
  const startPresentation = useCallback(async () => {
    setError(null)
    isPlayingRef.current = true

    // Check if audio is already generated
    const allReady = audioBlobsRef.current.every((b) => b !== null)

    if (!allReady) {
      const success = await generateAll()
      if (!success) {
        isPlayingRef.current = false
        return
      }
    }

    setStatus('playing')

    for (let i = 0; i < narrations.length; i++) {
      if (!isPlayingRef.current) break

      // Navigate to the slide
      setCurrentSlide(i)
      setCurrentSegment(0)
      navigateTo(i)

      // Small delay to let the slide render before audio starts
      await new Promise((r) => setTimeout(r, 500))

      if (!isPlayingRef.current) break

      try {
        await playSlideAudio(i)
      } catch (err) {
        console.error('playSlideAudio error:', err)
        // Continue to next slide after a brief pause
        await new Promise((r) => setTimeout(r, 2000))
      }

      setCurrentSegment(-1)

      // Brief pause between slides
      if (isPlayingRef.current && i < narrations.length - 1) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    isPlayingRef.current = false
    setStatus('idle')
    setCurrentSegment(-1)
  }, [generateAll, navigateTo, playSlideAudio])

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setStatus('paused')
    }
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
      setStatus('playing')
    }
  }, [])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setStatus('idle')
    setCurrentSegment(-1)
  }, [])

  const skipSlide = useCallback(() => {
    // Force the current audio to end, which will resolve the playSlideAudio promise
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  return {
    status,
    currentSlide,
    currentSegment,
    generationProgress: genProgress,
    error,
    audioReady,
    playbackRate,
    startPresentation,
    pause,
    resume,
    stop,
    skipSlide,
    changeSpeed,
    generateAll,
  }
}
