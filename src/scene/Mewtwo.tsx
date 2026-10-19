import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { buildTube } from './procgeo'
import { getSoftDotTexture } from './textures'

/**
 * Mewtwo prosedural (tanpa aset eksternal). Tinggi model ≈ 2 satuan, kaki di y=0, menghadap +z.
 * Bagian organik dibangun dari LatheGeometry (torso), CapsuleGeometry (tungkai, jari, telinga),
 * dan tabung ber-radius variabel sepanjang CatmullRomCurve3 (ekor, lengan, kaki, penghubung kepala).
 *
 * Batas kejujuran: ini pendekatan prosedural, bukan hasil sculpting. Siluet, proporsi, warna, dan pose
 * dibuat mudah dikenali, tetapi detail wajah/otot tidak setajam model GLB hasil pematung.
 */

const BODY = '#d9d3ea'
const PURPLE = '#7a4fb5'
const EYE = '#b25cff'

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const lerp = THREE.MathUtils.lerp

/** Profil torso (radius, y): dada ramping, pinggul & paha besar. */
const TORSO_PROFILE = [
  [0.19, 0.74], [0.245, 0.86], [0.235, 0.96], [0.18, 1.08], [0.155, 1.2], [0.185, 1.33], [0.19, 1.42], [0.13, 1.5], [0.07, 1.56],
].map(([r, y]) => new THREE.Vector2(r, y))

const TAIL_BASE = [V(0, 0.92, -0.18), V(0.02, 0.68, -0.5), V(0.26, 0.42, -0.78), V(0.58, 0.46, -0.74), V(0.8, 0.78, -0.46), V(0.76, 1.08, -0.16)]

interface Props {
  /** bola energi psikis & partikel */
  psychic?: boolean
}

export function MewtwoModel({ psychic = true }: Props) {
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.55, metalness: 0.05 }),
      purple: new THREE.MeshStandardMaterial({ color: PURPLE, roughness: 0.5, metalness: 0.05 }),
      eye: new THREE.MeshStandardMaterial({ color: EYE, emissive: EYE, emissiveIntensity: 0.8, roughness: 0.3 }),
      pupil: new THREE.MeshStandardMaterial({ color: '#1a0f2a', roughness: 0.4 }),
      orb: new THREE.MeshStandardMaterial({ color: '#c08cff', emissive: '#9a4dff', emissiveIntensity: 1.8, roughness: 0.25, transparent: true, opacity: 0.9 }),
      glow: new THREE.SpriteMaterial({ map: getSoftDotTexture(), color: '#a86cff', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
      particles: new THREE.PointsMaterial({ map: getSoftDotTexture(), color: '#d7b8ff', size: 0.07, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }),
    }),
    [],
  )

  const geo = useMemo(() => {
    const torso = new THREE.LatheGeometry(TORSO_PROFILE, 28)
    const tail = buildTube(new THREE.CatmullRomCurve3(TAIL_BASE.map((v) => v.clone()), false, 'centripetal'), 48, 12, (t) => lerp(0.14, 0.022, Math.pow(t, 0.85)))
    const connector = buildTube(new THREE.CatmullRomCurve3([V(0, 1.78, -0.15), V(0, 1.66, -0.3), V(0, 1.5, -0.27), V(0, 1.4, -0.17)]), 20, 10, (t) => lerp(0.05, 0.045, t))
    // lengan kanan terangkat (telapak menghadap atas memegang bola), lengan kiri rileks
    const armR = buildTube(new THREE.CatmullRomCurve3([V(0.17, 1.44, 0.02), V(0.33, 1.3, 0.14), V(0.4, 1.22, 0.3), V(0.33, 1.34, 0.44)]), 24, 10, (t) => lerp(0.075, 0.045, t))
    const armL = buildTube(new THREE.CatmullRomCurve3([V(-0.17, 1.44, 0.02), V(-0.3, 1.26, 0.03), V(-0.33, 1.05, 0.06), V(-0.28, 0.88, 0.12)]), 24, 10, (t) => lerp(0.075, 0.045, t))
    // kaki: paha besar, betis ramping, pose melayang dengan lutut sedikit ke depan
    const legL = buildTube(new THREE.CatmullRomCurve3([V(-0.12, 0.92, 0.0), V(-0.17, 0.66, 0.12), V(-0.16, 0.46, 0.14), V(-0.15, 0.28, 0.06), V(-0.15, 0.12, 0.02)]), 28, 12, (t) => (t < 0.45 ? lerp(0.15, 0.085, t / 0.45) : lerp(0.085, 0.05, (t - 0.45) / 0.55)))
    const legR = buildTube(new THREE.CatmullRomCurve3([V(0.12, 0.92, 0.0), V(0.17, 0.66, 0.12), V(0.16, 0.46, 0.14), V(0.15, 0.28, 0.06), V(0.15, 0.12, 0.02)]), 28, 12, (t) => (t < 0.45 ? lerp(0.15, 0.085, t / 0.45) : lerp(0.085, 0.05, (t - 0.45) / 0.55)))
    return {
      torso, tail, connector, armR, armL, legL, legR,
      sphere: new THREE.SphereGeometry(1, 28, 20),
      ear: new THREE.CapsuleGeometry(0.045, 0.14, 6, 12),
      finger: new THREE.CapsuleGeometry(0.03, 0.07, 4, 10),
      toe: new THREE.CapsuleGeometry(0.035, 0.07, 4, 10),
      foot: new THREE.CapsuleGeometry(0.06, 0.12, 6, 12),
      orb: new THREE.SphereGeometry(0.11, 24, 16),
    }
  }, [])

  const PARTICLES = 36
  const particlePos = useMemo(() => new Float32Array(PARTICLES * 3), [])
  const particleGeom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    return g
  }, [particlePos])

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose())
      Object.values(geo).forEach((g) => g.dispose())
      particleGeom.dispose()
    },
    [mats, geo, particleGeom],
  )

  const root = useRef<THREE.Group>(null)
  const chest = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const tailMesh = useRef<THREE.Mesh>(null)
  const orb = useRef<THREE.Group>(null)
  const orbMesh = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Sprite>(null)
  const light = useRef<THREE.PointLight>(null)
  const tailCurve = useMemo(() => new THREE.CatmullRomCurve3(TAIL_BASE.map((v) => v.clone()), false, 'centripetal'), [])
  const seed = 3.7 // fase awal animasi (deterministik)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime + seed
    const dtc = Math.min(dt, 0.05)
    const reduce = useStore.getState().reducedMotion
    const amp = reduce ? 0.25 : 1
    if (root.current) root.current.position.y = 0.12 + Math.sin(t * 0.9) * 0.07 * amp
    if (chest.current) chest.current.scale.setScalar(1 + Math.sin(t * 1.7) * 0.015 * amp)
    if (head.current) head.current.rotation.set(0.14 + Math.sin(t * 0.6) * 0.03 * amp, Math.sin(t * 0.4) * 0.08 * amp, 0)

    // ekor: pangkal tetap, bagian ujung melambai lentur
    if (tailMesh.current && !reduce) {
      tailCurve.points.forEach((p, i) => {
        const b = TAIL_BASE[i]
        const w = i / (TAIL_BASE.length - 1)
        p.set(b.x + Math.sin(t * 1.3 + w * 2.2) * 0.12 * w * w, b.y + Math.sin(t * 1.1 + w * 3) * 0.08 * w * w, b.z + Math.cos(t * 0.9 + w * 2) * 0.06 * w * w)
      })
      buildTube(tailCurve, 48, 12, (u) => lerp(0.14, 0.022, Math.pow(u, 0.85)), tailMesh.current.geometry)
    }

    // bola energi psikis + partikel + cahaya
    if (orb.current) {
      const pulse = 1 + Math.sin(t * 3.2) * 0.08 * amp
      orb.current.position.y = 1.56 + Math.sin(t * 2.1) * 0.03 * amp
      if (orbMesh.current) orbMesh.current.scale.setScalar(pulse)
      if (glow.current) glow.current.scale.setScalar(0.9 * pulse)
      mats.orb.emissiveIntensity = 1.5 + Math.sin(t * 3.2) * 0.5 * amp
      if (light.current) light.current.intensity = psychic ? 1.6 + Math.sin(t * 3.2) * 0.5 * amp : 0
      const n = reduce ? 12 : PARTICLES
      for (let i = 0; i < PARTICLES; i++) {
        if (i >= n) {
          particlePos[i * 3 + 1] = -999
          continue
        }
        const a = t * (0.8 + (i % 5) * 0.15) + i * 1.7
        const r = 0.17 + ((i * 37) % 10) * 0.012
        const tilt = (i % 3) * 0.8
        particlePos[i * 3] = Math.cos(a) * r
        particlePos[i * 3 + 1] = Math.sin(a * 1.3) * r * Math.sin(tilt) + Math.sin(a) * r * 0.3
        particlePos[i * 3 + 2] = Math.sin(a) * r * Math.cos(tilt)
      }
      ;(particleGeom.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    }
    void dtc
  })

  const fingers = (hand: [number, number, number], up: boolean, mirror: number) =>
    [-0.3, 0, 0.3].map((spread, i) => (
      <mesh
        key={i}
        geometry={geo.finger}
        material={mats.body}
        position={[hand[0] + spread * 0.14 * mirror, hand[1] + (up ? 0.07 : -0.08), hand[2] + (up ? 0.02 : 0.03) + Math.abs(spread) * 0.01]}
        rotation={[up ? -0.4 : 0.25, 0, spread * 0.9 * mirror]}
      />
    ))

  return (
    <group ref={root}>
      {/* pinggul & torso */}
      <mesh geometry={geo.sphere} material={mats.body} scale={[0.25, 0.18, 0.2]} position={[0, 0.9, 0]} castShadow />
      <group ref={chest}>
        <mesh geometry={geo.torso} material={mats.body} scale={[1, 1, 0.8]} castShadow />
        {/* perut ungu */}
        <mesh geometry={geo.sphere} material={mats.purple} scale={[0.12, 0.2, 0.09]} position={[0, 1.05, 0.11]} />
      </group>
      {/* leher & penghubung belakang kepala ke punggung */}
      <mesh geometry={geo.sphere} material={mats.body} scale={[0.07, 0.1, 0.07]} position={[0, 1.6, 0.0]} />
      <mesh geometry={geo.connector} material={mats.purple} castShadow />

      {/* kepala */}
      <group ref={head} position={[0, 1.72, 0.02]}>
        <mesh geometry={geo.sphere} material={mats.body} scale={[0.19, 0.2, 0.22]} castShadow />
        <mesh geometry={geo.sphere} material={mats.body} scale={[0.11, 0.08, 0.1]} position={[0, -0.06, 0.16]} />
        {/* dua tonjolan pendek */}
        <mesh geometry={geo.ear} material={mats.body} position={[-0.1, 0.19, -0.05]} rotation={[-0.35, 0, 0.4]} />
        <mesh geometry={geo.ear} material={mats.body} position={[0.1, 0.19, -0.05]} rotation={[-0.35, 0, -0.4]} />
        {/* mata ungu tajam + pupil */}
        <mesh geometry={geo.sphere} material={mats.eye} scale={[0.058, 0.03, 0.02]} position={[-0.08, 0.02, 0.185]} rotation-z={-0.35} />
        <mesh geometry={geo.sphere} material={mats.eye} scale={[0.058, 0.03, 0.02]} position={[0.08, 0.02, 0.185]} rotation-z={0.35} />
        <mesh geometry={geo.sphere} material={mats.pupil} scale={[0.014, 0.022, 0.01]} position={[-0.075, 0.02, 0.203]} />
        <mesh geometry={geo.sphere} material={mats.pupil} scale={[0.014, 0.022, 0.01]} position={[0.075, 0.02, 0.203]} />
      </group>

      {/* lengan & tangan tiga jari */}
      <mesh geometry={geo.armR} material={mats.body} castShadow />
      <mesh geometry={geo.sphere} material={mats.body} scale={[0.06, 0.03, 0.07]} position={[0.32, 1.37, 0.47]} />
      {fingers([0.32, 1.37, 0.47], true, 1)}
      <mesh geometry={geo.armL} material={mats.body} castShadow />
      <mesh geometry={geo.sphere} material={mats.body} scale={[0.055, 0.07, 0.04]} position={[-0.28, 0.84, 0.13]} />
      {fingers([-0.28, 0.84, 0.13], false, -1)}

      {/* kaki & telapak dengan jari */}
      <mesh geometry={geo.legL} material={mats.body} castShadow />
      <mesh geometry={geo.legR} material={mats.body} castShadow />
      {[-0.15, 0.15].map((x) => (
        <group key={x} position={[x, 0.06, 0.08]}>
          <mesh geometry={geo.foot} material={mats.body} rotation-x={Math.PI / 2} scale={[1, 1, 0.8]} />
          {[-1, 0, 1].map((k) => (
            <mesh key={k} geometry={geo.toe} material={mats.body} position={[k * 0.045, -0.005, 0.12]} rotation-x={Math.PI / 2 - 0.2} />
          ))}
        </group>
      ))}

      {/* ekor ungu: tebal di pangkal, meruncing, melengkung ke belakang-samping */}
      <mesh ref={tailMesh} geometry={geo.tail} material={mats.purple} castShadow />

      {/* energi psikis di atas telapak tangan kanan */}
      {psychic && (
        <group ref={orb} position={[0.32, 1.56, 0.47]}>
          <mesh ref={orbMesh} geometry={geo.orb} material={mats.orb} />
          <sprite ref={glow} material={mats.glow} scale={0.9} />
          <points geometry={particleGeom} material={mats.particles} />
          <pointLight ref={light} color="#a56bff" intensity={1.6} distance={3.5} decay={2} />
        </group>
      )}
    </group>
  )
}
