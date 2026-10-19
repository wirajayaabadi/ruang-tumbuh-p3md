import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { getSoftDotTexture } from './textures'

const MAX = 3
const TRAIL = 14
const SPARKS = 10
const SKY_R = 120

interface Meteor {
  active: boolean
  t0: number
  dur: number
  from: THREE.Vector3
  to: THREE.Vector3
  group: THREE.Group | null
  head: THREE.Sprite | null
  trail: THREE.Sprite[]
  sparks: THREE.Sprite[]
  sparkSeed: number
}

/** Meteor biru yang sesekali melintas di langit (hanya tema gelap; dilewati saat prefers-reduced-motion). */
export function Meteors() {
  const dark = useStore((s) => s.theme === 'dark')
  const tex = useMemo(() => getSoftDotTexture(), [])
  const mats = useMemo(
    () => ({
      head: new THREE.SpriteMaterial({ map: tex, color: '#dff4ff', transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
      trail: new THREE.SpriteMaterial({ map: tex, color: '#5fb6ff', transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
      spark: new THREE.SpriteMaterial({ map: tex, color: '#9fd8ff', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    }),
    [tex],
  )
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const meteors = useRef<Meteor[]>(
    Array.from({ length: MAX }, () => ({ active: false, t0: 0, dur: 1.4, from: new THREE.Vector3(), to: new THREE.Vector3(), group: null, head: null, trail: [], sparks: [], sparkSeed: 0 })),
  )
  const next = useRef(3)
  // generator acak deterministik (menghindari Math.random di dalam callback render)
  const rng = useRef(20261019)
  const rand = () => ((rng.current = (rng.current * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const slots = useMemo(() => Array.from({ length: MAX }, (_, i) => i), [])
  const bind = (i: number, kind: 'group' | 'head' | 'trail' | 'spark', k = 0) => (el: THREE.Object3D | null) => {
    const m = meteors.current[i]
    if (kind === 'group') m.group = el as THREE.Group | null
    else if (kind === 'head') m.head = el as THREE.Sprite | null
    else if (el) (kind === 'trail' ? m.trail : m.sparks)[k] = el as THREE.Sprite
  }
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), d: new THREE.Vector3() }), [])

  useFrame((state) => {
    const st = useStore.getState()
    const t = state.clock.elapsedTime
    const enabled = dark && !st.reducedMotion
    const cam = state.camera

    // jadwalkan meteor baru secara acak tiap 5–14 detik
    if (enabled && t > next.current) {
      next.current = t + 5 + rand() * 9
      const m = meteors.current.find((x) => !x.active)
      if (m) {
        // lintasan di bagian atas bidang pandang kamera (agar selalu terlihat), melintang kiri↔kanan dan sedikit menurun
        const forward = tmp.d.set(0, 0, -1).applyQuaternion(cam.quaternion)
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion)
        const right = new THREE.Vector3().crossVectors(forward, up).normalize()
        const fov = ((cam as THREE.PerspectiveCamera).fov ?? 40) * (Math.PI / 180)
        const D = SKY_R * (0.6 + rand() * 0.3)
        const halfH = D * Math.tan(fov / 2)
        const halfW = halfH * (state.size.width / Math.max(1, state.size.height))
        const dir = rand() < 0.5 ? 1 : -1
        const yA = halfH * (0.55 + rand() * 0.35)
        const yB = yA - halfH * (0.25 + rand() * 0.3)
        const center = cam.position.clone().addScaledVector(forward, D)
        m.from.copy(center).addScaledVector(right, -dir * halfW * 1.1).addScaledVector(up, yA)
        m.to.copy(center).addScaledVector(right, dir * halfW * 1.1).addScaledVector(up, yB)
        m.dur = 1.1 + rand() * 0.9
        m.t0 = t
        m.active = true
        m.sparkSeed = rand() * 100
        if (m.group) m.group.visible = true
      }
    }

    meteors.current.forEach((m) => {
      if (!m.group) return
      if (!m.active || !enabled) {
        if (m.group.visible) m.group.visible = false
        m.active = false
        return
      }
      const u = (t - m.t0) / m.dur
      if (u >= 1) {
        m.active = false
        m.group.visible = false
        return
      }
      const fade = Math.min(1, u * 6) * Math.min(1, (1 - u) * 4)
      const dist = m.from.distanceTo(cam.position)
      const size = dist * 0.012
      tmp.p.lerpVectors(m.from, m.to, u)
      if (m.head) {
        m.head.position.copy(tmp.p)
        m.head.scale.setScalar(size * 2.2 * fade)
      }
      m.trail.forEach((sp, i) => {
        const k = (i + 1) / TRAIL
        const uu = Math.max(0, u - k * 0.12)
        sp.position.lerpVectors(m.from, m.to, uu)
        sp.scale.setScalar(size * (1.6 - 1.3 * k) * fade)
        ;(sp.material as THREE.SpriteMaterial).opacity = 0.8 * (1 - k) * fade
      })
      m.sparks.forEach((sp, i) => {
        const k = (i + 1) / SPARKS
        const uu = Math.max(0, u - 0.03 - k * 0.1)
        sp.position.lerpVectors(m.from, m.to, uu)
        const j = i + m.sparkSeed
        sp.position.x += Math.sin(j * 12.9) * size * 2.5 * k
        sp.position.y += Math.cos(j * 7.3) * size * 2 * k - size * 2 * k * k
        sp.position.z += Math.sin(j * 5.1) * size * 2.5 * k
        sp.scale.setScalar(size * 0.5 * (1 - k) * fade)
        ;(sp.material as THREE.SpriteMaterial).opacity = 0.9 * (1 - k) * fade
      })
    })
  })

  if (!dark) return null
  return (
    <group>
      {slots.map((i) => (
        <group key={i} ref={bind(i, 'group')} visible={false}>
          <sprite ref={bind(i, 'head')} material={mats.head} />
          {Array.from({ length: TRAIL }, (_, k) => (
            <sprite key={`t${k}`} ref={bind(i, 'trail', k)} material={mats.trail.clone()} />
          ))}
          {Array.from({ length: SPARKS }, (_, k) => (
            <sprite key={`s${k}`} ref={bind(i, 'spark', k)} material={mats.spark.clone()} />
          ))}
        </group>
      ))}
    </group>
  )
}
