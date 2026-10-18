import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { computeLayout } from '../utils/layout'

/** Mengukur viewport dan menyimpan fraksi area yang tertutup UI ke store (hanya saat resize). */
export function useLayout() {
  const setLayout = useStore((s) => s.setLayout)
  const setReducedMotion = useStore((s) => s.setReducedMotion)
  useEffect(() => {
    const update = () => setLayout(computeLayout(window.innerWidth, window.innerHeight))
    update()
    window.addEventListener('resize', update)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReducedMotion(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener('change', onMq)
    }
  }, [setLayout, setReducedMotion])
}
