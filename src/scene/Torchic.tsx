import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { buildTube, deformedSphere, paintVertices, smoothstep } from './procgeo'

/**
 * Torchic chibi prosedural (tanpa aset). Tinggi ≈ 0.95 tanpa jambul, kaki di y=0, menghadap +z.
 * Kepala & badan dari bola terdeformasi, jambul tiga helai daun bervolume dengan aksen kuning (vertex color),
 * paruh dua bagian bervolume, sayap mungil berlobus, kaki pendek berjari.
 */

const ORANGE = new THREE.Color('#f28c2b')
const GOLD = new THREE.Color('#f6c445')
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const lerp = THREE.MathUtils.lerp

const HEAD_Y = 0.62

/** Helai bulu berbentuk daun: pangkal berisi, meruncing lembut, penampang agak pipih, sedikit melengkung. */
function leafGeometry(curl: number) {
  const g = deformedSphere(20, 18, (p) => {
    const h = (p.y + 1) / 2
    const w = 1 - 0.72 * smoothstep(0.25, 1, h) + 0.25 * Math.sin(Math.PI * h) * (1 - h)
    p.x *= w
    p.z *= 0.42 * w
    p.y = h * 1.15
    p.z += curl * h * h
  })
  paintVertices(g, (p, _n, out) => {
    const h = THREE.MathUtils.clamp(p.y / 1.15, 0, 1)
    const w = Math.max(0.08, 1 - 0.72 * smoothstep(0.25, 1, h))
    const stripe = 1 - smoothstep(0.22, 0.38, Math.abs(p.x) / w)
    out.copy(ORANGE).lerp(GOLD, stripe * smoothstep(0.05, 0.3, h))
  })
  return g
}

export function TorchicModel() {
  const mats = useMemo(
    () => ({
      orange: new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.6, metalness: 0 }),
      skin: new THREE.MeshStandardMaterial({ vertexColors: true, color: '#ffffff', roughness: 0.6, metalness: 0 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.6, metalness: 0 }),
      leg: new THREE.MeshStandardMaterial({ color: '#f0a63a', roughness: 0.65 }),
      beak: new THREE.MeshStandardMaterial({ color: '#f7cc4e', roughness: 0.5 }),
      eye: new THREE.MeshStandardMaterial({ color: '#141010', roughness: 0.15, metalness: 0.05 }),
      white: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: '#6b2a22', roughness: 0.7 }),
      tongue: new THREE.MeshStandardMaterial({ color: '#f08a9a', roughness: 0.6 }),
      blush: new THREE.MeshStandardMaterial({ color: '#ffb48a', roughness: 0.9, transparent: true, opacity: 0.4 }),
    }),
    [],
  )

  const geo = useMemo(() => {
    // kepala: oval lebar, pipi bawah penuh, dahi membulat, wajah depan agak datar, dagu pendek
    const head = deformedSphere(48, 36, (p) => {
      const cheek = smoothstep(0.3, -0.6, p.y) * (1 - Math.abs(p.z) * 0.4)
      p.x *= 1 + 0.14 * cheek
      if (p.z > 0) p.z *= 0.9
      p.y *= 0.96
      if (p.y < -0.7) p.z *= 0.94
    })
    // badan: telur pendek, penuh di bawah, bahu sempit
    const body = deformedSphere(40, 30, (p) => {
      const low = smoothstep(0.6, -0.9, p.y)
      p.x *= 1 + 0.14 * low
      p.z *= 1 + 0.12 * low
      p.x *= 1 - 0.12 * smoothstep(0.2, 1, p.y)
      if (p.y < -0.8) {
        p.x *= 0.92
        p.z *= 0.92
      }
    })
    // paruh: pangkal lebar, cembung atas, meruncing ke ujung membulat
    const beakUpper = deformedSphere(20, 14, (p) => {
      const f = (p.z + 1) / 2
      p.x *= 1 - 0.55 * f
      p.y *= (p.y > 0 ? 0.55 : 0.3) * (1 - 0.35 * f)
      p.z = f * 1.2
    })
    const beakLower = deformedSphere(20, 14, (p) => {
      const f = (p.z + 1) / 2
      p.x *= 0.85 * (1 - 0.55 * f)
      p.y *= (p.y > 0 ? 0.25 : 0.45) * (1 - 0.35 * f)
      p.z = f * 1.0
    })
    // sayap mungil: tiga lobus yang menyatu di pangkal
    const wing = deformedSphere(22, 16, (p) => {
      const h = (p.y + 1) / 2
      const lobe = 1 + 0.18 * Math.cos(3 * Math.atan2(p.z, p.x)) * smoothstep(0.4, 1, h)
      p.x *= (1 - 0.3 * smoothstep(0.3, 1, h)) * lobe
      p.z *= 0.45 * lobe
      p.y = h * 1.1
    })
    const legL = buildTube(new THREE.CatmullRomCurve3([V(-0.09, 0.14, 0.02), V(-0.1, 0.08, 0.03), V(-0.1, 0.03, 0.04)]), 8, 10, (t) => lerp(0.04, 0.03, t))
    const legR = buildTube(new THREE.CatmullRomCurve3([V(0.09, 0.14, 0.02), V(0.1, 0.08, 0.03), V(0.1, 0.03, 0.04)]), 8, 10, (t) => lerp(0.04, 0.03, t))
    return {
      head, body, beakUpper, beakLower, wing, legL, legR,
      crestMid: leafGeometry(0.25), crestSide: leafGeometry(0.4),
      sphere: new THREE.SphereGeometry(1, 24, 18),
      toe: new THREE.CapsuleGeometry(0.018, 0.045, 4, 8),
    }
  }, [])

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose())
      Object.values(geo).forEach((g) => g.dispose())
    },
    [mats, geo],
  )

  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const crest = useRef<THREE.Group>(null)
  const beakLower = useRef<THREE.Mesh>(null)
  const wingL = useRef<THREE.Group>(null)
  const wingR = useRef<THREE.Group>(null)
  const lidRefs = useRef<Array<THREE.Mesh | null>>([null, null])
  const anim = useRef({ blinkNext: 2.2, blinkUntil: 0, hopT0: -10, clock: 0, headYaw: 0, crestLag: 0 })
  const seed = 5.3

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime + seed
    const dtc = Math.min(dt, 0.05)
    const reduce = useStore.getState().reducedMotion
    const amp = reduce ? 0.3 : 1
    const a = anim.current
    a.clock = state.clock.elapsedTime

    // lompatan pendek saat diklik: tekuk → terangkat → mendarat lembut (1.0 s)
    const u = THREE.MathUtils.clamp((state.clock.elapsedTime - a.hopT0) / 1.0, 0, 1)
    let hopY = 0
    let squash = 1
    if (u < 1) {
      if (u < 0.2) squash = 1 - 0.12 * Math.sin((u / 0.2) * Math.PI)
      else if (u < 0.75) hopY = Math.sin(((u - 0.2) / 0.55) * Math.PI) * 0.18
      else squash = 1 - 0.08 * Math.sin(((u - 0.75) / 0.25) * Math.PI)
    }
    const flap = u < 1 ? Math.sin(state.clock.elapsedTime * 22) * 0.6 : Math.sin(t * 1.3) * 0.04 * amp

    if (root.current) {
      root.current.position.y = hopY
      root.current.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash))
    }
    if (body.current) body.current.scale.set(1 + Math.sin(t * 2.3) * 0.015 * amp, 1 + Math.sin(t * 2.3) * 0.02 * amp, 1)
    const yaw = Math.sin(t * 0.55) * 0.16 * amp
    if (head.current) head.current.rotation.set(Math.sin(t * 0.85) * 0.04 * amp, yaw, 0.1 + Math.sin(t * 0.7) * 0.03 * amp)
    // jambul mengikuti kepala dengan sedikit keterlambatan
    a.crestLag += (yaw - a.crestLag) * (1 - Math.exp(-dtc * 4))
    if (crest.current) crest.current.rotation.set(Math.sin(t * 1.1) * 0.03 * amp, (a.crestLag - yaw) * 1.6, -(a.crestLag - yaw) * 0.8)
    if (wingL.current) wingL.current.rotation.set(0, 0, 0.55 + flap)
    if (wingR.current) wingR.current.rotation.set(0, 0, -0.55 - flap)
    if (beakLower.current) beakLower.current.rotation.x = 0.22 + (u < 1 ? 0.2 : 0) + Math.max(0, Math.sin(t * 0.9)) * 0.06 * amp

    if (t > a.blinkNext) {
      a.blinkUntil = t + 0.14
      a.blinkNext = t + 2.2 + Math.random() * 2.6
    }
    const closing = t < a.blinkUntil ? 1 - Math.abs((a.blinkUntil - t) / 0.07 - 1) : 0
    lidRefs.current.forEach((lid) => {
      if (!lid) return
      lid.visible = closing > 0.03
      lid.position.y = 0.1 - 0.1 * closing
    })
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 4) return
    anim.current.hopT0 = anim.current.clock
  }

  /** mata oval vertikal, sedikit rendah di wajah, cembung tipis, basis tanpa puntiran */
  const eye = (side: 1 | -1) => {
    const d = new THREE.Vector3(Math.sin(side * 0.5), -0.06, Math.cos(side * 0.5)).normalize()
    const pos = d.clone().multiplyScalar(0.27)
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(d, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)))
    return (
      <group key={`eye${side}`} position={pos} quaternion={q}>
        <mesh geometry={geo.sphere} material={mats.eye} scale={[0.05, 0.068, 0.022]} />
        <mesh geometry={geo.sphere} material={mats.white} scale={0.017} position={[side * -0.014, 0.022, 0.018]} />
        <mesh geometry={geo.sphere} material={mats.white} scale={0.007} position={[side * 0.01, -0.018, 0.018]} />
        <mesh ref={(el) => { lidRefs.current[side === 1 ? 1 : 0] = el }} geometry={geo.sphere} material={mats.orange} scale={[0.056, 0.074, 0.026]} position={[0, 0.1, -0.004]} visible={false} />
        <mesh geometry={geo.sphere} material={mats.blush} scale={[0.04, 0.022, 0.008]} position={[side * 0.03, -0.085, -0.01]} />
      </group>
    )
  }

  const foot = (side: 1 | -1) => (
    <group key={`foot${side}`} position={[side * 0.1, 0.02, 0.05]} rotation-y={side * 0.2}>
      <mesh geometry={geo.sphere} material={mats.leg} scale={[0.035, 0.02, 0.035]} />
      {[-1, 0, 1].map((k) => (
        <mesh key={k} geometry={geo.toe} material={mats.leg} position={[k * 0.03, 0, 0.045]} rotation={[Math.PI / 2, 0, k * -0.3]} />
      ))}
      <mesh geometry={geo.toe} material={mats.leg} position={[0, 0, -0.03]} rotation-x={Math.PI / 2} scale={0.7} />
    </group>
  )

  return (
    <group ref={root} onClick={onClick} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
      <group ref={body}>
        <mesh geometry={geo.body} material={mats.orange} scale={[0.24, 0.25, 0.23]} position={[0, 0.3, 0]} castShadow />
        {/* sayap mungil kuning berlobus di sisi atas badan */}
        <group ref={wingL} position={[-0.2, 0.4, 0.02]}>
          <mesh geometry={geo.wing} material={mats.gold} scale={[0.06, 0.1, 0.06]} rotation-z={Math.PI} position={[-0.02, 0.02, 0]} />
        </group>
        <group ref={wingR} position={[0.2, 0.4, 0.02]}>
          <mesh geometry={geo.wing} material={mats.gold} scale={[0.06, 0.1, 0.06]} rotation-z={Math.PI} position={[0.02, 0.02, 0]} />
        </group>
      </group>
      <mesh geometry={geo.legL} material={mats.leg} />
      <mesh geometry={geo.legR} material={mats.leg} />
      {foot(-1)}
      {foot(1)}

      {/* kepala besar (≈50% tinggi), leher hampir tak terlihat, miring ~6° */}
      <group ref={head} position={[0, HEAD_Y, 0.01]}>
        <mesh geometry={geo.head} material={mats.orange} scale={[0.3, 0.28, 0.28]} castShadow receiveShadow={false} />
        {eye(-1)}
        {eye(1)}
        {/* paruh kuning mungil bervolume, sedikit terbuka; rongga gelap & lidah kecil */}
        <group position={[0, -0.06, 0.255]}>
          <mesh geometry={geo.beakUpper} material={mats.beak} scale={[0.05, 0.05, 0.05]} />
          <mesh geometry={geo.sphere} material={mats.mouth} scale={[0.03, 0.012, 0.02]} position={[0, -0.012, 0.015]} />
          <mesh geometry={geo.sphere} material={mats.tongue} scale={[0.014, 0.006, 0.012]} position={[0, -0.016, 0.02]} />
          <mesh ref={beakLower} geometry={geo.beakLower} material={mats.beak} scale={[0.05, 0.05, 0.05]} position={[0, -0.018, 0]} rotation-x={0.22} />
        </group>
        {/* jambul tiga helai: tengah tertinggi, samping lebih pendek membuka ke luar; pangkal menyatu */}
        <group ref={crest} position={[0, 0.24, -0.02]}>
          <mesh geometry={geo.sphere} material={mats.orange} scale={[0.09, 0.05, 0.07]} />
          <mesh geometry={geo.crestMid} material={mats.skin} scale={[0.075, 0.22, 0.075]} rotation-x={-0.15} />
          <mesh geometry={geo.crestSide} material={mats.skin} scale={[0.06, 0.16, 0.06]} position={[-0.05, 0, -0.01]} rotation={[-0.1, 0, 0.5]} />
          <mesh geometry={geo.crestSide} material={mats.skin} scale={[0.06, 0.16, 0.06]} position={[0.05, 0, -0.01]} rotation={[-0.1, 0, -0.5]} />
        </group>
      </group>
    </group>
  )
}
