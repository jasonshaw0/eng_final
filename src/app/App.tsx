import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
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

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotes, setShowNotes] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAnimControls, setShowAnimControls] = useState(() => {
    const stored = localStorage.getItem('show_anim_controls')
    return stored !== null ? stored === 'true' : true
  })
  const [transitioning, setTransitioning] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const currentIndex = getSlideIndex(location.pathname)

  const toggleAnimControls = useCallback(() => {
    setShowAnimControls((prev) => {
      const next = !prev
      localStorage.setItem('show_anim_controls', String(next))
      return next
    })
  }, [])

  const goTo = useCallback(
    (index: number, dir: 'forward' | 'backward') => {
      if (index < 0 || index >= allPaths.length || transitioning) return
      setDirection(dir)
      setTransitioning(true)
      setTimeout(() => {
        navigate(allPaths[index])
        setTransitioning(false)
      }, 300)
    },
    [navigate, transitioning],
  )

  const goNext = useCallback(() => {
    if (currentIndex < allPaths.length - 1) goTo(currentIndex + 1, 'forward')
  }, [currentIndex, goTo])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1, 'backward')
  }, [currentIndex, goTo])

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
  }, [goNext, goPrev])

  if (location.pathname === '/print') {
    return <PrintView />
  }

  const slideData = slides[currentIndex] || slides[0]

  return (
    <div className="animated-bg w-full h-full relative overflow-hidden">
      <SlideShell
        slideData={slideData}
        currentIndex={currentIndex}
        totalSlides={allPaths.length}
        showNotes={showNotes}
        onToggleNotes={() => setShowNotes((p) => !p)}
        onNext={goNext}
        onPrev={goPrev}
        onGoTo={(i) => goTo(i, i > currentIndex ? 'forward' : 'backward')}
        onShowHelp={() => setShowHelp(true)}
      >
        <div
          className={`w-full h-full transition-all duration-300 ease-out ${
            transitioning
              ? direction === 'forward'
                ? 'opacity-0 translate-x-10'
                : 'opacity-0 -translate-x-10'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <Routes location={location}>
            {allPaths.map((path, i) => {
              const Comp = slideComponents[i]
              const extraProps: Record<string, unknown> = { showAnimControls }
              if (i === 0) {
                extraProps.onSettings = () => setShowSettings(true)
              }
              return <Route key={path} path={path} element={<Comp {...extraProps} />} />
            })}
          </Routes>
        </div>
      </SlideShell>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings && (
        <ApiKeyModal
          onClose={() => setShowSettings(false)}
          showAnimControls={showAnimControls}
          onToggleAnimControls={toggleAnimControls}
        />
      )}
    </div>
  )
}
