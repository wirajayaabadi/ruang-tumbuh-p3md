import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SUN_DIRECTION } from '../config/presentation'
import { useStore } from '../store/useStore'
import { getSoftDotTexture } from './textures'

const DIST = 58

/** Matahari hias: bola hangat dengan dua lapis halo yang berdenyut pelan dan korona tipis. */
export function Sun() {
  const dark = useStore((s) => s.theme === 'dark')
  const tex = useMemo(() => getSoftDotTexture(), [])
  const position = useMemo(() => new THREE.Vector3(...SUN_DIRECTION).normalize().multiplyScalar(DIST), [])
  const halo = useRef<THREE.Sprite>(null)
  const glow = useRef<THREE.Sprite>(null)
  const corona = useRef<THREE.Mesh>(null)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const reduce = useStore.getState().reducedMotion
    const pulse = reduce ? 1 : 1 + Math.sin(t * 0.7) * 0.04
    if (halo.current) halo.current.scale.setScalar(22 * pulse)
    if (glow.current) glow.current.scale.setScalar(52 * (reduce ? 1 : 1 + Math.sin(t * 0.45 + 1) * 0.06))
    if (corona.current && !reduce) corona.current.rotation.z += Math.min(dt, 0.05) * 0.08
  })

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[3.4, 32, 20]} />
        <meshBasicMaterial color="#ffe08a" toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={corona} rotation-y={Math.atan2(position.x, position.z) + Math.PI}>
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
  )
}
