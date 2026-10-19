import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { buildTube, deformedSphere, paintVertices, smoothstep } from './procgeo'

/**
 * Charmander kartun 3D prosedural (tanpa aset). Tinggi ≈ 1.0 (tanpa api), kaki di y=0, menghadap +z.
 * Kepala oval berpipi lebar dengan moncong menyatu (bola terdeformasi), badan pir (lathe) dengan bidang
 * krem via vertex color, ekor tabung ber-radius variabel dengan bagian bawah krem, api tiga lapis.
 */

const ORANGE = new THREE.Color('#f29a3a')
const CREAM = new THREE.Color('#f9e4b8')
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const lerp = THREE.MathUtils.lerp

const HEAD_Y = 0.86
const TAIL_BASE = [V(0, 0.3, -0.16), V(0.04, 0.2, -0.42), V(0.2, 0.22, -0.64), V(0.34, 0.46, -0.72), V(0.38, 0.72, -0.64)]
const tailRadius = (t: number) => lerp(0.125, 0.03, Math.pow(t, 0.9))
const tailColor = (_t: number, up: number, out: THREE.Color) => out.copy(ORANGE).lerp(CREAM, smoothstep(-0.15, -0.6, up))

/** Api berbentuk tetesan asimetris: bola ditarik ke atas, meruncing, dengan lidah api melengkung. */
function flameGeometry(seed: number) {
  return deformedSphere(20, 16, (p) => {
    const h = (p.y + 1) / 2 // 0 bawah → 1 atas
    const taper = 1 - 0.75 * smoothstep(0.35, 1, h)
    p.x *= taper
    p.z *= taper
    p.y = p.y * 1.4 + 0.4 + 0.9 * Math.pow(h, 3)
    // lidah api melengkung & tidak simetris
    p.x += 0.35 * Math.pow(h, 2) * Math.sin(seed)
    p.z += 0.25 * Math.pow(h, 2) * Math.cos(seed * 1.3)
    p.x += 0.08 * Math.sin(p.z * 6 + seed) * h
    p.z += 0.08 * Math.sin(p.x * 5 + seed * 2) * h
  })
}

export function CharmanderModel() {
  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ vertexColors: true, color: '#ffffff', roughness: 0.6, metalness: 0 }),
      orange: new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.6, metalness: 0 }),
      cream: new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.65 }),
      white: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }),
      iris: new THREE.MeshStandardMaterial({ color: '#2fa7b8', roughness: 0.35 }),
      dark: new THREE.MeshStandardMaterial({ color: '#2a1b1b', roughness: 0.5 }),
      mouth: new THREE.MeshStandardMaterial({ color: '#4a1e22', roughness: 0.8 }),
      tongue: new THREE.MeshStandardMaterial({ color: '#e36a7a', roughness: 0.6 }),
      claw: new THREE.MeshStandardMaterial({ color: '#f3ecd8', roughness: 0.5 }),
      blush: new THREE.MeshStandardMaterial({ color: '#ff8a6a', roughness: 0.9, transparent: true, opacity: 0.55 }),
      flameOuter: new THREE.MeshStandardMaterial({ color: '#ff6a2a', emissive: '#ff5a1a', emissiveIntensity: 1.2, roughness: 0.5, transparent: true, opacity: 0.85 }),
      flameMid: new THREE.MeshStandardMaterial({ color: '#ff9a2e', emissive: '#ff8a1e', emissiveIntensity: 1.6, roughness: 0.5, transparent: true, opacity: 0.9 }),
      flameCore: new THREE.MeshStandardMaterial({ color: '#ffe36b', emissive: '#ffd84a', emissiveIntensity: 2.2, roughness: 0.4 }),
    }),
    [],
  )

  const geo = useMemo(() => {
    // badan pir: dada sempit, perut & pinggul lebar, leher sangat pendek
    const profile = [
      [0.18, 0.2], [0.27, 0.3], [0.3, 0.42], [0.28, 0.53], [0.23, 0.62], [0.17, 0.69], [0.12, 0.74],
    ].map(([r, y]) => new THREE.Vector2(r, y))
    const body = new THREE.LatheGeometry(profile, 32)
    body.computeVertexNormals()
    paintVertices(body, (p, n, out) => {
      const front = smoothstep(0.15, 0.65, n.z)
      const band = smoothstep(0.22, 0.3, p.y) * (1 - smoothstep(0.66, 0.76, p.y))
      // lebih sempit di dada atas, melebar di perut
      const width = lerp(0.9, 0.45, smoothstep(0.42, 0.72, p.y))
      const lateral = 1 - smoothstep(width * 0.6, width, Math.abs(Math.atan2(p.x, p.z)))
      out.copy(ORANGE).lerp(CREAM, front * band * lateral)
    })

    // kepala oval berpipi lebar + moncong pendek lebar yang menyatu
    const head = deformedSphere(36, 26, (p) => {
      const cheek = smoothstep(0.3, -0.6, p.y) * (1 - Math.abs(p.z) * 0.5)
      p.x *= 1 + 0.22 * cheek
      p.z *= 1 + 0.06 * cheek
      const muzzle = smoothstep(0.35, 0.95, p.z) * smoothstep(0.1, -0.6, p.y) * (1 - smoothstep(0.45, 0.95, Math.abs(p.x)))
      p.z += 0.22 * muzzle
      p.y -= 0.05 * muzzle
      p.x *= 1 + 0.1 * muzzle
      // dahi membulat, belakang kepala sedikit pipih
      p.y *= 0.96
      if (p.z < 0) p.z *= 0.95
    })
    paintVertices(head, (p, n, out) => {
      const jaw = smoothstep(-0.35, -0.8, p.y) * smoothstep(-0.2, 0.5, n.z)
      out.copy(ORANGE).lerp(CREAM, jaw)
    })

    const tail = buildTube(new THREE.CatmullRomCurve3(TAIL_BASE.map((v) => v.clone()), false, 'centripetal'), 44, 14, tailRadius, undefined, tailColor)

    // lengan pendek berisi, sedikit ke depan-luar
    const armL = buildTube(new THREE.CatmullRomCurve3([V(-0.21, 0.58, 0.06), V(-0.29, 0.52, 0.15), V(-0.3, 0.47, 0.24)]), 14, 10, (t) => lerp(0.068, 0.045, t))
    const armR = buildTube(new THREE.CatmullRomCurve3([V(0.21, 0.58, 0.06), V(0.29, 0.52, 0.15), V(0.3, 0.47, 0.24)]), 14, 10, (t) => lerp(0.068, 0.045, t))
    // paha tebal menyatu pinggul → betis pendek
    const legL = buildTube(new THREE.CatmullRomCurve3([V(-0.11, 0.34, -0.02), V(-0.17, 0.2, 0.07), V(-0.17, 0.08, 0.08)]), 16, 12, (t) => (t < 0.5 ? lerp(0.12, 0.08, t / 0.5) : lerp(0.08, 0.065, (t - 0.5) / 0.5)))
    const legR = buildTube(new THREE.CatmullRomCurve3([V(0.11, 0.34, -0.02), V(0.17, 0.2, 0.07), V(0.17, 0.08, 0.08)]), 16, 12, (t) => (t < 0.5 ? lerp(0.12, 0.08, t / 0.5) : lerp(0.08, 0.065, (t - 0.5) / 0.5)))

    return {
      body, head, tail, armL, armR, legL, legR,
      sphere: new THREE.SphereGeometry(1, 24, 18),
      finger: new THREE.CapsuleGeometry(0.02, 0.035, 4, 8),
      foot: new THREE.CapsuleGeometry(0.065, 0.1, 6, 12),
      toe: new THREE.CapsuleGeometry(0.028, 0.045, 4, 8),
      claw: new THREE.ConeGeometry(0.014, 0.04, 8),
      smile: new THREE.TorusGeometry(0.05, 0.007, 8, 24, Math.PI * 0.8),
      fang: new THREE.ConeGeometry(0.007, 0.018, 6),
      flameOuter: flameGeometry(1.2),
      flameMid: flameGeometry(2.1),
      flameCore: flameGeometry(0.4),
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
  const torso = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const tailMesh = useRef<THREE.Mesh>(null)
  const flame = useRef<THREE.Group>(null)
  const lidRefs = useRef<Array<THREE.Mesh | null>>([null, null])
  const blink = useRef({ next: 2.5, until: 0 })
  const tailCurve = useMemo(() => new THREE.CatmullRomCurve3(TAIL_BASE.map((v) => v.clone()), false, 'centripetal'), [])
  const tailTip = useMemo(() => new THREE.Vector3(), [])
  const seed = 1.9

  useFrame((state) => {
    const t = state.clock.elapsedTime + seed
    const reduce = useStore.getState().reducedMotion
    const amp = reduce ? 0.3 : 1
    if (root.current) root.current.position.y = Math.abs(Math.sin(t * 2.4)) * 0.025 * amp
    if (torso.current) torso.current.scale.set(1, 1 + Math.sin(t * 2.4) * 0.02 * amp, 1 + Math.sin(t * 2.4) * 0.02 * amp)
    if (head.current) head.current.rotation.set(Math.sin(t * 1.1) * 0.05 * amp, Math.sin(t * 0.7) * 0.14 * amp, Math.sin(t * 0.9) * 0.1 * amp)
    // kedip mata: kelopak turun sesaat tiap 2–5 detik
    const b = blink.current
    if (t > b.next) {
      b.until = t + 0.14
      b.next = t + 2.5 + Math.random() * 2.5
    }
    const closing = t < b.until ? 1 - Math.abs((b.until - t) / 0.07 - 1) : 0
    lidRefs.current.forEach((lid) => {
      if (!lid) return
      lid.visible = closing > 0.03
      lid.position.y = 0.1 - 0.1 * closing
    })

    // ekor: pangkal tetap di pinggul, ujung berayun ke samping
    if (tailMesh.current && !reduce) {
      tailCurve.points.forEach((p, i) => {
        const b = TAIL_BASE[i]
        const w = i / (TAIL_BASE.length - 1)
        p.set(b.x + Math.sin(t * 1.6 + w * 2) * 0.1 * w * w, b.y + Math.sin(t * 1.2 + w) * 0.04 * w * w, b.z)
      })
      buildTube(tailCurve, 44, 14, tailRadius, tailMesh.current.geometry, tailColor)
    }
    // api tumbuh dari ujung ekor: ikut posisi ujung, berkedip kecil
    if (flame.current) {
      tailCurve.getPointAt(1, tailTip)
      flame.current.position.copy(tailTip)
      const f = reduce ? 1 : 1 + Math.sin(t * 11) * 0.08 + Math.sin(t * 6.3) * 0.06
      flame.current.scale.set(1 + Math.sin(t * 8.5) * 0.06, f, 1 + Math.cos(t * 7.2) * 0.06)
      flame.current.rotation.set(Math.sin(t * 5) * 0.08, t * 0.4, Math.sin(t * 6.5) * 0.1)
    }
  })

  /** mata mengikuti kontur kepala: diposisikan pada permukaan dan diarahkan sepanjang normal lokal */
  const eye = (side: 1 | -1) => {
    const a = side * 0.42
    const d = new THREE.Vector3(Math.sin(a), 0.02, Math.cos(a)).normalize()
    const pos = d.clone().multiplyScalar(0.2)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d)
    return (
      <group key={`eye${side}`} position={pos} quaternion={q}>
        <mesh geometry={geo.sphere} material={mats.white} scale={[0.068, 0.092, 0.03]} />
        <mesh geometry={geo.sphere} material={mats.iris} scale={[0.05, 0.07, 0.018]} position={[side * -0.006, -0.006, 0.02]} />
        <mesh geometry={geo.sphere} material={mats.dark} scale={[0.03, 0.046, 0.012]} position={[side * -0.006, -0.008, 0.033]} />
        <mesh geometry={geo.sphere} material={mats.white} scale={0.014} position={[side * -0.02, 0.022, 0.044]} />
        <mesh geometry={geo.sphere} material={mats.white} scale={0.007} position={[side * 0.012, -0.02, 0.044]} />
        {/* kelopak (kedip): bola kulit yang turun menutup mata sesaat */}
        <mesh ref={(el) => { lidRefs.current[side === 1 ? 1 : 0] = el }} geometry={geo.sphere} material={mats.orange} scale={[0.074, 0.098, 0.034]} position={[0, 0.1, -0.004]} visible={false} />
      </group>
    )
  }

  const hand = (side: 1 | -1) => {
    const base: [number, number, number] = [side * 0.3, 0.46, 0.26]
    return (
      <group key={`hand${side}`} position={base}>
        <mesh geometry={geo.sphere} material={mats.orange} scale={[0.04, 0.035, 0.04]} />
        {[-1, 0, 1].map((k) => (
          <mesh key={k} geometry={geo.finger} material={mats.orange} position={[k * 0.024, -0.01, 0.035]} rotation={[Math.PI / 2 - 0.3, 0, k * 0.35]} />
        ))}
      </group>
    )
  }

  const foot = (side: 1 | -1) => (
    <group key={`foot${side}`} position={[side * 0.17, 0.055, 0.1]} rotation-y={side * 0.18}>
      <mesh geometry={geo.foot} material={mats.orange} rotation-x={Math.PI / 2} scale={[1.1, 1, 0.85]} />
      {[-1, 0, 1].map((k) => (
        <group key={k} position={[k * 0.045, -0.01, 0.1]} rotation-y={k * 0.25}>
          <mesh geometry={geo.toe} material={mats.orange} rotation-x={Math.PI / 2} />
          <mesh geometry={geo.claw} material={mats.claw} position={[0, -0.005, 0.045]} rotation-x={Math.PI / 2 + 0.25} />
        </group>
      ))}
    </group>
  )

  return (
    <group ref={root}>
      <group ref={torso}>
        <mesh geometry={geo.body} material={mats.skin} castShadow />
        {/* pinggul membulat menyatu dengan paha & pangkal ekor */}
        <mesh geometry={geo.sphere} material={mats.orange} scale={[0.26, 0.15, 0.2]} position={[0, 0.3, -0.02]} castShadow />
      </group>
      <mesh geometry={geo.legL} material={mats.orange} castShadow />
      <mesh geometry={geo.legR} material={mats.orange} castShadow />
      {foot(-1)}
      {foot(1)}
      <mesh geometry={geo.armL} material={mats.orange} castShadow />
      <mesh geometry={geo.armR} material={mats.orange} castShadow />
      {hand(-1)}
      {hand(1)}

      {/* kepala (35–40% tinggi) dengan leher sangat pendek */}
      <group ref={head} position={[0, HEAD_Y, 0.02]}>
        <mesh geometry={geo.head} material={mats.skin} scale={[0.245, 0.235, 0.23]} castShadow />
        {eye(-1)}
        {eye(1)}
        {/* lubang hidung kecil di atas moncong */}
        <mesh geometry={geo.sphere} material={mats.dark} scale={0.007} position={[-0.026, -0.04, 0.236]} />
        <mesh geometry={geo.sphere} material={mats.dark} scale={0.007} position={[0.026, -0.04, 0.236]} />
        {/* pipi merona */}
        <mesh geometry={geo.sphere} material={mats.blush} scale={[0.045, 0.028, 0.012]} position={[-0.15, -0.07, 0.17]} rotation-y={-0.6} />
        <mesh geometry={geo.sphere} material={mats.blush} scale={[0.045, 0.028, 0.012]} position={[0.15, -0.07, 0.17]} rotation-y={0.6} />
        {/* senyum kecil tertutup + dua taring mungil */}
        <mesh geometry={geo.smile} material={mats.dark} position={[0, -0.085, 0.228]} rotation={[0.3, 0, Math.PI + Math.PI * 0.075]} />
        <mesh geometry={geo.fang} material={mats.white} position={[-0.028, -0.1, 0.232]} rotation-x={Math.PI} />
        <mesh geometry={geo.fang} material={mats.white} position={[0.028, -0.1, 0.232]} rotation-x={Math.PI} />
      </group>

      {/* ekor + api di ujungnya */}
      <mesh ref={tailMesh} geometry={geo.tail} material={mats.skin} castShadow />
      <group ref={flame}>
        <mesh geometry={geo.flameOuter} material={mats.flameOuter} scale={[0.075, 0.1, 0.075]} />
        <mesh geometry={geo.flameMid} material={mats.flameMid} scale={[0.05, 0.075, 0.05]} position-y={0.005} />
        <mesh geometry={geo.flameCore} material={mats.flameCore} scale={[0.028, 0.045, 0.028]} position-y={0.01} />
        <pointLight color="#ff9a3a" intensity={0.9} distance={2.2} decay={2} />
      </group>
    </group>
  )
}
