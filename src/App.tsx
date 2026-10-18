import { useEffect, useMemo } from 'react'
import { HOUSE_TABS, stepAt, type HouseTab } from './config/presentation'
import { useLayout } from './hooks/useLayout'
import { Scene } from './scene/Scene'
import { useStore } from './store/useStore'
import { Appendix } from './ui/Appendix'
import { FallbackView } from './ui/FallbackView'
import { NavigationControls } from './ui/NavigationControls'
import { LabelsOverlay } from './ui/Overlay'
import { PresentationPanel } from './ui/PresentationPanel'
import { hasWebGL } from './utils/webgl'

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const s = useStore.getState()
      if (s.appendixOpen) return
      const isHouse = stepAt(s.step).kind === 'house'
      const tabIds = HOUSE_TABS.map((t) => t.id) as HouseTab[]
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          s.next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          s.prev()
          break
        case 'ArrowDown':
          if (isHouse) {
            e.preventDefault()
            s.setTab(tabIds[(tabIds.indexOf(s.tab) + 1) % tabIds.length])
          }
          break
        case 'ArrowUp':
          if (isHouse) {
            e.preventDefault()
            s.setTab(tabIds[(tabIds.indexOf(s.tab) - 1 + tabIds.length) % tabIds.length])
          }
          break
        case 'Home':
          e.preventDefault()
          s.toMap()
          break
        case 'Escape':
          // Saat fullscreen, biarkan browser menangani Escape secara native.
          if (document.fullscreenElement) return
          if (s.selectedProblem || s.highlight) {
            s.selectProblem(null)
            s.setHighlight(null)
          } else s.toMap()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default function App() {
  useLayout()
  useKeyboard()
  const webgl = useMemo(() => hasWebGL(), [])

  if (!webgl) return <FallbackView />

  return (
    <div className="app">
      <Scene />
      <LabelsOverlay />
      <PresentationPanel />
      <NavigationControls />
      <Appendix />
    </div>
  )
}
