import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { buildTube, deformedSphere, paintVertices, smoothstep } from './procgeo'

/**
 * Bulbasaur baby-chibi prosedural (tanpa aset). Panjang ≈ 1.0, kaki di y=0, menghadap +z.
 * Kepala kotak-membulat dari bola terdeformasi, torso ellipsoid horizontal, empat kaki pendek
 * ber-radius variabel, umbi kuncup berlobus dari permukaan parametrik, bercak via vertex color.
 */

const SKIN = new THREE.Color('#8fd1c2') // turquoise pastel
const SPOT = new THREE.Color('#3f9a7f') // hijau mint gelap
const BULB = new THREE.Color('#58b85a') // hijau daun segar
const BULB_DARK = new THREE.Color('#3f8f44')
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const lerp = THREE.MathUtils.lerp

/** Bercak poligonal tak beraturan di ruang arah (unit sphere). */
interface Spot { dir: THREE.Vector3; size: number; phase: number }
const spotsOn = (spots: Spot[], tmp: THREE.Vector3) => (p: THREE.Vector3, _n: THREE.Vector3, out: THREE.Color) => {
  tmp.copy(p).normalize()
  let k = 0
  for (const s of spots) {
    const ang = tmp.angleTo(s.dir)
    // tepi poligon tak beraturan: radius bervariasi terhadap sudut sekitar pusat bercak
    const around = Math.atan2(tmp.y - s.dir.y, tmp.x - s.dir.x)
    const edge = s.size * (1 + 0.28 * Math.sin(3 * around + s.phase) + 0.12 * Math.sin(5 * around - s.phase))
    k = Math.max(k, 1 - smoothstep(edge * 0.85, edge * 1.05, ang))
  }
  out.copy(SKIN).lerp(SPOT, k)
}

const HEAD_SPOTS: Spot[] = [
  { dir: V(0, 0.95, 0.25).normalize(), size: 0.3, phase: 0.4 },
  { dir: V(-0.85, 0.3, -0.3).normalize(), size: 0.24, phase: 1.7 },
  { dir: V(0.85, 0.3, -0.3).normalize(), size: 0.24, phase: 1.7 },
]
const BODY_SPOTS: Spot[] = [
  { dir: V(-0.9, 0.3, 0.2).normalize(), size: 0.3, phase: 0.2 },
  { dir: V(0.95, 0.1, -0.1).normalize(), size: 0.26, phase: 1.1 },
  { dir: V(0.6, -0.3, 0.7).normalize(), size: 0.2, phase: 2.3 },
  { dir: V(-0.5, 0.5, -0.7).normalize(), size: 0.24, phase: 3.1 },
]

export function BulbasaurModel() {
  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ vertexColors: true, color: '#ffffff', roughness: 0.62, metalness: 0 }),
      skinPlain: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.62, metalness: 0 }),
      bulb: new THREE.MeshStandardMaterial({ vertexColors: true, color: '#ffffff', roughness: 0.58, metalness: 0 }),
      white: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }),
      iris: new THREE.MeshStandardMaterial({ color: '#d9343c', emissive: '#d9343c', emissiveIntensity: 0.25, roughness: 0.25 }),
      dark: new THREE.MeshStandardMaterial({ color: '#241818', roughness: 0.45 }),
      blush: new THREE.MeshStandardMaterial({ color: '#ff8fa0', roughness: 0.9, transparent: true, opacity: 0.45 }),
      tongue: new THREE.MeshStandardMaterial({ color: '#f08a9a', roughness: 0.6 }),
      claw: new THREE.MeshStandardMaterial({ color: '#f3ecd8', roughness: 0.5 }),
    }),
    [],
  )

  const geo = useMemo(() => {
    const tmp = new THREE.Vector3()
    // kepala: kotak membulat lebar, pipi penuh, wajah depan agak datar, moncong pendek menyatu
    const head = deformedSphere(48, 36, (p) => {
      const box = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), 0.78)
      p.x = box(p.x) * 1.08
      p.y = box(p.y) * 0.92
      p.z = box(p.z)
      const cheek = smoothstep(0.35, -0.5, p.y) * (1 - Math.abs(p.z) * 0.45)
      p.x *= 1 + 0.16 * cheek
      // wajah depan mendatar lalu moncong menonjol sedikit
      if (p.z > 0) p.z *= 0.9
      const muzzle = smoothstep(0.45, 0.95, p.z) * smoothstep(0.15, -0.55, p.y) * (1 - smoothstep(0.4, 0.9, Math.abs(p.x)))
      p.z += 0.16 * muzzle
      p.y -= 0.04 * muzzle
      // dagu pendek, rahang membulat
      if (p.y < -0.6) p.z *= 0.95
    })
    paintVertices(head, spotsOn(HEAD_SPOTS, tmp))

    // torso: oval horizontal, dada lebar, perut penuh menggantung, pinggul membulat
    const torso = deformedSphere(40, 30, (p) => {
      const belly = smoothstep(0.1, -0.9, p.y)
      p.y -= 0.12 * belly
      p.x *= 1 + 0.08 * belly
      // dada lebih lebar di depan, pinggul membulat di belakang
      p.x *= 1 + 0.06 * smoothstep(-0.2, 0.9, p.z)
      p.z *= 1 + 0.04 * smoothstep(0.3, -0.9, p.z)
    })
    paintVertices(torso, spotsOn(BODY_SPOTS, tmp))

    // umbi: kuncup tertutup berlobus. Profil radius: sempit di dasar, penuh di bawah-tengah, meruncing ke puncak pendek
    const bulb = deformedSphere(56, 40, (p) => {
      const h = (p.y + 1) / 2
      const th = Math.atan2(p.z, p.x)
      const prof = Math.pow(Math.sin(Math.PI * Math.pow(h, 0.72)), 0.85) * (1 - 0.35 * smoothstep(0.75, 1, h))
      const lobes = 1 + 0.085 * Math.cos(5 * th + 0.4) * smoothstep(0.05, 0.4, h) * (1 - smoothstep(0.85, 1, h))
      const R = Math.max(0.12, prof) * lobes
      const cur = Math.max(1e-3, Math.hypot(p.x, p.z))
      p.x = (p.x / cur) * R
      p.z = (p.z / cur) * R
      p.y = h * 1.5 - 0.1 + 0.18 * Math.pow(h, 3) // puncak pendek meruncing
    })
    paintVertices(bulb, (p, _n, out) => {
      const th = Math.atan2(p.z, p.x)
      const groove = 0.5 - 0.5 * Math.cos(5 * th + 0.4) // 1 di alur antar lobus
      const h = THREE.MathUtils.clamp((p.y + 0.1) / 1.6, 0, 1)
      out.copy(BULB).lerp(BULB_DARK, 0.55 * groove * smoothstep(0.05, 0.5, h) + 0.25 * smoothstep(0.8, 1, h))
    })

    // telinga: segitiga pipih berpangkal lebar, ujung membulat
    const ear = deformedSphere(16, 12, (p) => {
      const h = (p.y + 1) / 2
      p.x *= 1 - 0.62 * smoothstep(0.1, 1, h)
      p.z *= 0.42 * (1 - 0.4 * h)
      p.y = h * 1.1
    })

    // kaki: pendek, tebal, menyempit ke telapak; penampang bervariasi
    const leg = (x: number, z: number, back: boolean) =>
      buildTube(new THREE.CatmullRomCurve3([V(x * 0.9, 0.34, z), V(x * 1.05, 0.2, z + 0.02), V(x * 1.1, 0.07, z + 0.03)]), 14, 14, (t) => lerp(back ? 0.125 : 0.11, 0.08, Math.pow(t, 1.3)))

    return {
      head, torso, bulb, ear,
      legFL: leg(-0.17, 0.15, false), legFR: leg(0.17, 0.15, false), legBL: leg(-0.18, -0.24, true), legBR: leg(0.18, -0.24, true),
      sphere: new THREE.SphereGeometry(1, 24, 18),
      foot: new THREE.CapsuleGeometry(0.075, 0.07, 6, 14),
      claw: new THREE.ConeGeometry(0.016, 0.04, 8),
      smile: new THREE.TorusGeometry(0.075, 0.0075, 8, 28, Math.PI * 0.75),
      fang: new THREE.CapsuleGeometry(0.006, 0.012, 3, 6),
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
  const bulbRef = useRef<THREE.Group>(null)
  const smile = useRef<THREE.Mesh>(null)
  const tongue = useRef<THREE.Mesh>(null)
  const lidRefs = useRef<Array<THREE.Mesh | null>>([null, null])
  const anim = useRef({ blinkNext: 3, blinkUntil: 0, bounceT0: -10, happy: 0, clock: 0 })
  const seed = 2.3

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime + seed
    const dtc = Math.min(dt, 0.05)
    const reduce = useStore.getState().reducedMotion
    const amp = reduce ? 0.3 : 1
    const a = anim.current
    a.clock = state.clock.elapsedTime

    // pantulan saat diklik (1.1 detik)
    const u = THREE.MathUtils.clamp((state.clock.elapsedTime - a.bounceT0) / 1.1, 0, 1)
    const bounce = u < 1 ? Math.sin(u * Math.PI * 3) * (1 - u) : 0
    const happyTarget = u < 1 ? 1 : 0
    a.happy += (happyTarget - a.happy) * (1 - Math.exp(-dtc * 6))

    if (root.current) root.current.position.y = Math.abs(bounce) * 0.08
    if (body.current) body.current.scale.set(1 + Math.sin(t * 2.0) * 0.015 * amp, 1 + Math.sin(t * 2.0) * 0.02 * amp - bounce * 0.05, 1)
    if (head.current) {
      // kepala miring ~6° menatap penasaran, goyang kecil
      head.current.rotation.set(Math.sin(t * 0.9) * 0.04 * amp, Math.sin(t * 0.55) * 0.14 * amp, 0.07 + Math.sin(t * 0.7) * 0.03 * amp)
    }
    if (bulbRef.current) {
      // umbi bergoyang lembut saat pantulan, lalu kembali
      bulbRef.current.rotation.set(bounce * 0.12, 0, bounce * 0.18 + Math.sin(t * 1.3) * 0.02 * amp)
    }
    if (smile.current) {
      const s = 1 + 0.35 * a.happy
      smile.current.scale.set(s, s, 1)
    }
    if (tongue.current) tongue.current.visible = a.happy > 0.3

    // kedip
    if (t > a.blinkNext) {
      a.blinkUntil = t + 0.14
      a.blinkNext = t + 2.6 + Math.random() * 2.6
    }
    const closing = t < a.blinkUntil ? 1 - Math.abs((a.blinkUntil - t) / 0.07 - 1) : 0
    lidRefs.current.forEach((lid) => {
      if (!lid) return
      lid.visible = closing > 0.03
      lid.position.y = 0.11 - 0.11 * closing
    })
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 4) return
    anim.current.bounceT0 = anim.current.clock
  }

  /** mata mengikuti kontur wajah: diposisikan pada permukaan kepala dan diorientasikan sepanjang normal lokal */
  const eye = (side: 1 | -1) => {
    const a = side * 0.5
    const d = new THREE.Vector3(Math.sin(a), 0.12, Math.cos(a)).normalize()
    const pos = d.clone().multiplyScalar(0.235)
    // basis tanpa puntiran: z = normal, y ≈ atas dunia, sehingga kedua mata benar-benar cermin
    const m = new THREE.Matrix4().lookAt(d, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0))
    const q = new THREE.Quaternion().setFromRotationMatrix(m)
    return (
      <group key={`eye${side}`} position={pos} quaternion={q}>
        {/* oval bersudut: sudut luar sedikit meruncing, kemiringan dicerminkan per sisi */}
        <mesh geometry={geo.sphere} material={mats.white} scale={[0.07, 0.085, 0.028]} rotation-z={side * -0.14} />
        <mesh geometry={geo.sphere} material={mats.iris} scale={[0.052, 0.066, 0.016]} position={[side * -0.004, -0.004, 0.02]} />
        <mesh geometry={geo.sphere} material={mats.dark} scale={[0.016, 0.044, 0.01]} position={[side * -0.004, -0.006, 0.032]} />
        <mesh geometry={geo.sphere} material={mats.white} scale={0.014} position={[side * -0.02, 0.022, 0.042]} />
        <mesh geometry={geo.sphere} material={mats.white} scale={0.007} position={[side * 0.012, -0.02, 0.042]} />
        {/* kelopak atas (kedip) */}
        <mesh ref={(el) => { lidRefs.current[side === 1 ? 1 : 0] = el }} geometry={geo.sphere} material={mats.skinPlain} scale={[0.076, 0.09, 0.032]} position={[0, 0.11, -0.004]} visible={false} />
        {/* rona pipi tipis di bawah mata */}
        <mesh geometry={geo.sphere} material={mats.blush} scale={[0.05, 0.026, 0.008]} position={[side * 0.03, -0.1, -0.012]} />
      </group>
    )
  }

  const foot = (x: number, z: number) => (
    <group key={`${x}${z}`} position={[x, 0.065, z + 0.05]} rotation-y={Math.sign(x) * 0.2}>
      <mesh geometry={geo.foot} material={mats.skinPlain} rotation-x={Math.PI / 2} scale={[1.15, 1, 0.75]} />
      {[-1, 0, 1].map((k) => (
        <mesh key={k} geometry={geo.claw} material={mats.claw} position={[k * 0.05, -0.02, 0.085 + (k === 0 ? 0.01 : 0)]} rotation={[Math.PI / 2 + 0.3, 0, k * -0.15]} />
      ))}
    </group>
  )

  return (
    <group ref={root} onClick={onClick} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
      <group ref={body}>
        <mesh geometry={geo.torso} material={mats.skin} scale={[0.3, 0.24, 0.36]} position={[0, 0.36, -0.06]} castShadow />
        {/* transisi pendek kepala–torso */}
        <mesh geometry={geo.sphere} material={mats.skinPlain} scale={[0.22, 0.17, 0.14]} position={[0, 0.44, 0.2]} />
        {/* umbi tumbuh rapat dari punggung */}
        <group ref={bulbRef} position={[0, 0.5, -0.14]} rotation-x={-0.08}>
          <mesh geometry={geo.bulb} material={mats.bulb} scale={[0.27, 0.3, 0.27]} castShadow />
        </group>
      </group>
      <mesh geometry={geo.legFL} material={mats.skinPlain} castShadow />
      <mesh geometry={geo.legFR} material={mats.skinPlain} castShadow />
      <mesh geometry={geo.legBL} material={mats.skinPlain} castShadow />
      <mesh geometry={geo.legBR} material={mats.skinPlain} castShadow />
      {foot(-0.19, 0.15)}
      {foot(0.19, 0.15)}
      {foot(-0.2, -0.24)}
      {foot(0.2, -0.24)}

      {/* kepala besar (±40% panjang), langsung menyatu ke torso depan */}
      <group ref={head} position={[0, 0.52, 0.3]}>
        <mesh geometry={geo.head} material={mats.skin} scale={[0.3, 0.26, 0.27]} castShadow />
        <mesh geometry={geo.ear} material={mats.skinPlain} scale={[0.09, 0.11, 0.09]} position={[-0.21, 0.19, -0.03]} rotation={[0.1, 0, 0.55]} />
        <mesh geometry={geo.ear} material={mats.skinPlain} scale={[0.09, 0.11, 0.09]} position={[0.21, 0.19, -0.03]} rotation={[0.1, 0, -0.55]} />
        {eye(-1)}
        {eye(1)}
        {/* lubang hidung kecil */}
        <mesh geometry={geo.sphere} material={mats.dark} scale={0.008} position={[-0.035, -0.045, 0.3]} />
        <mesh geometry={geo.sphere} material={mats.dark} scale={0.008} position={[0.035, -0.045, 0.3]} />
        {/* senyum manis + taring mungil berujung bulat + lidah saat ceria */}
        <mesh ref={smile} geometry={geo.smile} material={mats.dark} position={[0, -0.085, 0.29]} rotation={[0.35, 0, Math.PI + Math.PI * 0.125]} />
        <mesh geometry={geo.fang} material={mats.white} position={[-0.045, -0.105, 0.29]} />
        <mesh geometry={geo.fang} material={mats.white} position={[0.045, -0.105, 0.29]} />
        <mesh ref={tongue} geometry={geo.sphere} material={mats.tongue} scale={[0.028, 0.012, 0.018]} position={[0, -0.122, 0.292]} visible={false} />
      </group>
    </group>
  )
}
