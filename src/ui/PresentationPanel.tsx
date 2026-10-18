import { useStore } from '../store/useStore'
import { StepContent, stepAccent } from './StepContent'

/** Panel HTML di atas canvas; muncul setelah kamera tiba, hilang sebelum kamera berpindah. */
export function PresentationPanel() {
  const step = useStore((s) => s.step)
  const visible = useStore((s) => s.panelVisible)
  const side = useStore((s) => s.layout.panelSide)

  return (
    <aside
      className={`panel panel--${side}${visible ? ' is-visible' : ''}`}
      aria-hidden={!visible}
      aria-live="polite"
      style={{ ['--accent' as string]: stepAccent(step) }}
    >
      <div className="panel__scroll" key={step}>
        <StepContent stepIndex={step} />
      </div>
    </aside>
  )
}
