import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RUANG_ACCENT, HOUSES, type StepKind } from '../config/presentation'
import { PROBLEM_WORD_EDGES, WORD_EDGES, WORD_NODES } from '../config/network'
import { PROBLEM_BY_ID, PROBLEM_ORDER } from '../data/derive'
import { stepAt } from '../config/presentation'
import { useStore } from '../store/useStore'
import { clamp, damp, easeOutBack } from '../utils/math'
import { NODE_SPHERE } from './geometry'
import { tokenLive } from './ProblemTokens'
import { currentPalette } from './theme'

const N = WORD_NODES.length
const REVEAL_START = 900
const REVEAL_STEP = 40
const REVEAL_DUR = 550
const EDGE_DELAY = 300
const EDGE_DUR = 420
const E_WORD = WORD_EDGES.length
const E_TOTAL = E_WORD + PROBLEM_WORD_EDGES.length

/** Opacity jaringan kata per jenis langkah (inti masalah mendapat panggung pada keyakinan/terkait). */
const WORD_ALPHA: Record<StepKind, number> = {
  intro: 0.9,
  flow: 0.45,
  house: 0.7,
}

/**
 * Jaringan kata: 50 kata teratas (instanced) di sekitar inti + garis tipis (satu LineSegments).
 * Relasi masalah→kata ikut di LineSegments yang sama dan hanya tampil saat masalah/rumahnya disorot.
 */
export function CentralNetwork() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null)

  const data = useMemo(() => {
    const base = WORD_NODES.map((n) => new THREE.Vector3(...n.position))
    const colors = WORD_NODES.map((n) => new THREE.Color(RUANG_ACCENT[n.r]))
    const order = [...WORD_NODES.keys()].sort((a, b) => WORD_NODES[b].f - WORD_NODES[a].f)
    const nodeStart = new Array<number>(N)
    order.forEach((idx, k) => (nodeStart[idx] = REVEAL_START + k * REVEAL_STEP))
    const edgeStart = WORD_EDGES.map(([a, b]) => Math.max(nodeStart[a], nodeStart[b]) + EDGE_DELAY)
    const linePos = new Float32Array(E_TOTAL * 6)
    const lineCol = new Float32Array(E_TOTAL * 6)
    const revealEnd = Math.max(...edgeStart) + EDGE_DUR
    const wordProblems = WORD_NODES.map((_, i) => PROBLEM_WORD_EDGES.filter(([, w]) => w === i).map(([p]) => PROBLEM_ORDER[p]))
    return { base, colors, nodeStart, edgeStart, linePos, lineCol, revealEnd, wordProblems }
  }, [])

  const anim = useRef({
    elapsed: 0,
    motion: 1,
    alpha: 1,
    introSent: false,
    emph: new Float32Array(N).fill(1),
    pwAlpha: new Float32Array(PROBLEM_WORD_EDGES.length),
    dirty: true,
  })

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmp = useMemo(() => new THREE.Color(), [])
  const bgC = useMemo(() => new THREE.Color(), [])
  const edgeC = useMemo(() => new THREE.Color(), [])
  const dimC = useMemo(() => new THREE.Color(), [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    const lines = linesRef.current
    const mat = matRef.current
    const lineMat = lineMatRef.current
    if (!mesh || !lines || !mat || !lineMat) return
    const a = anim.current
    const st = useStore.getState()
    const pal = currentPalette()
    const dtc = Math.min(dt, 0.05)
    const step = stepAt(st.step)
    const kind = step.kind

    const revealing = a.elapsed < data.revealEnd
    if (revealing) {
      a.elapsed += dtc * 1000
      if (st.reducedMotion) a.elapsed = data.revealEnd
    } else if (!a.introSent) {
      a.introSent = true
      st.setIntroDone()
    }

    // gerak lembut; berhenti saat materi rumah dibaca
    const reading = st.phase === 'arrived' && kind === 'house' && !st.explore
    const targetMotion = reading || st.reducedMotion ? 0 : 1
    a.motion += (targetMotion - a.motion) * damp(dtc, 2.5)
    if (Math.abs(a.motion - targetMotion) < 0.002) a.motion = targetMotion

    // opacity keseluruhan per langkah
    const targetAlpha = st.explore ? 1 : WORD_ALPHA[kind]
    const prevAlpha = a.alpha
    a.alpha += (targetAlpha - a.alpha) * damp(dtc, 4)
    if (Math.abs(a.alpha - targetAlpha) < 0.003) a.alpha = targetAlpha
    mat.opacity = a.alpha
    const wantTransparent = a.alpha < 0.999
    if (mat.transparent !== wantTransparent) {
      mat.transparent = wantTransparent
      mat.needsUpdate = true
    }
    mat.depthWrite = a.alpha > 0.5
    // garis memakai opacity material (bukan lerp ke warna latar) agar tetap benar di atas objek lain
    lineMat.opacity = a.alpha * 0.9

    // penekanan per kata: rumah aktif / masalah terpilih / sorotan takeaway
    const activeRuang = kind === 'house' && !st.explore ? HOUSES[step.houseIndex!].id : null
    const selected = st.selectedProblem
    let emphChanging = false
    for (let i = 0; i < N; i++) {
      const w = WORD_NODES[i]
      let target = 1
      if (activeRuang) target = w.r === activeRuang ? 1 : 0.35
      else if (selected) target = data.wordProblems[i].includes(selected) ? 1.25 : 0.4
      const cur = a.emph[i]
      if (cur !== target) {
        let next = cur + (target - cur) * damp(dtc, 5)
        if (Math.abs(next - target) < 0.003) next = target
        a.emph[i] = next
        emphChanging = true
      }
    }
    // relasi masalah→kata
    let pwChanging = false
    PROBLEM_WORD_EDGES.forEach(([p], e) => {
      const pid = PROBLEM_ORDER[p]
      const prob = PROBLEM_BY_ID[pid]
      let target = 0
      if (selected === pid) target = 0.9
      else if (activeRuang && (prob.main === activeRuang || prob.support.includes(activeRuang))) target = 0.55
      else if (kind === 'flow' && !selected) target = 0.18
      const cur = a.pwAlpha[e]
      if (cur !== target) {
        let next = cur + (target - cur) * damp(dtc, 5)
        if (Math.abs(next - target) < 0.003) next = target
        a.pwAlpha[e] = next
        pwChanging = true
      }
    })

    const t = a.elapsed / 1000
    // posisi diperbarui tiap frame karena inti masalah mengorbit (murah: 50 node, ~125 garis)
    const updateMatrices = true
    const updateColors = revealing || emphChanging || pwChanging || a.dirty || prevAlpha !== a.alpha

    if (updateMatrices) {
      for (let i = 0; i < N; i++) {
        const node = WORD_NODES[i]
        const p = data.base[i]
        const reveal = clamp((a.elapsed - data.nodeStart[i]) / REVEAL_DUR, 0, 1)
        // kata mengecil saat jaringan diredupkan (keyakinan/terkait) agar inti masalah mendapat panggung
        const s = node.size * easeOutBack(reveal) * (0.75 + 0.25 * a.emph[i]) * (0.35 + 0.65 * a.alpha)
        const bob = Math.sin(t * 0.7 + i * 0.9) * 0.06 * a.motion
        dummy.position.set(p.x, p.y + bob, p.z)
        dummy.scale.setScalar(Math.max(s, 0.0001))
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        const pos = data.linePos
        WORD_EDGES.forEach(([ea, eb], e) => {
          if (ea === i) {
            pos[e * 6] = p.x; pos[e * 6 + 1] = p.y + bob; pos[e * 6 + 2] = p.z
          } else if (eb === i) {
            pos[e * 6 + 3] = p.x; pos[e * 6 + 4] = p.y + bob; pos[e * 6 + 5] = p.z
          }
        })
        PROBLEM_WORD_EDGES.forEach(([pi, wi], e) => {
          if (wi !== i) return
          const k = (E_WORD + e) * 6
          const c = tokenLive[pi]
          pos[k] = c.x; pos[k + 1] = c.y; pos[k + 2] = c.z
          pos[k + 3] = p.x; pos[k + 4] = p.y + bob; pos[k + 5] = p.z
        })
      }
      mesh.instanceMatrix.needsUpdate = true
      ;(lines.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    }

    if (updateColors) {
      bgC.set(pal.background)
      edgeC.set(pal.edge)
      dimC.set(pal.dim)
      for (let i = 0; i < N; i++) {
        const e = a.emph[i]
        tmp.copy(data.colors[i])
        if (e < 1) tmp.lerp(dimC, (1 - e) * 0.8)
        else if (e > 1) tmp.lerp(new THREE.Color('#ffffff'), (e - 1) * 0.8)
        mesh.setColorAt(i, tmp)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

      const col = data.lineCol
      const write = (e: number, c: THREE.Color) => {
        for (let k = 0; k < 2; k++) {
          col[e * 6 + k * 3] = c.r
          col[e * 6 + k * 3 + 1] = c.g
          col[e * 6 + k * 3 + 2] = c.b
        }
      }
      WORD_EDGES.forEach(([ea, eb], e) => {
        const reveal = clamp((a.elapsed - data.edgeStart[e]) / EDGE_DUR, 0, 1)
        const em = Math.min(a.emph[ea], a.emph[eb])
        tmp.copy(edgeC)
        if (em < 1) tmp.lerp(dimC, (1 - em) * 0.9)
        else if (em > 1) tmp.lerp(data.colors[ea], Math.min(1, (em - 1) * 2.5))
        tmp.lerp(bgC, 1 - reveal)
        write(e, tmp)
      })
      PROBLEM_WORD_EDGES.forEach(([, wi], e) => {
        tmp.copy(data.colors[wi]).lerp(bgC, 1 - a.pwAlpha[e])
        write(E_WORD + e, tmp)
      })
      ;(lines.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
      a.dirty = false
    }
  })

  return (
    <group>
      <instancedMesh ref={meshRef} args={[NODE_SPHERE, undefined, N]} frustumCulled={false}>
        <meshStandardMaterial ref={matRef} color="#ffffff" roughness={0.55} metalness={0} />
      </instancedMesh>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.linePos, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.lineCol, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMatRef} vertexColors toneMapped={false} transparent opacity={0.9} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
