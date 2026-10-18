import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { UI } from '../utils/layout'

/**
 * Sistem label DOM yang selalu menghadap kamera.
 * Komponen 3D mendaftarkan posisi dunia (labelAnchors), komponen overlay mendaftarkan elemen (labelElements),
 * dan LabelProjector memproyeksikannya ke layar setiap frame tanpa state React.
 */
export interface LabelAnchor {
  position: THREE.Vector3
  /** 0..1, 0 = disembunyikan */
  opacity: number
  /** offset vertikal px */
  dy?: number
}

export const labelAnchors = new Map<string, LabelAnchor>()
export const labelElements = new Map<string, HTMLElement>()

export function registerLabelElement(key: string) {
  return (el: HTMLElement | null) => {
    if (el) labelElements.set(key, el)
    else labelElements.delete(key)
  }
}

export function LabelProjector() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    labelElements.forEach((el, key) => {
      const a = labelAnchors.get(key)
      if (!a || a.opacity <= 0.02) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
        return
      }
      v.copy(a.position).project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height + (a.dy ?? 0)
      const hidden = v.z > 1 || y < UI.topBar + 30 || x < -40 || x > size.width + 40
      el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      el.style.opacity = a.opacity.toFixed(2)
      el.style.visibility = hidden ? 'hidden' : 'visible'
    })
  })
  return null
}
