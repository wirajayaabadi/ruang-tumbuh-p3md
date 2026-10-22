import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HOUSES, RUANG_ACCENT, housePosition, stepAt } from '../config/presentation'
import { houseSlots, type HouseSlot } from '../data/derive'
import { useStore } from '../store/useStore'
import { damp } from '../utils/math'
import { labelAnchors } from './Labels'

const NUCLEUS = new THREE.SphereGeometry(1, 16, 12)
const ELECTRON = new THREE.SphereGeometry(1, 10, 8)
const RING = new THREE.TorusGeometry(1, 0.035, 6, 48)
const ORBIT_R = 2.7
const ORBIT_Y = 3.9

interface Atom {
  key: string
  houseIndex: number
  slot: HouseSlot
  index: number
  count: number
  accent: string
  nucleusMat: THREE.MeshStandardMaterial
  ringMat: THREE.MeshBasicMaterial
  electronMat: THREE.MeshStandardMaterial
}

/** "Atom" tiap masalah yang bersandar pada sebuah rumah: inti bercahaya + dua cincin orbit + elektron, mengelilingi atap rumah. */
export function ProblemAtoms() {
  const atoms = useMemo<Atom[]>(
    () =>
      HOUSES.flatMap((h, hi) => {
        const slots = houseSlots(h.id)
        return slots.map((slot, i) => {
          const accent = RUANG_ACCENT[slot.problem.main]
          const plan = slot.kind === 'plan'
          return {
            key: `${h.id}:${slot.problem.id}:${slot.kind}`,
            houseIndex: hi,
            slot,
            index: i,
            count: slots.length,
            accent,
            nucleusMat: new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: plan ? 0.25 : 0.9, roughness: 0.4, transparent: true, opacity: plan ? 0.55 : 1, wireframe: plan }),
            ringMat: new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: plan ? 0.35 : 0.7, depthWrite: false }),
            electronMat: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: accent, emissiveIntensity: 1.2, roughness: 0.3 }),
          }
        })
      }),
    [],
  )
  useEffect(() => () => atoms.forEach((a) => { a.nucleusMat.dispose(); a.ringMat.dispose(); a.electronMat.dispose() }), [atoms])
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const ringRefs = useRef<Array<[THREE.Mesh | null, THREE.Mesh | null]>>(atoms.map(() => [null, null]))
  const electronRefs = useRef<Array<Array<THREE.Mesh | null>>>(atoms.map(() => [null, null, null]))
  const emph = useRef(new Float32Array(atoms.length).fill(1))
  const basePos = useMemo(() => atoms.map((a) => housePosition(a.houseIndex)), [atoms])

  useFrame((state, dt) => {
    const st = useStore.getState()
    const t = state.clock.elapsedTime
    const dtc = Math.min(dt, 0.05)
    const reduce = st.reducedMotion
    const step = stepAt(st.step)
    const activeHouse = !st.explore && step.kind === 'house' ? step.houseIndex! : -1
    const sel = st.selectedProblem

    atoms.forEach((a, i) => {
      const g = groupRefs.current[i]
      if (!g) return
      const isActiveHouse = activeHouse === a.houseIndex
      let target = 1
      if (sel) target = sel === a.slot.problem.id ? 1.35 : 0.4
      else if (activeHouse >= 0) target = isActiveHouse ? 1.2 : 0.35
      emph.current[i] += (target - emph.current[i]) * damp(dtc, 4)
      const e = emph.current[i]

      // mengelilingi rumah perlahan; tiap atom di sudutnya sendiri
      const ang = (a.index / a.count) * Math.PI * 2 + (reduce ? 0 : t * 0.18) + a.houseIndex * 0.7
      const bob = reduce ? 0 : Math.sin(t * 1.1 + i * 0.9) * 0.15
      const base = basePos[i]
      g.position.set(base.x + Math.cos(ang) * ORBIT_R, ORBIT_Y + bob + (a.index % 2) * 0.35, base.z + Math.sin(ang) * ORBIT_R)
      g.scale.setScalar(0.55 * (0.7 + 0.3 * e) * (a.slot.kind === 'main' && !a.slot.thin ? 1 : 0.85))

      const [r1, r2] = ringRefs.current[i]
      if (r1 && !reduce) { r1.rotation.x += dtc * 0.9; r1.rotation.y += dtc * 0.35 }
      if (r2 && !reduce) { r2.rotation.y -= dtc * 0.75; r2.rotation.z += dtc * 0.4 }
      electronRefs.current[i].forEach((el, k) => {
        if (!el) return
        const ph = t * (1.8 + k * 0.5) + k * 2.1 + i
        const rr = 0.62
        if (k === 0) el.position.set(Math.cos(ph) * rr, Math.sin(ph) * rr * 0.35, Math.sin(ph) * rr)
        else if (k === 1) el.position.set(Math.sin(ph) * rr * 0.4, Math.cos(ph) * rr, Math.sin(ph) * rr)
        else el.position.set(Math.cos(ph) * rr, Math.sin(ph) * rr, Math.cos(ph) * rr * 0.3)
      })
      a.nucleusMat.emissiveIntensity = (a.slot.kind === 'plan' ? 0.25 : 0.9) * (0.5 + 0.5 * e) + (sel === a.slot.problem.id ? 0.8 : 0)
      a.ringMat.opacity = (a.slot.kind === 'plan' ? 0.35 : 0.7) * Math.min(1, e)

      // label nama masalah saat rumahnya dikunjungi
      labelAnchors.set(`atom:${a.key}`, {
        position: g.position.clone().add(new THREE.Vector3(0, 0.55, 0)),
        opacity: isActiveHouse || sel === a.slot.problem.id ? 1 : 0,
      })
    })
  })

  return (
    <group>
      {atoms.map((a, i) => (
        <group key={a.key} ref={(el) => { groupRefs.current[i] = el }}>
          <mesh geometry={NUCLEUS} material={a.nucleusMat} scale={0.22} />
          <mesh ref={(el) => { ringRefs.current[i][0] = el }} geometry={RING} material={a.ringMat} scale={0.62} rotation-x={1.1} />
          <mesh ref={(el) => { ringRefs.current[i][1] = el }} geometry={RING} material={a.ringMat} scale={0.62} rotation-y={1.2} rotation-x={-0.6} />
          {[0, 1, 2].map((k) => (
            <mesh key={k} ref={(el) => { electronRefs.current[i][k] = el }} geometry={ELECTRON} material={a.electronMat} scale={0.055} />
          ))}
        </group>
      ))}
    </group>
  )
}
