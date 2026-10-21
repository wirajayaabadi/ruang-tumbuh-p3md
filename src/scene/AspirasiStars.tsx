import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STAGE } from '../config/presentation'
import { loadLocal } from '../data/aspirasi'
import { useStore } from '../store/useStore'
import { getSoftDotTexture } from './textures'

const MAX = 64

interface Star {
  sprite: THREE.Sprite | null
  target: THREE.Vector3
  t0: number
  seed: number
  active: boolean
}

/** Bintang aspirasi: tiap kiriman melesat dari inti lalu menetap berkelip di langit. */
export function AspirasiStars() {
  const tex = useMemo(() => getSoftDotTexture(), [])
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: tex, color: '#ffe9a8', transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), [tex])
  useEffect(() => () => mat.dispose(), [mat])
  const stars = useRef<Star[]>(Array.from({ length: MAX }, () => ({ sprite: null, target: new THREE.Vector3(), t0: 0, seed: 0, active: false })))
  const seen = useRef({ id: -1, initialized: false })
  const rng = useRef(777)
  const rand = () => ((rng.current = (rng.current * 1664525 + 1013904223) % 4294967296) / 4294967296)

  const spawn = (now: number, instant: boolean) => {
    const s = stars.current.find((x) => !x.active)
    if (!s) return
    const a = rand() * Math.PI * 2
    const r = 24 + rand() * 40
    s.target.set(Math.cos(a) * r, 22 + rand() * 34, Math.sin(a) * r)
    s.t0 = instant ? now - 10 : now
    s.seed = rand() * 10
    s.active = true
    if (s.sprite) s.sprite.visible = true
  }

  useFrame((state) => {
    const st = useStore.getState()
    const now = state.clock.elapsedTime
    if (!seen.current.initialized) {
      seen.current.initialized = true
      seen.current.id = st.aspirasiId
      // aspirasi yang pernah dikirim dari perangkat ini langsung tampil sebagai bintang
      loadLocal().slice(-MAX).forEach(() => spawn(now, true))
    }
    if (st.aspirasiId !== seen.current.id) {
      seen.current.id = st.aspirasiId
      spawn(now, false)
    }
    stars.current.forEach((s) => {
      if (!s.active || !s.sprite) return
      const u = Math.min(1, (now - s.t0) / 2.6)
      const e = 1 - Math.pow(1 - u, 3)
      // lintasan: dari inti, melengkung ke atas, menuju posisi langit
      s.sprite.position.set(s.target.x * e, STAGE.coreY + (s.target.y - STAGE.coreY) * e + Math.sin(u * Math.PI) * 6, s.target.z * e)
      const twinkle = 0.75 + 0.25 * Math.sin(now * 2.2 + s.seed)
      s.sprite.scale.setScalar(u < 1 ? 1.6 + (1 - u) * 1.2 : 1.6 * twinkle)
    })
  })

  const slots = useMemo(() => Array.from({ length: MAX }, (_, i) => i), [])
  const bind = (i: number) => (el: THREE.Sprite | null) => { stars.current[i].sprite = el }
  return (
    <group>
      {slots.map((i) => (
        <sprite key={i} ref={bind(i)} material={mat} visible={false} />
      ))}
    </group>
  )
}
