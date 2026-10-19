import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HOUSES, housePosition, houseRotationY, stepAt } from '../config/presentation'
import { FAIRY_PHRASES } from '../data/narrative'
import { useStore } from '../store/useStore'
import { labelAnchors, labelElements } from './Labels'

type Species = 'noibat' | 'woobat' | 'zubat'
/** Spesies per rumah (urutan HOUSES). */
const SPECIES: Species[] = ['zubat', 'noibat', 'woobat', 'zubat', 'noibat']

const SPHERE = new THREE.SphereGeometry(1, 16, 12)
const CONE = new THREE.ConeGeometry(1, 1, 8)
const DISC = new THREE.CircleGeometry(1, 16)

/** Bentuk sayap kelelawar bergerigi (local x = bentang keluar, y = tinggi), pangkal di (0,0). */
function makeWing(len: number, h: number) {
  const s = new THREE.Shape()
  s.moveTo(0, 0.05 * h)
  s.lineTo(0.55 * len, 0.75 * h)
  s.lineTo(len, 0.55 * h)
  s.lineTo(0.9 * len, 0.1 * h)
  s.lineTo(0.65 * len, -0.3 * h)
  s.lineTo(0.42 * len, -0.1 * h)
  s.lineTo(0.2 * len, -0.42 * h)
  s.lineTo(0, -0.12 * h)
  s.closePath()
  return new THREE.ShapeGeometry(s)
}
const WING_BIG = makeWing(0.55, 0.42)
const WING_SMALL = makeWing(0.3, 0.26)

interface Palette {
  body: string
  wing: string
  accent: string
  eye?: string
}
const PALETTE: Record<Species, Palette> = {
  zubat: { body: '#5a86d8', wing: '#7b4fa8', accent: '#f6f1ff' },
  noibat: { body: '#7c5bb8', wing: '#2c2340', accent: '#f0d45e', eye: '#f0d45e' },
  woobat: { body: '#cfe3f3', wing: '#2a3340', accent: '#f08bb0', eye: '#2a3340' },
}

interface Bat {
  species: Species
  base: THREE.Vector3
  rot: number
  phase: number
  speed: number
  radius: number
  height: number
  nextPhrase: number
  phraseUntil: number
  phraseIdx: number
  // --- fisika terbang ---
  ang: number
  pos: THREE.Vector3
  vel: THREE.Vector3
  yaw: number
  pitch: number
  roll: number
  /** manuver: 'glide' terbang biasa, 'swoop' menukik, 'hover' melayang di tempat */
  mode: 'glide' | 'swoop' | 'hover'
  modeUntil: number
  modeT0: number
  nextManeuver: number
  flapPhase: number
  seed: number
}

/** Model prosedural tiap spesies; grup menghadap +z (arah gerak). */
function BatModel({ species, wingRefs }: { species: Species; wingRefs: (el: THREE.Mesh | null, side: 0 | 1) => void }) {
  const p = PALETTE[species]
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: p.body, roughness: 0.85 }),
      wing: new THREE.MeshStandardMaterial({ color: p.wing, roughness: 0.9, side: THREE.DoubleSide }),
      accent: new THREE.MeshStandardMaterial({ color: p.accent, roughness: 0.6, emissive: p.accent, emissiveIntensity: species === 'noibat' ? 0.5 : 0.05 }),
      dark: new THREE.MeshStandardMaterial({ color: '#1d1726', roughness: 0.9 }),
      eye: new THREE.MeshStandardMaterial({ color: p.eye ?? '#000000', emissive: p.eye ?? '#000000', emissiveIntensity: 0.6, roughness: 0.4 }),
    }),
    [p, species],
  )
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const wing = (side: 0 | 1, geom: THREE.BufferGeometry, x: number, y: number) => (
    <mesh ref={(el) => wingRefs(el, side)} geometry={geom} material={mats.wing} position={[side === 0 ? -x : x, y, 0]} scale={[side === 0 ? -1 : 1, 1, 1]} castShadow />
  )

  if (species === 'zubat') {
    return (
      <group>
        <mesh geometry={SPHERE} material={mats.body} scale={[0.19, 0.17, 0.19]} castShadow />
        {/* telinga tinggi */}
        <mesh geometry={CONE} material={mats.body} scale={[0.07, 0.22, 0.05]} position={[-0.09, 0.22, 0]} rotation-z={0.25} />
        <mesh geometry={CONE} material={mats.body} scale={[0.07, 0.22, 0.05]} position={[0.09, 0.22, 0]} rotation-z={-0.25} />
        <mesh geometry={CONE} material={mats.wing} scale={[0.035, 0.12, 0.025]} position={[-0.09, 0.2, 0.01]} rotation-z={0.25} />
        <mesh geometry={CONE} material={mats.wing} scale={[0.035, 0.12, 0.025]} position={[0.09, 0.2, 0.01]} rotation-z={-0.25} />
        {/* mulut terbuka + taring; tanpa mata */}
        <mesh geometry={DISC} material={mats.dark} scale={[0.07, 0.05, 1]} position={[0, -0.04, 0.185]} />
        <mesh geometry={CONE} material={mats.accent} scale={[0.015, 0.04, 0.012]} position={[-0.035, -0.045, 0.19]} rotation-x={Math.PI} />
        <mesh geometry={CONE} material={mats.accent} scale={[0.015, 0.04, 0.012]} position={[0.035, -0.045, 0.19]} rotation-x={Math.PI} />
        {/* kaki kecil */}
        <mesh geometry={CONE} material={mats.body} scale={[0.03, 0.09, 0.03]} position={[-0.05, -0.2, 0]} rotation-x={Math.PI} />
        <mesh geometry={CONE} material={mats.body} scale={[0.03, 0.09, 0.03]} position={[0.05, -0.2, 0]} rotation-x={Math.PI} />
        {wing(0, WING_BIG, 0.14, 0.02)}
        {wing(1, WING_BIG, 0.14, 0.02)}
      </group>
    )
  }
  if (species === 'woobat') {
    return (
      <group>
        {/* tubuh bulat berbulu */}
        <mesh geometry={SPHERE} material={mats.body} scale={0.24} castShadow />
        {[0.9, 2.1, 3.4, 4.6, 5.7].map((a, i) => (
          <mesh key={i} geometry={SPHERE} material={mats.body} scale={0.07} position={[Math.cos(a) * 0.22, Math.sin(a) * 0.22 * 0.6 + 0.08, -0.04]} />
        ))}
        {/* hidung bentuk hati */}
        <mesh geometry={SPHERE} material={mats.accent} scale={[0.035, 0.03, 0.02]} position={[-0.028, 0.0, 0.235]} />
        <mesh geometry={SPHERE} material={mats.accent} scale={[0.035, 0.03, 0.02]} position={[0.028, 0.0, 0.235]} />
        <mesh geometry={CONE} material={mats.accent} scale={[0.06, 0.05, 0.02]} position={[0, -0.035, 0.235]} rotation-x={Math.PI} />
        {/* satu mata mengintip dari balik bulu + taring kecil */}
        <mesh geometry={SPHERE} material={mats.eye} scale={0.02} position={[-0.075, 0.045, 0.225]} />
        <mesh geometry={CONE} material={mats.accent} scale={[0.012, 0.03, 0.01]} position={[0.04, -0.07, 0.235]} rotation-x={Math.PI} />
        {/* ekor berujung hati */}
        <mesh geometry={CONE} material={mats.dark} scale={[0.015, 0.16, 0.015]} position={[0, -0.12, -0.22]} rotation-x={-0.9} />
        <mesh geometry={SPHERE} material={mats.accent} scale={0.03} position={[0, -0.19, -0.3]} />
        {wing(0, WING_SMALL, 0.17, 0.06)}
        {wing(1, WING_SMALL, 0.17, 0.06)}
      </group>
    )
  }
  // noibat
  return (
    <group>
      <mesh geometry={SPHERE} material={mats.body} scale={[0.17, 0.16, 0.17]} castShadow />
      {/* dada putih berbulu */}
      <mesh geometry={SPHERE} material={new THREE.MeshStandardMaterial({ color: '#f4f1f9', roughness: 0.9 })} scale={[0.1, 0.09, 0.06]} position={[0, -0.05, 0.13]} />
      {/* telinga raksasa dengan bagian dalam kuning */}
      {[-1, 1].map((sgn) => (
        <group key={sgn} position={[sgn * 0.12, 0.2, -0.02]} rotation-z={-sgn * 0.55}>
          <mesh geometry={SPHERE} material={mats.body} scale={[0.1, 0.17, 0.05]} />
          <mesh geometry={SPHERE} material={mats.accent} scale={[0.065, 0.12, 0.03]} position-z={0.03} />
        </group>
      ))}
      {/* mata kuning besar */}
      <mesh geometry={SPHERE} material={mats.eye} scale={[0.035, 0.045, 0.02]} position={[-0.06, 0.03, 0.165]} />
      <mesh geometry={SPHERE} material={mats.eye} scale={[0.035, 0.045, 0.02]} position={[0.06, 0.03, 0.165]} />
      <mesh geometry={SPHERE} material={mats.dark} scale={[0.012, 0.03, 0.01]} position={[-0.06, 0.03, 0.182]} />
      <mesh geometry={SPHERE} material={mats.dark} scale={[0.012, 0.03, 0.01]} position={[0.06, 0.03, 0.182]} />
      {/* mulut lebar + taring */}
      <mesh geometry={DISC} material={mats.dark} scale={[0.06, 0.025, 1]} position={[0, -0.03, 0.172]} />
      <mesh geometry={CONE} material={mats.accent} scale={[0.012, 0.03, 0.01]} position={[-0.03, -0.035, 0.176]} rotation-x={Math.PI} />
      <mesh geometry={CONE} material={mats.accent} scale={[0.012, 0.03, 0.01]} position={[0.03, -0.035, 0.176]} rotation-x={Math.PI} />
      {/* kaki */}
      <mesh geometry={CONE} material={mats.body} scale={[0.028, 0.08, 0.028]} position={[-0.05, -0.18, 0]} rotation-x={Math.PI} />
      <mesh geometry={CONE} material={mats.body} scale={[0.028, 0.08, 0.028]} position={[0.05, -0.18, 0]} rotation-x={Math.PI} />
      {wing(0, WING_BIG, 0.13, 0.03)}
      {wing(1, WING_BIG, 0.13, 0.03)}
    </group>
  )
}

/** Kelelawar kecil (terinspirasi Noibat, Woobat, Zubat) terbang mengitari tiap rumah dan sesekali memberi semangat. */
export function Bats() {
  const bats = useMemo<Bat[]>(
    () =>
      HOUSES.map((_, i) => ({
        species: SPECIES[i % SPECIES.length],
        base: housePosition(i),
        rot: houseRotationY(i),
        phase: i * 1.7,
        speed: 0.38 + (i % 3) * 0.07,
        radius: 3.1 + (i % 2) * 0.25,
        height: 2.4 + (i % 3) * 0.25,
        nextPhrase: 3 + i * 2.3,
        phraseUntil: 0,
        phraseIdx: i % FAIRY_PHRASES.length,
        ang: i * 1.7,
        pos: housePosition(i).add(new THREE.Vector3(3, 2.6, 0)),
        vel: new THREE.Vector3(),
        yaw: 0,
        pitch: 0,
        roll: 0,
        mode: 'glide',
        modeUntil: 0,
        modeT0: 0,
        nextManeuver: 4 + i * 1.9,
        flapPhase: i * 2.1,
        seed: i * 0.73,
      })),
    [],
  )
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const wingRefs = useRef<Array<[THREE.Mesh | null, THREE.Mesh | null]>>(HOUSES.map(() => [null, null]))

  const tmp = useMemo(() => ({ target: new THREE.Vector3(), euler: new THREE.Euler(0, 0, 0, 'YXZ'), q: new THREE.Quaternion() }), [])

  useFrame((state, dt) => {
    const st = useStore.getState()
    const dtc = Math.min(dt, 0.05)
    const reduce = st.reducedMotion
    const step = stepAt(st.step)
    const activeHouse = !st.explore && step.kind === 'house' ? step.houseIndex! : -1
    const clock = state.clock.elapsedTime

    bats.forEach((b, i) => {
      const g = groupRefs.current[i]
      if (!g) return

      // --- pilih manuver ---
      if (!reduce && clock > b.nextManeuver && b.mode === 'glide') {
        const r = Math.random()
        b.mode = r < 0.55 ? 'swoop' : 'hover'
        b.modeT0 = clock
        b.modeUntil = clock + (b.mode === 'swoop' ? 2.4 : 1.6 + Math.random())
      }
      if (b.mode !== 'glide' && clock > b.modeUntil) {
        b.mode = 'glide'
        b.nextManeuver = clock + 5 + Math.random() * 7
      }
      const u = b.mode === 'glide' ? 0 : THREE.MathUtils.clamp((clock - b.modeT0) / (b.modeUntil - b.modeT0), 0, 1)
      const bump = Math.sin(u * Math.PI)

      // --- kecepatan sudut: bervariasi, melesat saat menukik, nyaris diam saat melayang ---
      let speedMul = 1 + 0.35 * Math.sin(clock * 0.6 + b.seed * 7)
      if (b.mode === 'swoop') speedMul *= 1 + 0.9 * bump
      if (b.mode === 'hover') speedMul *= 0.12
      if (!reduce) b.ang += dtc * b.speed * speedMul

      // --- titik tuju: lingkaran + pengembaraan + manuver ---
      const wanderR = 0.55 * Math.sin(0.9 * clock + b.seed * 5) + 0.3 * Math.sin(1.7 * clock + b.seed * 9)
      const wanderY = 0.45 * Math.sin(1.3 * clock + b.seed * 3) + 0.22 * Math.sin(2.3 * clock + b.seed * 11)
      let r = b.radius + wanderR
      let y = b.height + wanderY
      if (b.mode === 'swoop') {
        r -= 0.9 * bump
        y -= 1.5 * bump
      }
      if (b.mode === 'hover') y += 0.25 * Math.sin(clock * 9 + b.seed) + 0.3 * bump
      const lx = Math.cos(b.ang) * r
      const lz = Math.sin(b.ang) * r
      const wx = lx * Math.cos(b.rot) + lz * Math.sin(b.rot)
      const wz = -lx * Math.sin(b.rot) + lz * Math.cos(b.rot)
      tmp.target.set(b.base.x + wx, y, b.base.z + wz)

      // --- gerak: mengejar titik tuju dengan redaman (gerak jadi melengkung, tidak kaku) ---
      const prevX = b.pos.x
      const prevY = b.pos.y
      const prevZ = b.pos.z
      b.pos.lerp(tmp.target, 1 - Math.exp(-dtc * (b.mode === 'swoop' ? 7 : 4.5)))
      if (dtc > 0) {
        b.vel.set((b.pos.x - prevX) / dtc, (b.pos.y - prevY) / dtc, (b.pos.z - prevZ) / dtc)
      }
      g.position.copy(b.pos)

      // --- orientasi dari kecepatan: menghadap arah gerak, mendongak saat naik, miring saat belok ---
      const speed = b.vel.length()
      if (speed > 0.05) {
        const targetYaw = Math.atan2(b.vel.x, b.vel.z)
        let dy = targetYaw - b.yaw
        dy = Math.atan2(Math.sin(dy), Math.cos(dy))
        const yawRate = dy / Math.max(dtc, 1e-3)
        b.yaw += dy * (1 - Math.exp(-dtc * 8))
        const targetPitch = -Math.asin(THREE.MathUtils.clamp(b.vel.y / speed, -1, 1)) * 0.8
        b.pitch += (targetPitch - b.pitch) * (1 - Math.exp(-dtc * 6))
        const targetRoll = THREE.MathUtils.clamp(-yawRate * 0.12, -0.75, 0.75)
        b.roll += (targetRoll - b.roll) * (1 - Math.exp(-dtc * 5))
      } else {
        b.roll += (0 - b.roll) * (1 - Math.exp(-dtc * 4))
        b.pitch += (0.15 * Math.sin(clock * 3 + b.seed) - b.pitch) * (1 - Math.exp(-dtc * 4))
      }
      tmp.euler.set(b.pitch, b.yaw, b.roll)
      g.quaternion.setFromEuler(tmp.euler)
      // sedikit goyang tubuh mengikuti kepakan
      g.position.y += Math.sin(b.flapPhase) * 0.02

      // --- kepak sayap: lebih cepat saat melayang/menanjak, melebar saat meluncur turun ---
      const climbing = THREE.MathUtils.clamp(b.vel.y / 2, -1, 1)
      const baseHz = b.species === 'woobat' ? 15 : 10
      const hz = b.mode === 'hover' ? baseHz * 1.6 : baseHz * (1 + 0.5 * Math.max(0, climbing) + 0.4 * (speedMul - 1))
      if (!reduce) b.flapPhase += dtc * hz
      const amp = b.mode === 'swoop' && climbing < -0.3 ? 0.35 : 0.85
      const flap = reduce ? 0.3 : Math.sin(b.flapPhase) * amp
      const [wl, wr] = wingRefs.current[i]
      if (wl) wl.rotation.z = -0.15 - flap * 0.9
      if (wr) wr.rotation.z = 0.15 + flap * 0.9

      // --- gelembung semangat (lebih sering saat melayang) ---
      const key = `fairy:${HOUSES[i].id}`
      if (clock > b.nextPhrase || (b.mode === 'hover' && u < 0.05 && clock > b.phraseUntil)) {
        b.phraseIdx = (b.phraseIdx + 1 + Math.floor(Math.random() * 2)) % FAIRY_PHRASES.length
        b.phraseUntil = clock + 2.4
        b.nextPhrase = clock + (activeHouse === i ? 5 : 9) + Math.random() * 5
        const el = labelElements.get(key)
        if (el) el.textContent = FAIRY_PHRASES[b.phraseIdx]
      }
      const showing = clock < b.phraseUntil && (activeHouse < 0 || activeHouse === i)
      labelAnchors.set(key, { position: g.position.clone().add(new THREE.Vector3(0, 0.55, 0)), opacity: showing ? 1 : 0 })
    })
  })

  return (
    <group>
      {bats.map((b, i) => (
        <group key={HOUSES[i].id} ref={(el) => { groupRefs.current[i] = el }} scale={1.45}>
          <BatModel species={b.species} wingRefs={(el, side) => { wingRefs.current[i][side] = el }} />
        </group>
      ))}
    </group>
  )
}
