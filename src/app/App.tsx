import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, useRef } from 'react'
import { slides } from '../content/slides'
import SlideShell from '../components/SlideShell'
import Slide0Cover from '../slides/Slide0Cover'
import Slide1RealtimeBalance from '../slides/Slide1RealtimeBalance'
import Slide2NameplateVsReality from '../slides/Slide2NameplateVsReality'
import Slide3DuckCurve from '../slides/Slide3DuckCurve'
import Slide4StabilityInertia from '../slides/Slide4StabilityInertia'
import Slide5StorageScale from '../slides/Slide5StorageScale'
import Slide6Transmission from '../slides/Slide6Transmission'
import Slide7SeekHelpAndSolutions from '../slides/Slide7SeekHelpAndSolutions'
import Slide8References from '../slides/Slide8References'
import PrintView from '../components/PrintView'
import HelpModal from '../components/HelpModal'
import ApiKeyModal from '../components/ApiKeyModal'
import AutoPlayBar from '../components/AutoPlayBar'
import { useAutoPlay } from '../narration/useAutoPlay'
import type { KeyframeConfig, NarrationManifest } from '../narration/manifestTypes'

const slideComponents = [
  Slide0Cover,
  Slide1RealtimeBalance,
  Slide2NameplateVsReality,
  Slide3DuckCurve,
  Slide4StabilityInertia,
  Slide5StorageScale,
  Slide6Transmission,
  Slide7SeekHelpAndSolutions,
  Slide8References,
]

const allPaths = ['/', ...Array.from({ length: 7 }, (_, i) => `/slide/${i + 1}`), '/references']

function getSlideIndex(pathname: string): number {
  if (pathname === '/') return 0
  if (pathname === '/references') return 8
  const match = pathname.match(/^\/slide\/(\d+)$/)
  if (match) return parseInt(match[1], 10)
  return 0
}

function getAssetPath(asset: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/+$/, '/')}${asset.replace(/^\/+/, '')}`
}

interface BgParticle {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  drift: number
  hue: string
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123
  return value - Math.floor(value)
}

function buildBackdropParticle(id: number): BgParticle {
  const r = (offset: number) => seededUnit(id * 13 + offset)
  return {
    id,
    left: r(1) * 100,
    top: r(2) * 100,
    size: r(3) > 0.7 ? 2.6 : 1.6,
    delay: r(4) * 10,
    duration: 8 + r(5) * 14,
    drift: 12 + r(6) * 34,
    hue: id % 3 === 0 ? 'rgba(14,165,233,0.9)' : id % 3 === 1 ? 'rgba(99,102,241,0.9)' : 'rgba(139,92,246,0.9)',
  }
}

const BACKDROP_PARTICLES = Array.from({ length: 36 }, (_, id) => buildBackdropParticle(id))

function BackdropParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[2]">
      {BACKDROP_PARTICLES.map((p) => (
        <span
          key={p.id}
          className="backdrop-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.hue,
            ['--particle-delay' as string]: `${p.delay}s`,
            ['--particle-duration' as string]: `${p.duration}s`,
            ['--particle-drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotes, setShowNotes] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [presentationMode, setPresentationMode] = useState(() => {
    const stored = localStorage.getItem('presentation_mode')
    return stored !== null ? stored === 'true' : true
  })
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'exit' | 'enter'>('idle')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [showTransitionRipple, setShowTransitionRipple] = useState(false)
  const [manifest, setManifest] = useState<NarrationManifest | null>(null)
  const [manifestError, setManifestError] = useState<string | null>(null)
  const [keyframes, setKeyframes] = useState<KeyframeConfig | null>(null)
  const timeoutIdsRef = useRef<number[]>([])

  const queueTimeout = useCallback((cb: () => void, delay: number) => {
    const id = window.setTimeout(cb, delay)
    timeoutIdsRef.current.push(id)
  }, [])

  useEffect(() => () => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
  }, [])

  const currentIndex = getSlideIndex(location.pathname)

  const togglePresentationMode = useCallback(() => {
    setPresentationMode((prev) => {
      const next = !prev
      localStorage.setItem('presentation_mode', String(next))
      return next
    })
  }, [])

  const goTo = useCallback(
    (index: number, dir: 'forward' | 'backward') => {
      if (index < 0 || index >= allPaths.length || transitionPhase !== 'idle') return
      if (index === currentIndex) return
      setDirection(dir)
      setTransitionPhase('exit')
      setShowTransitionRipple(true)
      queueTimeout(() => {
        navigate(allPaths[index])
      }, 210)
      queueTimeout(() => {
        setTransitionPhase('enter')
      }, 220)
      queueTimeout(() => {
        setTransitionPhase('idle')
      }, 560)
      queueTimeout(() => {
        setShowTransitionRipple(false)
      }, 520)
    },
    [currentIndex, navigate, queueTimeout, transitionPhase],
  )

  const goNext = useCallback(() => {
    if (currentIndex < allPaths.length - 1) goTo(currentIndex + 1, 'forward')
  }, [currentIndex, goTo])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1, 'backward')
  }, [currentIndex, goTo])

  const navigateToSlide = useCallback((index: number) => {
    if (index < 0 || index >= allPaths.length) return
    const dir = index >= currentIndex ? 'forward' : 'backward'
    goTo(index, dir)
  }, [currentIndex, goTo])

  const autoPlay = useAutoPlay(navigateToSlide, manifest, keyframes)
  const autoPlayActive = autoPlay.status === 'loading' || autoPlay.status === 'playing' || autoPlay.status === 'paused'
  const activeSegment = currentIndex === autoPlay.currentSlide ? autoPlay.currentSegment : null
  const activeTimeline = currentIndex === autoPlay.currentSlide ? autoPlay.timelineState : null
  const activeTrack = manifest?.slides?.find((track) => track.slideIndex === currentIndex) || null
  const alignmentWarning = import.meta.env.DEV
    && autoPlayActive
    && activeTrack?.alignmentMode
    && activeTrack.alignmentMode !== 'forced'
    ? `Sync fallback mode active on this slide (${activeTrack.alignmentMode}). Install alignment deps and rerun narration build for tighter cue timing.`
    : null

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch(getAssetPath('narration/manifest.json')),
      fetch(getAssetPath('narration/keyframes.json')),
    ])
      .then(async ([manifestResp, keyframesResp]) => {
        if (!manifestResp.ok) {
          throw new Error(`Manifest request failed (${manifestResp.status})`)
        }
        const manifestData = (await manifestResp.json()) as NarrationManifest
        let keyframeData: KeyframeConfig | null = null
        if (keyframesResp.ok) {
          keyframeData = (await keyframesResp.json()) as KeyframeConfig
        }

        if (!cancelled) {
          setManifest(manifestData)
          setKeyframes(keyframeData)
          setManifestError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setManifest(null)
          setKeyframes(null)
          setManifestError(err instanceof Error ? err.message : String(err))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          goNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goPrev()
          break
        case 'n':
          setShowNotes((p) => !p)
          break
        case 'p':
          togglePresentationMode()
          break
        case '?':
        case 'h':
          setShowHelp((p) => !p)
          break
        case 'Escape':
          setShowNotes(false)
          setShowHelp(false)
          setShowSettings(false)
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, togglePresentationMode])

  if (location.pathname === '/print') {
    return <PrintView />
  }

  const referencesSlideData = {
    id: 8,
    path: '/references',
    title: 'References',
    shortTitle: 'References',
    hero: 'Sources and credits',
    bullets: [],
    deeper: [],
    notes: 'Close with source credibility and visual credits.',
  }
  const slideData = currentIndex === 8 ? referencesSlideData : (slides[currentIndex] || slides[0])
  const transitioning = transitionPhase !== 'idle'
  const transitionClass = transitionPhase === 'exit'
    ? (direction === 'forward' ? 'slide-transition-exit-forward' : 'slide-transition-exit-backward')
    : transitionPhase === 'enter'
      ? (direction === 'forward' ? 'slide-transition-enter-forward' : 'slide-transition-enter-backward')
      : ''

  return (
    <div className={`animated-bg w-full h-full relative overflow-hidden ${presentationMode ? 'mode-presentation' : 'mode-editor'}`}>
      <BackdropParticles />
      <div className="pointer-events-none absolute -top-32 -left-24 w-[44rem] h-[44rem] rounded-full blur-[120px] bg-accent-cyan/12 z-[1]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 w-[48rem] h-[48rem] rounded-full blur-[130px] bg-accent-purple/16 z-[1]" />
      {showTransitionRipple && (
        <div
          className={`pointer-events-none absolute inset-0 z-[4] transition-ripple ${direction === 'forward' ? 'transition-ripple-forward' : 'transition-ripple-backward'
            }`}
        />
      )}

      <SlideShell
        slideData={slideData}
        currentIndex={currentIndex}
        totalSlides={allPaths.length}
        direction={direction}
        transitioning={transitioning}
        showNotes={showNotes}
        presentationMode={presentationMode}
        autoPlayActive={autoPlayActive}
        onToggleNotes={() => setShowNotes((p) => !p)}
        onShowHelp={() => setShowHelp(true)}
        onNext={goNext}
        onPrev={goPrev}
        onGoTo={(i) => goTo(i, i > currentIndex ? 'forward' : 'backward')}
      >
        <div
          className={`w-full h-full ${transitionClass}`}
        >
          <Routes location={location}>
            {allPaths.map((path, i) => {
              const Comp = slideComponents[i]
              const extraProps: Record<string, unknown> = {
                activeFocusTarget: activeSegment?.focusTargetId ?? null,
                focusEffect: activeSegment?.effect ?? null,
                timelineMs: activeTimeline?.timelineMs ?? 0,
                activeSegmentId: activeTimeline?.activeSegmentId ?? null,
                keyframeState: activeTimeline?.keyframeState ?? {},
                autoplayActive: autoPlayActive,
              }
              if (i === 0) {
                extraProps.onSettings = () => setShowSettings(true)
                extraProps.onStartAutoPlay = autoPlay.startPresentation
                extraProps.autoPlayStatus = autoPlay.status
                extraProps.narrationReady = manifest !== null
                extraProps.presentationMode = presentationMode
              }
              return <Route key={path} path={path} element={<Comp {...extraProps} />} />
            })}
          </Routes>
        </div>
      </SlideShell>

      <AutoPlayBar
        status={autoPlay.status}
        segment={activeSegment}
        error={autoPlay.error || manifestError}
        autoPlayActive={autoPlayActive}
        alignmentWarning={alignmentWarning}
        onPause={autoPlay.pause}
        onResume={autoPlay.resume}
        onReset={autoPlay.stop}
      />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings && (
        <ApiKeyModal
          onClose={() => setShowSettings(false)}
          presentationMode={presentationMode}
          onTogglePresentationMode={togglePresentationMode}
        />
      )}
    </div>
  )
}
