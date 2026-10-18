import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HOUSES, housePosition, houseRotationY, stepAt } from '../config/presentation'
import { FAIRY_PHRASES } from '../data/narrative'
import { useStore } from '../store/useStore'
import { labelAnchors, labelElements } from './Labels'
import { getSoftDotTexture } from './textures'

const TRAIL = 7
const TRAIL_INTERVAL = 0.07
const BODY_GEOM = new THREE.SphereGeometry(0.11, 12, 10)
const WING_GEOM = new THREE.PlaneGeometry(0.26, 0.2)
WING_GEOM.translate(0.13, 0.06, 0)

interface Fairy {
  houseIndex: number
  base: THREE.Vector3
  rot: number
  phase: number
  speed: number
  accent: string
  bodyMat: THREE.MeshStandardMaterial
  wingMat: THREE.MeshBasicMaterial
  trailMat: THREE.SpriteMaterial
  trail: THREE.Vector3[]
  nextPhrase: number
  phraseUntil: number
  phraseIdx: number
}

/** Peri kecil yang terbang mengitari tiap rumah, mengepakkan sayap, meninggalkan kilau, dan sesekali memberi semangat. */
export function Fairies() {
  const tex = useMemo(() => getSoftDotTexture(), [])
  const fairies = useMemo<Fairy[]>(
    () =>
      HOUSES.map((h, i) => ({
        houseIndex: i,
        base: housePosition(i),
        rot: houseRotationY(i),
        phase: i * 1.7,
        speed: 0.42 + (i % 3) * 0.06,
        accent: h.accent,
        bodyMat: new THREE.MeshStandardMaterial({ color: '#fff6d8', emissive: h.accent, emissiveIntensity: 0.9, roughness: 0.3 }),
        wingMat: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
        trailMat: new THREE.SpriteMaterial({ map: tex, color: h.accent, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
        trail: Array.from({ length: TRAIL }, () => housePosition(i).add(new THREE.Vector3(0, 2.4, 0))),
        nextPhrase: 3 + i * 2.3,
        phraseUntil: 0,
        phraseIdx: i % FAIRY_PHRASES.length,
      })),
    [tex],
  )
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const wingRefs = useRef<Array<[THREE.Mesh | null, THREE.Mesh | null]>>(HOUSES.map(() => [null, null]))
  const trailRefs = useRef<Array<Array<THREE.Sprite | null>>>(HOUSES.map(() => []))
  const sim = useRef({ t: 0, lastTrail: 0, tmp: new THREE.Vector3() })

  useEffect(
    () => () => fairies.forEach((f) => { f.bodyMat.dispose(); f.wingMat.dispose(); f.trailMat.dispose() }),
    [fairies],
  )

  useFrame((state, dt) => {
    const st = useStore.getState()
    const dtc = Math.min(dt, 0.05)
    const s = sim.current
    const reduce = st.reducedMotion
    if (!reduce) s.t += dtc
    const step = stepAt(st.step)
    const activeHouse = !st.explore && step.kind === 'house' ? step.houseIndex! : -1
    const clock = state.clock.elapsedTime
    const sampleTrail = s.t - s.lastTrail > TRAIL_INTERVAL
    if (sampleTrail) s.lastTrail = s.t

    fairies.forEach((f, i) => {
      const g = groupRefs.current[i]
      if (!g) return
      // lintasan: mengitari rumah di luar atap, dengan variasi jari-jari dan tinggi
      const ang = f.phase + s.t * f.speed
      const r = 3.0 + 0.3 * Math.sin(2 * ang + f.phase)
      const lx = Math.cos(ang) * r
      const lz = Math.sin(ang) * r
      const y = 2.3 + 0.7 * Math.sin(1.7 * ang + f.phase) + 0.12 * Math.sin(clock * 6 + i)
      const wx = lx * Math.cos(f.rot) + lz * Math.sin(f.rot)
      const wz = -lx * Math.sin(f.rot) + lz * Math.cos(f.rot)
      g.position.set(f.base.x + wx, y, f.base.z + wz)
      // menghadap arah gerak
      g.rotation.y = -Math.atan2(Math.sin(ang + Math.PI / 2), Math.cos(ang + Math.PI / 2)) - f.rot + Math.PI / 2
      // kepak sayap
      const flap = reduce ? 0.4 : Math.sin(clock * 22 + i) * 0.9
      const [wl, wr] = wingRefs.current[i]
      if (wl) wl.rotation.y = -0.4 - flap
      if (wr) wr.rotation.y = Math.PI + 0.4 + flap
      // redup bila bukan rumah aktif
      const emph = activeHouse < 0 || activeHouse === i ? 1 : 0.45
      f.bodyMat.emissiveIntensity = 0.9 * emph
      f.wingMat.opacity = 0.55 * emph
      // jejak kilau
      if (sampleTrail) {
        f.trail.pop()
        f.trail.unshift(g.position.clone())
      }
      trailRefs.current[i].forEach((sp, k) => {
        if (!sp) return
        const p = f.trail[k]
        sp.position.copy(p)
        const fade = 1 - k / TRAIL
        sp.scale.setScalar(0.28 * fade + 0.04)
        ;(sp.material as THREE.SpriteMaterial).opacity = 0.6 * fade * emph
      })
      // gelembung semangat
      const key = `fairy:${HOUSES[i].id}`
      if (clock > f.nextPhrase) {
        f.phraseIdx = (f.phraseIdx + 1 + Math.floor(Math.random() * 2)) % FAIRY_PHRASES.length
        f.phraseUntil = clock + 2.4
        f.nextPhrase = clock + (activeHouse === i ? 5 : 9) + Math.random() * 5
        const el = labelElements.get(key)
        if (el) el.textContent = FAIRY_PHRASES[f.phraseIdx]
      }
      const showing = clock < f.phraseUntil && (activeHouse < 0 || activeHouse === i)
      labelAnchors.set(key, { position: g.position.clone().add(new THREE.Vector3(0, 0.42, 0)), opacity: showing ? 1 : 0 })
    })
  })

  return (
    <group>
      {fairies.map((f, i) => (
        <group key={HOUSES[i].id}>
          <group ref={(el) => { groupRefs.current[i] = el }}>
            <mesh geometry={BODY_GEOM} material={f.bodyMat} />
            <mesh ref={(el) => { wingRefs.current[i][0] = el }} geometry={WING_GEOM} material={f.wingMat} position={[0.04, 0.02, 0]} />
            <mesh ref={(el) => { wingRefs.current[i][1] = el }} geometry={WING_GEOM} material={f.wingMat} position={[-0.04, 0.02, 0]} />
          </group>
          {Array.from({ length: TRAIL }, (_, k) => (
            <sprite key={k} ref={(el) => { trailRefs.current[i][k] = el }} material={f.trailMat.clone()} scale={0.2} />
          ))}
        </group>
      ))}
    </group>
  )
}
