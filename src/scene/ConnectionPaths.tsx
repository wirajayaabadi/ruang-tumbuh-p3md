import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { HOUSES, HOUSE_INDEX, RUANG_ACCENT, houseSlotWorld, stepAt, type StepKind } from '../config/presentation'
import { CORE_POSITIONS } from '../config/network'
import { PROBLEMS, houseSlots } from '../data/derive'
import type { Problem, RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
import { damp, easeInOutCubic } from '../utils/math'
import { UNIT_SPHERE } from './geometry'
import { tokenLive } from './ProblemTokens'
import { currentPalette } from './theme'

const PULSE_MS = 1100
const REPEAT_MS = 4200
const SEGMENTS = 40

type LineObj = THREE.Object3D & {
  material: THREE.ShaderMaterial & { opacity: number; color: THREE.Color }
  geometry: { setPositions(arr: Float32Array): unknown }
  computeLineDistances(): unknown
}

interface Flow {
  problem: Problem
  problemIndex: number
  ruang: RuangKey
  kind: 'main' | 'support'
  dir: THREE.Vector3
  curve: THREE.CubicBezierCurve3
  points: THREE.Vector3[]
  buffer: Float32Array
}

function buildFlows(): Flow[] {
  const flows: Flow[] = []
  PROBLEMS.forEach((p, i) => {
    const from = new THREE.Vector3(...CORE_POSITIONS[i].position)
    const targets: Array<[RuangKey, 'main' | 'support']> = [[p.main, 'main'], ...p.support.map((r) => [r, 'support'] as [RuangKey, 'support'])]
    targets.forEach(([r, kind]) => {
      const hi = HOUSE_INDEX[r]
      const slots = houseSlots(r)
      const idx = Math.max(0, slots.findIndex((s) => s.problem.id === p.id))
      const to = houseSlotWorld(hi, idx, slots.length, 0.6)
      const dir = to.clone().setY(0).normalize()
      const p1 = from.clone().add(dir.clone().multiplyScalar(2.8)).add(new THREE.Vector3(0, 0.4, 0))
      const p2 = to.clone().sub(dir.clone().multiplyScalar(3.6)).add(new THREE.Vector3(0, 2.6, 0))
      const curve = new THREE.CubicBezierCurve3(from.clone(), p1, p2, to)
      flows.push({ problem: p, problemIndex: i, ruang: r, kind, dir, curve, points: curve.getPoints(SEGMENTS), buffer: new Float32Array((SEGMENTS + 1) * 3) })
    })
  })
  return flows
}

/** Aliran tiap masalah dari inti ke rumah ruang terdekat (solid) dan ruang pendukung (putus-putus), dengan pulsa cahaya. */
export function ConnectionPaths() {
  const flows = useMemo(() => buildFlows(), [])
  const lineRefs = useRef<Array<LineObj | null>>([])
  const pulseRefs = useRef<Array<THREE.Mesh | null>>([])
  const pulseMats = useMemo(
    () => flows.map((f) => new THREE.MeshStandardMaterial({ color: RUANG_ACCENT[f.ruang], emissive: RUANG_ACCENT[f.ruang], emissiveIntensity: 1.1, roughness: 0.4 })),
    [flows],
  )
  const anim = useRef({
    alpha: new Float32Array(flows.length),
    pulseStart: new Float64Array(flows.length).fill(-1),
    lastRepeat: 0,
    tmp: new THREE.Vector3(),
  })

  const schedulePulses = (filter: (f: Flow) => boolean, stagger = 120) => {
    const now = performance.now()
    let k = 0
    flows.forEach((f, i) => {
      if (f.kind === 'main' && filter(f)) anim.current.pulseStart[i] = now + 200 + k++ * stagger
    })
    anim.current.lastRepeat = now
  }

  useEffect(() => {
    return useStore.subscribe((s, prev) => {
      if (s.pulseId !== prev.pulseId) {
        const step = stepAt(s.step)
        if (step.kind === 'flow' || step.kind === 'intro') schedulePulses(() => true)
        else if (step.kind === 'house') {
          const r = HOUSES[step.houseIndex!].id
          schedulePulses((f) => f.ruang === r)
        }
      }
      if (s.selectedProblem !== prev.selectedProblem && s.selectedProblem) {
        const id = s.selectedProblem
        schedulePulses((f) => f.problem.id === id, 0)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => pulseMats.forEach((m) => m.dispose()), [pulseMats])

  useFrame((_, dt) => {
    const st = useStore.getState()
    const a = anim.current
    const now = performance.now()
    const dtc = Math.min(dt, 0.05)
    const step = stepAt(st.step)
    const kind: StepKind = st.explore ? 'intro' : step.kind
    const activeRuang = kind === 'house' ? HOUSES[step.houseIndex!].id : null
    const pal = currentPalette()
    const sel = st.selectedProblem

    if (kind === 'flow' && st.phase === 'arrived' && !sel && !st.reducedMotion && now - a.lastRepeat > REPEAT_MS) {
      schedulePulses(() => true)
    }

    flows.forEach((f, i) => {
      let target = 0
      const involved = activeRuang ? f.ruang === activeRuang : true
      const base = f.kind === 'main' ? 0.9 : 0.6
      switch (kind) {
        case 'intro':
          target = st.introDone ? (sel ? (f.problem.id === sel ? 1 : 0.08) : 0.22) : 0
          break
        case 'flow':
          target = sel ? (f.problem.id === sel ? 1 : 0.1) : base
          break
        case 'house':
        default:
          target = involved ? (sel ? (f.problem.id === sel ? 1 : 0.2) : base) : 0.06
      }
      const cur = a.alpha[i]
      const next = Math.abs(cur - target) < 0.003 ? target : cur + (target - cur) * damp(dtc, 5)
      a.alpha[i] = next
      const line = lineRefs.current[i]
      if (line) {
        line.material.opacity = next
        line.visible = next > 0.02
        line.material.color.set(RUANG_ACCENT[f.ruang]).lerp(new THREE.Color(pal.path), next < 0.5 ? 0.5 - next : 0)
        if (line.visible) {
          // titik awal mengikuti token masalah yang mengorbit
          const from = tokenLive[f.problemIndex]
          f.curve.v0.copy(from)
          f.curve.v1.copy(from).addScaledVector(f.dir, 2.8).add(a.tmp.set(0, 0.4, 0))
          for (let k = 0; k <= SEGMENTS; k++) {
            f.curve.getPoint(k / SEGMENTS, a.tmp)
            f.buffer[k * 3] = a.tmp.x
            f.buffer[k * 3 + 1] = a.tmp.y
            f.buffer[k * 3 + 2] = a.tmp.z
          }
          line.geometry.setPositions(f.buffer)
          if (f.kind === 'support') line.computeLineDistances()
        }
      }

      const mesh = pulseRefs.current[i]
      if (mesh) {
        const start = a.pulseStart[i]
        if (start < 0 || now < start || next < 0.3) mesh.visible = false
        else {
          const t = (now - start) / PULSE_MS
          if (t >= 1) {
            a.pulseStart[i] = -1
            mesh.visible = false
          } else {
            mesh.visible = true
            f.curve.getPointAt(easeInOutCubic(t), mesh.position)
            mesh.scale.setScalar(0.13 + 0.08 * Math.sin(t * Math.PI))
          }
        }
      }
    })
  })

  return (
    <group>
      {flows.map((f, i) => (
        <group key={`${f.problem.id}-${f.ruang}`}>
          <Line
            ref={(el) => { lineRefs.current[i] = el as unknown as LineObj }}
            points={f.points}
            color={RUANG_ACCENT[f.ruang]}
            lineWidth={f.kind === 'main' ? 3.4 : 2}
            dashed={f.kind === 'support'}
            dashSize={0.35}
            gapSize={0.25}
            transparent
            opacity={0}
          />
          {f.kind === 'main' && (
            <mesh ref={(el) => { pulseRefs.current[i] = el }} geometry={UNIT_SPHERE} material={pulseMats[i]} visible={false} />
          )}
        </group>
      ))}
    </group>
  )
}
