import { STEPS } from '../config/presentation'
import { useStore } from '../store/useStore'
import { NavigationControls } from './NavigationControls'
import { StepContent, stepAccent } from './StepContent'

/** Tampilan HTML yang tetap dapat digunakan ketika WebGL tidak tersedia. */
export function FallbackView() {
  const step = useStore((s) => s.step)
  return (
    <div className="fallback">
      <NavigationControls fallback />
      <main className="fallback__main">
        <p className="fallback__notice">
          Perangkat ini tidak mendukung WebGL, sehingga dunia 3D tidak dapat ditampilkan. Materi tetap dapat diikuti di sini.
        </p>
        <section className="panel panel--static is-visible" style={{ ['--accent' as string]: stepAccent(step) }}>
          <StepContent stepIndex={step} />
        </section>
        <p className="muted small" style={{ textAlign: 'center', marginTop: 12 }}>
          Langkah {step + 1} dari {STEPS.length}
        </p>
      </main>
    </div>
  )
}
