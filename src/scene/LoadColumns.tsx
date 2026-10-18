import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HOUSES, houseLoadColumnWorld, stepAt } from '../config/presentation'
import { houseSlots, ruangLoad, type HouseSlot } from '../data/derive'
import { useStore } from '../store/useStore'
import { clamp, damp } from '../utils/math'
import { UNIT_BOX } from './geometry'
import { labelAnchors } from './Labels'
import { currentPalette } from './theme'

const SEG = 0.5
const GAP = 0.08
const WD = 0.72

interface Column {
  houseIndex: number
  base: THREE.Vector3
  segs: HouseSlot[]
  mats: THREE.MeshStandardMaterial[]
  load: ReturnType<typeof ruangLoad>
}

function segOpacity(s: HouseSlot) {
  if (s.kind === 'main') return s.thin ? 0.4 : 1
  if (s.kind === 'support') return 0.6
  return 0.32
}

/** Kolom beban di samping tiap rumah: satu balok per masalah (utama / pendukung / data kurang / hanya rencana). */
export function LoadColumns() {
  const columns = useMemo<Column[]>(
    () =>
      HOUSES.map((h, i) => {
        const segs = houseSlots(h.id)
        const accent = new THREE.Color(h.accent)
        const mats = segs.map(
          (s) =>
            new THREE.MeshStandardMaterial({
              color: s.kind === 'plan' ? '#ffffff' : accent,
              roughness: 0.7,
              transparent: true,
              opacity: 0,
              depthWrite: s.kind === 'main' && !s.thin,
            }),
        )
        return { houseIndex: i, base: houseLoadColumnWorld(i), segs, mats, load: ruangLoad(h.id) }
      }),
    [],
  )
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const anim = useRef({ vis: 0, grow: 0, since: 0, wasOn: false })

  useEffect(() => () => columns.forEach((c) => c.mats.forEach((m) => m.dispose())), [columns])

  useFrame((_, dt) => {
    const st = useStore.getState()
    const a = anim.current
    const step = stepAt(st.step)
    const dtc = Math.min(dt, 0.05)
    const on = !st.explore && (step.kind === 'load' || (step.kind === 'house' && st.tab === 'beban'))
    const activeHouse = step.kind === 'house' ? step.houseIndex! : -1
    if (on && !a.wasOn) a.since = performance.now()
    a.wasOn = on
    const targetVis = on ? 1 : 0
    a.vis += (targetVis - a.vis) * damp(dtc, 5)
    if (Math.abs(a.vis - targetVis) < 0.003) a.vis = targetVis
    const grow = on ? (st.reducedMotion ? 1 : clamp((performance.now() - a.since - 250) / 1200, 0, 1)) : a.vis
    const pal = currentPalette()

    columns.forEach((c, ci) => {
      const g = groupRefs.current[ci]
      if (!g) return
      const own = activeHouse < 0 || activeHouse === c.houseIndex
      const vis = a.vis * (own ? 1 : 0.25)
      g.visible = vis > 0.01
      c.segs.forEach((s, j) => {
        const m = c.mats[j]
        const e = clamp(grow * c.segs.length - j, 0, 1)
        m.opacity = segOpacity(s) * vis * e
        if (s.kind === 'plan') m.color.set(pal.glass)
        const mesh = g.children[j] as THREE.Mesh
        mesh.scale.set(WD, Math.max(0.001, SEG * e), WD)
        mesh.position.y = j * (SEG + GAP) + (SEG * e) / 2
      })
      const h = c.segs.length * (SEG + GAP) + 1.1
      labelAnchors.set(`load:${HOUSES[c.houseIndex].id}`, {
        position: c.base.clone().add(new THREE.Vector3(0, h, 0)),
        opacity: vis * grow,
      })
    })
  })

  return (
    <group>
      {columns.map((c, ci) => (
        <group key={HOUSES[c.houseIndex].id} ref={(el) => { groupRefs.current[ci] = el }} position={c.base}>
          {c.segs.map((s, j) => (
            <mesh key={`${s.problem.id}-${s.kind}`} geometry={UNIT_BOX} material={c.mats[j]} castShadow />
          ))}
        </group>
      ))}
    </group>
  )
}
