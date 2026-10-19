import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SUN_DIRECTION } from '../config/presentation'
import { useStore } from '../store/useStore'
import { getSoftDotTexture } from './textures'

const DIST = 58
/** satu putaran penuh matahari & bulan (detik) */
const ORBIT_PERIOD = 240

/** Posisi hidup matahari & bulan (dibaca Lighting untuk arah cahaya). */
export const skyState = {
  sun: new THREE.Vector3(...SUN_DIRECTION).normalize().multiplyScalar(DIST),
  moon: new THREE.Vector3(...SUN_DIRECTION).normalize().multiplyScalar(-DIST),
  /** 0..1 seberapa tinggi matahari di atas cakrawala */
  sunUp: 1,
}

/** Bulan dengan kawah low-poly: bola yang ditekan di beberapa titik. */
function makeMoonGeometry() {
  const g = new THREE.SphereGeometry(1, 40, 28)
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const p = new THREE.Vector3()
  const craters = [
    [0.3, 0.4, 0.86, 0.32, 0.08], [-0.5, 0.1, 0.85, 0.22, 0.06], [0.1, -0.55, 0.82, 0.26, 0.07], [-0.2, 0.75, 0.6, 0.16, 0.05],
    [0.75, -0.2, 0.62, 0.18, 0.05], [-0.65, -0.5, 0.57, 0.2, 0.05], [0.45, 0.8, 0.4, 0.14, 0.04],
  ].map(([x, y, z, r, d]) => ({ c: new THREE.Vector3(x, y, z).normalize(), r, d }))
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    let push = 0
    for (const cr of craters) {
      const a = p.angleTo(cr.c)
      if (a < cr.r) {
        const k = 1 - a / cr.r
        push += cr.d * (k * k * (3 - 2 * k)) - cr.d * 0.25 * Math.max(0, 1 - Math.abs(a - cr.r * 0.85) / (cr.r * 0.15))
      }
    }
    p.multiplyScalar(1 - push)
    pos.setXYZ(i, p.x, p.y, p.z)
  }
  g.computeVertexNormals()
  return g
}

/** Matahari & bulan hias yang mengorbit perlahan mengelilingi dunia, berseberangan satu sama lain. */
export function Sun() {
  const dark = useStore((s) => s.theme === 'dark')
  const tex = useMemo(() => getSoftDotTexture(), [])
  const moonGeom = useMemo(() => makeMoonGeometry(), [])
  const axis = useMemo(() => {
    // sumbu orbit miring: tegak lurus arah awal matahari, condong ke belakang dunia
    const d = new THREE.Vector3(...SUN_DIRECTION).normalize()
    return new THREE.Vector3().crossVectors(d, new THREE.Vector3(0.35, 1, 0)).normalize()
  }, [])
  const base = useMemo(() => new THREE.Vector3(...SUN_DIRECTION).normalize().multiplyScalar(DIST), [])
  const sunG = useRef<THREE.Group>(null)
  const moonG = useRef<THREE.Group>(null)
  const halo = useRef<THREE.Sprite>(null)
  const glow = useRef<THREE.Sprite>(null)
  const corona = useRef<THREE.Mesh>(null)
  const moonMesh = useRef<THREE.Mesh>(null)
  const moonHalo = useRef<THREE.Sprite>(null)
  const angle = useRef(0)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const reduce = useStore.getState().reducedMotion
    const dtc = Math.min(dt, 0.05)
    if (!reduce) angle.current += (dtc / ORBIT_PERIOD) * Math.PI * 2

    skyState.sun.copy(base).applyAxisAngle(axis, angle.current)
    skyState.moon.copy(skyState.sun).negate()
    skyState.sunUp = THREE.MathUtils.clamp((skyState.sun.y / DIST + 0.25) / 0.6, 0, 1)
    if (sunG.current) sunG.current.position.copy(skyState.sun)
    if (moonG.current) {
      moonG.current.position.copy(skyState.moon)
      moonG.current.lookAt(0, 0, 0)
    }

    const pulse = reduce ? 1 : 1 + Math.sin(t * 0.7) * 0.04
    if (halo.current) halo.current.scale.setScalar(22 * pulse)
    if (glow.current) glow.current.scale.setScalar(52 * (reduce ? 1 : 1 + Math.sin(t * 0.45 + 1) * 0.06))
    if (corona.current) {
      corona.current.lookAt(state.camera.position)
      if (!reduce) corona.current.rotateZ(t * 0.08)
    }
    if (moonMesh.current && !reduce) moonMesh.current.rotation.y += dtc * 0.03
    if (moonHalo.current) moonHalo.current.scale.setScalar(13 * (reduce ? 1 : 1 + Math.sin(t * 0.5) * 0.04))
  })

  return (
    <group>
      <group ref={sunG} position={base}>
        <mesh>
          <sphereGeometry args={[3.4, 32, 20]} />
          <meshBasicMaterial color="#ffe08a" toneMapped={false} fog={false} />
        </mesh>
        <mesh ref={corona}>
          <ringGeometry args={[4.1, 4.9, 48]} />
          <meshBasicMaterial color="#ffc46b" transparent opacity={dark ? 0.35 : 0.25} side={THREE.DoubleSide} depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
        <sprite ref={halo} scale={22}>
          <spriteMaterial map={tex} color="#ffb85c" transparent opacity={dark ? 0.75 : 0.5} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} />
        </sprite>
        <sprite ref={glow} scale={52}>
          <spriteMaterial map={tex} color="#ff9a4a" transparent opacity={dark ? 0.28 : 0.16} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} />
        </sprite>
      </group>

      <group ref={moonG}>
        <mesh ref={moonMesh} geometry={moonGeom} scale={2.6}>
          <meshStandardMaterial color="#e9eef5" emissive="#9fb8d8" emissiveIntensity={dark ? 0.45 : 0.2} roughness={0.95} metalness={0} fog={false} />
        </mesh>
        <sprite ref={moonHalo} scale={13}>
          <spriteMaterial map={tex} color="#8fb6ff" transparent opacity={dark ? 0.4 : 0.15} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} />
        </sprite>
      </group>
    </group>
  )
}
