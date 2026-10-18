import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { HOUSES, RUANG_ACCENT, houseSlotWorld, stepAt, type StepKind } from '../config/presentation'
import { CORE_POSITIONS } from '../config/network'
import { DATA, PROBLEMS, PROBLEM_ORDER, houseSlots } from '../data/derive'
import type { Problem } from '../data/types'
import { useStore } from '../store/useStore'
import { damp } from '../utils/math'
import { labelAnchors } from './Labels'
import { currentPalette } from './theme'

const TOKEN_GEOM = new THREE.OctahedronGeometry(1, 0)
const MARKER_GEOM = new THREE.OctahedronGeometry(1, 0)
/** kecepatan orbit inti (rad/detik) untuk cincin dalam & luar */
const ORBIT_SPEED_INNER = 0.16
const ORBIT_SPEED_OUTER = 0.09
const REL_SEGMENTS = 24

/** Posisi hidup token tiap masalah (urutan PROBLEMS), dibaca ConnectionPaths dan CentralNetwork. */
export const tokenLive: THREE.Vector3[] = PROBLEMS.map((_, i) => new THREE.Vector3(...CORE_POSITIONS[i].position))

type LineObj = THREE.Object3D & {
  material: THREE.ShaderMaterial & { opacity: number; color: THREE.Color }
  geometry: { setPositions(arr: Float32Array): unknown }
  computeLineDistances(): unknown
}

interface TokenData {
  problem: Problem
  core: THREE.Vector3
  mat: THREE.MeshStandardMaterial
}

const REL_BASE = { kuat: 0.9, sedang: 0.62, lemah: 0.26, tidak: 0 } as const
const REL_WIDTH = { kuat: 3.2, sedang: 1.9, lemah: 1.1, tidak: 0 } as const

/**
 * Sembilan token masalah yang mengorbit di inti. Sejak awal setiap token membawa:
 * - cincin keyakinan (luar: seberapa sering ruang terdekat tetap sama; dalam: definisi kata solusi yang sepakat),
 * - garis keterkaitan antar masalah (tebal = kuat, tipis = sedang, putus-putus = lemah).
 */
export function ProblemTokens() {
  const camera = useThree((s) => s.camera)
  const selectProblem = useStore((s) => s.selectProblem)

  const tokens = useMemo<TokenData[]>(
    () =>
      PROBLEMS.map((p, i) => ({
        problem: p,
        core: new THREE.Vector3(...CORE_POSITIONS[i].position),
        mat: new THREE.MeshStandardMaterial({ color: RUANG_ACCENT[p.main], emissive: RUANG_ACCENT[p.main], emissiveIntensity: 0.2, roughness: 0.45, transparent: true }),
      })),
    [],
  )

  const relations = useMemo(
    () =>
      DATA.relall
        .filter((r) => r.level !== 'tidak')
        .map((r) => ({
          rel: r,
          ia: PROBLEM_ORDER.indexOf(r.a),
          ib: PROBLEM_ORDER.indexOf(r.b),
          points: Array.from({ length: REL_SEGMENTS + 1 }, () => new THREE.Vector3()),
          buffer: new Float32Array((REL_SEGMENTS + 1) * 3),
        })),
    [],
  )

  const ringMats = useMemo(
    () =>
      tokens.map((t) => ({
        bg: new THREE.MeshBasicMaterial({ color: '#888888', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
        outer: new THREE.MeshBasicMaterial({ color: RUANG_ACCENT[t.problem.main], transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
        mid: new THREE.MeshBasicMaterial({ color: '#8fd9e0', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
      })),
    [tokens],
  )
  const ringGeoms = useMemo(
    () =>
      tokens.map((t) => ({
        bg: new THREE.RingGeometry(0.46, 0.53, 48),
        outer: new THREE.RingGeometry(0.46, 0.53, 48, 1, Math.PI / 2, -Math.PI * 2 * t.problem.p_main),
        mid: new THREE.RingGeometry(0.37, 0.42, 48, 1, Math.PI / 2, -Math.PI * 2 * (t.problem.var_same / t.problem.n_var)),
      })),
    [tokens],
  )

  const meshRefs = useRef<Array<THREE.Mesh | null>>([])
  const ringRefs = useRef<Array<THREE.Group | null>>([])
  const lineRefs = useRef<Array<LineObj | null>>([])

  const anim = useRef({
    pos: tokens.map((t) => t.core.clone()),
    alpha: new Float32Array(tokens.length),
    scale: new Float32Array(tokens.length).fill(0.32),
    relA: new Float32Array(relations.length),
    orbitT: 0,
    orbitSpeed: 1,
    reveal: 0,
    tmp: new THREE.Vector3(),
    mid: new THREE.Vector3(),
    quad: new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()),
  })

  useEffect(
    () => () => {
      tokens.forEach((t) => t.mat.dispose())
      ringMats.forEach((r) => Object.values(r).forEach((m) => m.dispose()))
      ringGeoms.forEach((r) => Object.values(r).forEach((g) => g.dispose()))
    },
    [tokens, ringMats, ringGeoms],
  )

  useFrame((_, dt) => {
    const st = useStore.getState()
    const a = anim.current
    const dtc = Math.min(dt, 0.05)
    const step = stepAt(st.step)
    const kind: StepKind = st.explore ? 'intro' : step.kind
    const activeRuang = kind === 'house' ? HOUSES[step.houseIndex!].id : null
    const sel = st.selectedProblem
    const pal = currentPalette()

    // muncul bertahap saat pembukaan
    a.reveal = st.reducedMotion ? 1 : Math.min(1, a.reveal + dtc / 1.2)

    // inti mengorbit perlahan; melambat saat materi rumah dibaca
    const orbitTarget = st.reducedMotion ? 0 : kind === 'house' ? 0.45 : 1
    a.orbitSpeed += (orbitTarget - a.orbitSpeed) * damp(dtc, 2)
    a.orbitT += dtc * a.orbitSpeed

    tokens.forEach((t, i) => {
      const p = t.problem
      const involved = activeRuang ? p.main === activeRuang || p.support.includes(activeRuang) || p.plan.includes(activeRuang) : true
      let emph = 1
      if (sel) emph = sel === p.id ? 1.3 : 0.45
      else if (activeRuang) emph = involved ? 1.1 : 0.4

      // posisi orbit
      const inner = i < 3
      const th = a.orbitT * (inner ? ORBIT_SPEED_INNER : ORBIT_SPEED_OUTER) * (inner ? -1 : 1)
      const c = Math.cos(th)
      const sn = Math.sin(th)
      const bob = Math.sin(a.orbitT * 0.8 + i * 1.3) * 0.16 * a.orbitSpeed
      a.tmp.set(t.core.x * c - t.core.z * sn, t.core.y + bob, t.core.x * sn + t.core.z * c)
      const pos = a.pos[i]
      pos.lerp(a.tmp, damp(dtc, 6))
      tokenLive[i].copy(pos)

      const mesh = meshRefs.current[i]
      if (mesh) {
        mesh.position.copy(pos)
        mesh.rotation.y += dtc * 0.6
        const targetA = Math.min(1, emph) * a.reveal
        a.alpha[i] += (targetA - a.alpha[i]) * damp(dtc, 6)
        t.mat.opacity = a.alpha[i]
        t.mat.emissiveIntensity = 0.2 + 0.5 * Math.max(0, emph - 1)
        const targetScale = 0.32 * (0.8 + 0.2 * emph) * (0.4 + 0.6 * a.reveal)
        a.scale[i] += (targetScale - a.scale[i]) * damp(dtc, 6)
        mesh.scale.setScalar(a.scale[i])
        mesh.visible = a.alpha[i] > 0.02
      }

      // cincin keyakinan selalu mengikuti token dan menghadap kamera
      const rg = ringRefs.current[i]
      if (rg) {
        rg.position.copy(pos)
        rg.quaternion.copy(camera.quaternion)
        const ringA = a.alpha[i]
        const rm = ringMats[i]
        rm.bg.opacity = ringA * 0.22
        rm.bg.color.set(pal.edge)
        rm.outer.opacity = ringA * 0.95
        rm.mid.opacity = ringA * 0.85
        rg.visible = ringA > 0.02
      }

      labelAnchors.set(`prob:${p.id}`, {
        position: pos.clone().add(new THREE.Vector3(0, 0.62, 0)),
        opacity: sel === p.id ? 1 : 0,
      })
    })

    // garis keterkaitan antar token (ikut bergerak)
    relations.forEach((r, k) => {
      const line = lineRefs.current[k]
      if (!line) return
      const pa = PROBLEMS[r.ia]
      const pb = PROBLEMS[r.ib]
      const touches = sel ? r.rel.a === sel || r.rel.b === sel : true
      const involved = activeRuang
        ? [pa, pb].every((p) => p.main === activeRuang || p.support.includes(activeRuang) || p.plan.includes(activeRuang))
        : true
      const target = REL_BASE[r.rel.level] * (touches ? 1 : 0.08) * (involved ? 1 : 0.15) * a.reveal
      a.relA[k] += (target - a.relA[k]) * damp(dtc, 5)
      const alpha = a.relA[k]
      line.material.opacity = alpha
      line.visible = alpha > 0.02
      line.material.color.set(sel && touches ? RUANG_ACCENT[PROBLEMS[PROBLEM_ORDER.indexOf(sel)].main] : pal.relation)
      if (!line.visible) return
      const va = tokenLive[r.ia]
      const vb = tokenLive[r.ib]
      a.mid.lerpVectors(va, vb, 0.5)
      a.mid.y += r.rel.level === 'kuat' ? 0.45 : 0.3
      a.quad.v0.copy(va)
      a.quad.v1.copy(a.mid)
      a.quad.v2.copy(vb)
      for (let s2 = 0; s2 <= REL_SEGMENTS; s2++) {
        a.quad.getPoint(s2 / REL_SEGMENTS, a.tmp)
        r.buffer[s2 * 3] = a.tmp.x
        r.buffer[s2 * 3 + 1] = a.tmp.y
        r.buffer[s2 * 3 + 2] = a.tmp.z
      }
      line.geometry.setPositions(r.buffer)
      if (r.rel.level === 'lemah') line.computeLineDistances()
    })
  })

  const onClick = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 4) return
    selectProblem(id)
  }

  return (
    <group>
      {tokens.map((t, i) => (
        <group key={t.problem.id}>
          <mesh
            ref={(el) => { meshRefs.current[i] = el }}
            geometry={TOKEN_GEOM}
            material={t.mat}
            castShadow
            onClick={onClick(t.problem.id)}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
          />
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
          lineWidth={REL_WIDTH[r.rel.level]}
          dashed={r.rel.level === 'lemah'}
          dashSize={0.22}
          gapSize={0.14}
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
  useEffect(() => () => markers.forEach((m) => m.mat.dispose()), [markers])
  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    g.children.forEach((m) => { (m as THREE.Mesh).rotation.y += Math.min(dt, 0.05) * 0.4 })
  })
  return (
    <group ref={groupRef}>
      {markers.map((m) => (
        <mesh key={m.key} geometry={MARKER_GEOM} material={m.mat} position={m.position} scale={0.15} />
      ))}
    </group>
  )
}
