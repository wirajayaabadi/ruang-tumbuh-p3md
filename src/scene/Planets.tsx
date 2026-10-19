import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { paintVertices, smoothstep } from './procgeo'
import { getSoftDotTexture } from './textures'

interface PlanetDef {
  name: string
  /** jarak orbit horizontal dari pusat dunia */
  orbit: number
  /** ketinggian di langit */
  height: number
  radius: number
  /** periode orbit (detik) */
  period: number
  /** fase awal (rad) */
  phase: number
  color: string
  color2?: string
  /** pita warna (Jupiter/Saturnus/Neptunus) */
  bands?: number
  ring?: { inner: number; outer: number; color: string; tilt: number }
  axialTilt?: number
  spin: number
  glow?: string
}

/** Jarak & ukuran bukan skala nyata; dipilih agar terbaca sebagai hiasan langit. */
const PLANETS: PlanetDef[] = [
  { name: 'Mercury', orbit: 70, height: -6, radius: 1.3, period: 150, phase: 0.4, color: '#9a9388', color2: '#6f6a62', spin: 0.08 },
  { name: 'Venus', orbit: 78, height: 4, radius: 2.0, period: 200, phase: 1.4, color: '#e8c48a', color2: '#d9a55e', bands: 2, spin: 0.05, glow: '#f4d9a8' },
  { name: 'Mars', orbit: 86, height: -14, radius: 1.6, period: 260, phase: 2.5, color: '#d4714a', color2: '#9c4a2e', spin: 0.12 },
  { name: 'Jupiter', orbit: 100, height: -2, radius: 5.0, period: 340, phase: 3.5, color: '#d8b48c', color2: '#a9754f', bands: 6, spin: 0.2, glow: '#e8caa6' },
  { name: 'Saturn', orbit: 110, height: -20, radius: 4.2, period: 420, phase: 4.6, color: '#e6d3a3', color2: '#c9ad73', bands: 4, ring: { inner: 1.35, outer: 2.2, color: '#d9c8a0', tilt: 0.45 }, spin: 0.18 },
  { name: 'Uranus', orbit: 120, height: 10, radius: 2.9, period: 520, phase: 5.6, color: '#9fe1e6', color2: '#7fc9d2', axialTilt: 1.7, spin: 0.14, glow: '#bdeff2' },
  { name: 'Neptune', orbit: 130, height: -10, radius: 2.8, period: 640, phase: 0.3, color: '#4f7fe0', color2: '#2f55b5', bands: 3, spin: 0.16, glow: '#7fa6ff' },
]

function planetGeometry(def: PlanetDef) {
  const g = new THREE.SphereGeometry(1, 36, 24)
  const c1 = new THREE.Color(def.color)
  const c2 = new THREE.Color(def.color2 ?? def.color)
  paintVertices(g, (p, _n, out) => {
    const lat = p.y
    let k = 0
    if (def.bands) k = 0.5 + 0.5 * Math.sin(lat * def.bands * Math.PI + Math.sin(p.x * 3) * 0.3)
    else k = 0.5 + 0.5 * Math.sin(p.x * 4.1 + p.z * 3.3) * Math.sin(lat * 2.7)
    // kutub sedikit lebih terang untuk Mars/Uranus
    if (def.name === 'Mars' || def.name === 'Uranus') k = Math.min(1, k + 0.5 * smoothstep(0.75, 0.95, Math.abs(lat)))
    out.copy(c1).lerp(c2, k)
  })
  return g
}

/** Tujuh planet hias yang mengorbit perlahan mengitari sumbu tegak dunia pada sabuk di sekitar cakrawala (terlihat dari overview di belakang pulau). */
export function Planets() {
  const dark = useStore((s) => s.theme === 'dark')
  const tex = useMemo(() => getSoftDotTexture(), [])
  const geoms = useMemo(() => PLANETS.map(planetGeometry), [])
  const mats = useMemo(
    () => PLANETS.map((p) => new THREE.MeshStandardMaterial({ vertexColors: true, color: '#ffffff', roughness: 0.85, metalness: 0, emissive: new THREE.Color(p.color), emissiveIntensity: 0.18, fog: false })),
    [],
  )
  useEffect(() => () => { geoms.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()) }, [geoms, mats])

  const groups = useRef<Array<THREE.Group | null>>([])
  const bodies = useRef<Array<THREE.Mesh | null>>([])
  const time = useRef(0)

  useFrame((_, dt) => {
    const reduce = useStore.getState().reducedMotion
    const dtc = Math.min(dt, 0.05)
    if (!reduce) time.current += dtc
    const t = time.current
    PLANETS.forEach((p, i) => {
      const g = groups.current[i]
      if (!g) return
      const a = p.phase + (t / p.period) * Math.PI * 2
      g.position.set(Math.cos(a) * p.orbit, p.height, Math.sin(a) * p.orbit)
      const b = bodies.current[i]
      if (b && !reduce) b.rotation.y += dtc * p.spin
    })
  })

  if (!dark) return null
  return (
    <group>
      {PLANETS.map((p, i) => (
        <group key={p.name} ref={(el) => { groups.current[i] = el }}>
          <group rotation-z={p.axialTilt ?? 0.2} rotation-x={0.15}>
            <mesh ref={(el) => { bodies.current[i] = el }} geometry={geoms[i]} material={mats[i]} scale={p.radius} />
            {p.ring && (
              <mesh rotation-x={Math.PI / 2 + p.ring.tilt}>
                <ringGeometry args={[p.ring.inner * p.radius, p.ring.outer * p.radius, 64]} />
                <meshStandardMaterial color={p.ring.color} transparent opacity={0.75} side={THREE.DoubleSide} roughness={0.9} fog={false} />
              </mesh>
            )}
          </group>
          {p.glow && (
            <sprite scale={p.radius * 4}>
              <spriteMaterial map={tex} color={p.glow} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
            </sprite>
          )}
        </group>
      ))}
    </group>
  )
}
