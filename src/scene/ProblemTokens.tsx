import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { HOUSES, HOUSE_INDEX, RUANG_ACCENT, STAGE, houseSlotWorld, stepAt, type StepKind } from '../config/presentation'
import { CORE_POSITIONS } from '../config/network'
import { DATA, PROBLEMS, PROBLEMS_BY_STABILITY, PROBLEM_ORDER, houseSlots } from '../data/derive'
import type { Problem, RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
import { clamp, damp, easeInOutCubic } from '../utils/math'
import { labelAnchors } from './Labels'
import { currentPalette } from './theme'

const RING_R = 5.0
const MAX_CLONES = 3
/** kecepatan orbit inti (rad/detik) untuk cincin dalam & luar */
const ORBIT_SPEED_INNER = 0.16
const ORBIT_SPEED_OUTER = 0.09

/** Posisi hidup token utama tiap masalah (urutan PROBLEMS), dibaca ConnectionPaths dan CentralNetwork. */
export const tokenLive: THREE.Vector3[] = PROBLEMS.map((_, i) => new THREE.Vector3(...CORE_POSITIONS[i].position))
const HOLD_MS = 700
const TRAVEL_MS = 1400
const TOKEN_GEOM = new THREE.OctahedronGeometry(1, 0)
const MARKER_GEOM = new THREE.OctahedronGeometry(1, 0)

type LineObj = THREE.Object3D & { material: THREE.ShaderMaterial & { opacity: number; color: THREE.Color } }

/** Slot sebuah masalah pada rumah: indeks & jumlah, untuk posisi di tepi alas. */
function slotFor(problemId: string, ruang: RuangKey) {
  const hi = HOUSE_INDEX[ruang]
  const slots = houseSlots(ruang)
  const idx = slots.findIndex((s) => s.problem.id === problemId)
  return { hi, idx: Math.max(0, idx), n: slots.length }
}

function slotWorld(problemId: string, ruang: RuangKey, y = 0.55) {
  const s = slotFor(problemId, ruang)
  return houseSlotWorld(s.hi, s.idx, s.n, y)
}

function ringPos(k: number, n: number, out = new THREE.Vector3()) {
  const a = Math.PI / 2 + (k * 2 * Math.PI) / n
  return out.set(Math.cos(a) * RING_R, STAGE.coreY, Math.sin(a) * RING_R)
}

interface TokenData {
  problem: Problem
  core: THREE.Vector3
  ringConf: THREE.Vector3
  ringRel: THREE.Vector3
  planSlots: THREE.Vector3[]
  planSlotIdx: number[]
  dataSlot: THREE.Vector3
  dataSlotIdx: number
  mats: THREE.MeshStandardMaterial[]
}

/** Sembilan token masalah: di inti, berpindah rumah (rencana → aspirasi), cincin keyakinan, dan garis relasi. */
export function ProblemTokens() {
  const camera = useThree((s) => s.camera)
  const selectProblem = useStore((s) => s.selectProblem)

  const tokens = useMemo<TokenData[]>(
    () =>
      PROBLEMS.map((p, i) => ({
        problem: p,
        core: new THREE.Vector3(...CORE_POSITIONS[i].position),
        ringConf: ringPos(PROBLEMS_BY_STABILITY.findIndex((q) => q.id === p.id), PROBLEMS.length),
        ringRel: ringPos(i, PROBLEMS.length),
        planSlots: p.plan.map((r) => slotWorld(p.id, r)),
        planSlotIdx: p.plan.map((r) => slotFor(p.id, r).idx),
        dataSlot: slotWorld(p.id, p.main),
        dataSlotIdx: slotFor(p.id, p.main).idx,
        mats: Array.from({ length: MAX_CLONES }, () =>
          new THREE.MeshStandardMaterial({ color: RUANG_ACCENT[p.main], emissive: RUANG_ACCENT[p.main], emissiveIntensity: 0.15, roughness: 0.45, transparent: true }),
        ),
      })),
    [],
  )

  const relations = useMemo(
    () =>
      DATA.relall
        .filter((r) => r.level !== 'tidak')
        .map((r) => {
          const a = tokens[PROBLEM_ORDER.indexOf(r.a)].ringRel
          const b = tokens[PROBLEM_ORDER.indexOf(r.b)].ringRel
          const mid = a.clone().add(b).multiplyScalar(0.5)
          mid.y += r.level === 'kuat' ? 0.5 : 0.3
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
          return { rel: r, points: curve.getPoints(24) }
        }),
    [tokens],
  )

  const meshRefs = useRef<Array<Array<THREE.Mesh | null>>>(tokens.map(() => []))
  const ringRefs = useRef<Array<THREE.Group | null>>([])
  const ringMats = useMemo(
    () =>
      tokens.map((t) => ({
        bg: new THREE.MeshBasicMaterial({ color: '#888888', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
        outer: new THREE.MeshBasicMaterial({ color: RUANG_ACCENT[t.problem.main], transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
        mid: new THREE.MeshBasicMaterial({ color: '#7fd4dc', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
      })),
    [tokens],
  )
  const ringGeoms = useMemo(
    () =>
      tokens.map((t) => ({
        bg: new THREE.RingGeometry(0.5, 0.58, 48),
        outer: new THREE.RingGeometry(0.5, 0.58, 48, 1, Math.PI / 2, -Math.PI * 2 * t.problem.p_main),
        mid: new THREE.RingGeometry(0.4, 0.46, 48, 1, Math.PI / 2, -Math.PI * 2 * (t.problem.var_same / t.problem.n_var)),
      })),
    [tokens],
  )
  const lineRefs = useRef<Array<LineObj | null>>([])

  const anim = useRef({
    pos: tokens.map(() => Array.from({ length: MAX_CLONES }, (_, c) => (c === 0 ? tokens[0].core.clone() : new THREE.Vector3()))),
    alpha: tokens.map(() => new Float32Array(MAX_CLONES)),
    scale: new Float32Array(tokens.length).fill(0.3),
    ring: 0,
    rel: 0,
    moveT0: 0,
    orbitT: 0,
    orbitSpeed: 1,
    lastReplay: -1,
    lastArrivedMove: false,
    tmpColor: new THREE.Color(),
    tmp: new THREE.Vector3(),
  })

  useEffect(() => {
    // posisi awal di inti
    tokens.forEach((t, i) => anim.current.pos[i].forEach((v) => v.copy(t.core)))
    return () => {
      tokens.forEach((t) => t.mats.forEach((m) => m.dispose()))
      ringMats.forEach((r) => Object.values(r).forEach((m) => m.dispose()))
      ringGeoms.forEach((r) => Object.values(r).forEach((g) => g.dispose()))
    }
  }, [tokens, ringMats, ringGeoms])

  useFrame((_, dt) => {
    const st = useStore.getState()
    const a = anim.current
    const dtc = Math.min(dt, 0.05)
    const now = performance.now()
    const step = stepAt(st.step)
    const kind: StepKind = st.explore ? 'intro' : step.kind
    const activeRuang = kind === 'house' ? HOUSES[step.houseIndex!].id : null
    const pal = currentPalette()

    // animasi pindah ruang
    if (kind === 'move') {
      const arrived = st.phase === 'arrived'
      if ((arrived && !a.lastArrivedMove) || st.moveReplayId !== a.lastReplay) {
        a.moveT0 = now
        a.lastReplay = st.moveReplayId
      }
      a.lastArrivedMove = arrived
    } else {
      a.lastArrivedMove = false
    }
    const moveProgress =
      kind === 'move' && st.phase === 'arrived'
        ? st.reducedMotion
          ? 1
          : clamp((now - a.moveT0 - HOLD_MS) / TRAVEL_MS, 0, 1)
        : 0
    const moveE = easeInOutCubic(moveProgress)

    // inti mengorbit perlahan; berhenti di langkah keyakinan/terkait dan saat prefers-reduced-motion
    const orbitTarget = st.reducedMotion || kind === 'confidence' || kind === 'relations' ? 0 : kind === 'house' ? 0.45 : 1
    a.orbitSpeed += (orbitTarget - a.orbitSpeed) * damp(dtc, 2)
    a.orbitT += dtc * a.orbitSpeed
    const orbitCore = (i: number, out: THREE.Vector3) => {
      const base = tokens[i].core
      const inner = i < 3
      const th = a.orbitT * (inner ? ORBIT_SPEED_INNER : ORBIT_SPEED_OUTER) * (inner ? -1 : 1)
      const c = Math.cos(th)
      const sn = Math.sin(th)
      const bob = Math.sin(a.orbitT * 0.8 + i * 1.3) * 0.18 * a.orbitSpeed
      return out.set(base.x * c - base.z * sn, base.y + bob, base.x * sn + base.z * c)
    }

    tokens.forEach((t, i) => {
      const p = t.problem
      const involved = activeRuang ? p.main === activeRuang || p.support.includes(activeRuang) || p.plan.includes(activeRuang) : true
      const selected = st.selectedProblem
      const hl = st.highlight
      let emph = 1
      if (selected) emph = selected === p.id ? 1.3 : 0.45
      else if (hl) emph = hl.problems.includes(p.id) || hl.ruang.includes(p.main) ? 1.25 : 0.5
      else if (activeRuang) emph = involved ? 1.1 : 0.4

      for (let c = 0; c < MAX_CLONES; c++) {
        const mesh = meshRefs.current[i][c]
        if (!mesh) continue
        const mat = t.mats[c]
        let target: THREE.Vector3
        let alpha = c === 0 ? 1 : 0
        if (kind === 'move') {
          if (c < p.plan.length) {
            const from = t.planSlots[c]
            const to = t.dataSlot
            target = a.tmp.lerpVectors(from, to, moveE)
            target.y += Math.sin(moveE * Math.PI) * 3
            alpha = c === 0 ? 1 : 1 - clamp((moveProgress - 0.8) / 0.2, 0, 1)
            a.tmpColor.set(RUANG_ACCENT[p.plan[c]]).lerp(new THREE.Color(RUANG_ACCENT[p.main]), moveE)
            mat.color.copy(a.tmpColor)
            mat.emissive.copy(a.tmpColor)
          } else {
            target = t.dataSlot
            alpha = 0
          }
          if (p.verdict === 'kurang') alpha *= 0.55
        } else {
          target = kind === 'confidence' ? t.ringConf : kind === 'relations' ? t.ringRel : orbitCore(i, a.tmp)
          mat.color.set(RUANG_ACCENT[p.main])
          mat.emissive.copy(mat.color)
        }
        const pos = a.pos[i][c]
        pos.lerp(target, damp(dtc, kind === 'move' ? 10 : 6))
        mesh.position.copy(pos)
        if (c === 0) tokenLive[i].copy(pos)
        mesh.rotation.y += dtc * 0.6
        const curA = a.alpha[i][c]
        const nextA = curA + (alpha * Math.min(1, emph) - curA) * damp(dtc, 6)
        a.alpha[i][c] = nextA
        mat.opacity = nextA
        mat.emissiveIntensity = 0.15 + 0.5 * Math.max(0, emph - 1)
        mesh.visible = nextA > 0.02
        if (c === 0) {
          const targetScale = (kind === 'confidence' || kind === 'relations' ? 0.36 : kind === 'move' ? 0.46 : 0.3) * (0.8 + 0.2 * emph)
          a.scale[i] += (targetScale - a.scale[i]) * damp(dtc, 6)
        }
        mesh.scale.setScalar(a.scale[i] * (c === 0 ? 1 : 0.85))
      }

      // cincin keyakinan
      const rg = ringRefs.current[i]
      if (rg) {
        rg.position.copy(a.pos[i][0])
        rg.quaternion.copy(camera.quaternion)
        const rm = ringMats[i]
        const targetRing = kind === 'confidence' ? 1 : 0
        a.ring += (targetRing - a.ring) * damp(dtc, 5) * (1 / tokens.length)
        const ringA = clamp(a.ring, 0, 1) * Math.min(1, emph)
        rm.bg.opacity = ringA * 0.25
        rm.bg.color.set(pal.edge)
        rm.outer.opacity = ringA
        rm.mid.opacity = ringA * 0.9
        rg.visible = ringA > 0.02
      }

      // label
      const labelOn =
        kind === 'move' || kind === 'confidence' || kind === 'relations'
          ? 1
          : kind === 'flow' || kind === 'closing' || kind === 'house'
            ? selected === p.id || (hl?.problems.includes(p.id) ? 1 : 0)
              ? 1
              : 0
            : 0
      // label bertingkat per slot supaya tidak saling menumpuk saat beberapa masalah berada di rumah yang sama
      const slotIdx = kind === 'move' ? (moveProgress < 0.5 ? t.planSlotIdx[0] : t.dataSlotIdx) : 0
      const ringIdx = kind === 'confidence' ? PROBLEMS_BY_STABILITY.indexOf(p) : i
      const dy = kind === 'move' ? -(slotIdx % 4) * 22 : kind === 'confidence' || kind === 'relations' ? -(ringIdx % 2) * 20 : 0
      labelAnchors.set(`prob:${p.id}`, {
        position: a.pos[i][0].clone().add(new THREE.Vector3(0, 0.5, 0)),
        opacity: labelOn * Math.min(1, a.alpha[i][0] + 0.2),
        dy,
      })
    })

    // garis relasi
    const relTarget = kind === 'relations' && st.phase === 'arrived' ? 1 : 0
    a.rel += (relTarget - a.rel) * damp(dtc, 4)
    relations.forEach((r, k) => {
      const line = lineRefs.current[k]
      if (!line) return
      const sel = st.selectedProblem
      const mine = !sel || r.rel.a === sel || r.rel.b === sel
      const base = r.rel.level === 'kuat' ? 0.95 : r.rel.level === 'sedang' ? 0.75 : 0.5
      line.material.opacity = a.rel * base * (mine ? 1 : 0.12)
      line.material.color.set(sel && mine ? RUANG_ACCENT[tokens[PROBLEM_ORDER.indexOf(sel)].problem.main] : pal.relation)
      line.visible = a.rel > 0.02
    })
  })

  const onClick = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 4) return
    const kind = stepAt(useStore.getState().step).kind
    if (kind === 'move' || kind === 'load') return
    selectProblem(id)
  }

  return (
    <group>
      {tokens.map((t, i) => (
        <group key={t.problem.id}>
          {t.mats.map((m, c) => (
            <mesh
              key={c}
              ref={(el) => { meshRefs.current[i][c] = el }}
              geometry={TOKEN_GEOM}
              material={m}
              castShadow={c === 0}
              onClick={c === 0 ? onClick(t.problem.id) : undefined}
              onPointerOver={c === 0 ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' } : undefined}
              onPointerOut={c === 0 ? () => { document.body.style.cursor = 'auto' } : undefined}
            />
          ))}
          <group ref={(el) => { ringRefs.current[i] = el }} visible={false}>
            <mesh geometry={ringGeoms[i].bg} material={ringMats[i].bg} />
            <mesh geometry={ringGeoms[i].outer} material={ringMats[i].outer} />
            <mesh geometry={ringGeoms[i].mid} material={ringMats[i].mid} />
          </group>
        </group>
      ))}
      {relations.map((r, k) => (
        <Line
          key={`${r.rel.a}-${r.rel.b}`}
          ref={(el) => { lineRefs.current[k] = el as unknown as LineObj }}
          points={r.points}
          color="#888888"
          lineWidth={r.rel.level === 'kuat' ? 4 : r.rel.level === 'sedang' ? 2.2 : 1.3}
          dashed={r.rel.level === 'lemah'}
          dashSize={0.3}
          gapSize={0.2}
          transparent
          opacity={0}
          depthWrite={false}
        />
      ))}
      <SlotMarkers />
    </group>
  )
}

/** Penanda kecil di tepi alas rumah: berlian isi = masalah mengalir ke sini (data), kaca = hanya rencana tim. */
function SlotMarkers() {
  const markers = useMemo(
    () =>
      HOUSES.flatMap((h, hi) => {
        const slots = houseSlots(h.id)
        return slots.map((s, i) => ({
          key: `${h.id}:${s.problem.id}:${s.kind}`,
          position: houseSlotWorld(hi, i, slots.length, 0.5),
          mat: new THREE.MeshStandardMaterial({
            color: s.kind === 'plan' ? '#ffffff' : h.accent,
            emissive: s.kind === 'plan' ? '#000000' : h.accent,
            emissiveIntensity: 0.1,
            roughness: 0.5,
            transparent: true,
            opacity: s.kind === 'plan' ? 0.35 : s.thin ? 0.55 : 1,
            wireframe: s.kind === 'plan',
          }),
        }))
      }),
    [],
  )
  const groupRef = useRef<THREE.Group>(null)
  const vis = useRef(1)
  useEffect(() => () => markers.forEach((m) => m.mat.dispose()), [markers])
  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    const st = useStore.getState()
    const kind = stepAt(st.step).kind
    const target = kind === 'move' ? 0 : 1
    vis.current += (target - vis.current) * damp(Math.min(dt, 0.05), 5)
    g.visible = vis.current > 0.02
    g.children.forEach((m, i) => {
      const base = markers[i]
      ;(m as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material.opacity =
        (base.mat.wireframe ? 0.35 : 1) * vis.current
      ;(m as THREE.Mesh).rotation.y += dt * 0.4
    })
  })
  return (
    <group ref={groupRef}>
      {markers.map((m) => (
        <mesh key={m.key} geometry={MARKER_GEOM} material={m.mat} position={m.position} scale={0.15} />
      ))}
    </group>
  )
}
