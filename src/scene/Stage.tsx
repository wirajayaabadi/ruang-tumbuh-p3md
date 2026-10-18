import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STAGE } from '../config/presentation'
import { useStore } from '../store/useStore'
import { usePalette } from './theme'

/**
 * Inti dunia: bola kaca samar yang memayungi sembilan masalah dan dua cincin orbit tipis yang berputar perlahan.
 * Tidak ada lantai bersama; tiap rumah berdiri di pulaunya sendiri (lihat HouseNode).
 */
export function Stage() {
  const pal = usePalette()
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const nucleus = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    const st = useStore.getState()
    const speed = st.reducedMotion ? 0 : 1
    const d = Math.min(dt, 0.05) * speed
    if (ringA.current) ringA.current.rotation.z += d * 0.05
    if (ringB.current) ringB.current.rotation.z -= d * 0.035
    if (nucleus.current) nucleus.current.rotation.y += d * 0.04
  })

  return (
    <group position-y={STAGE.coreY}>
      <mesh ref={nucleus}>
        <icosahedronGeometry args={[2.7, 1]} />
        <meshBasicMaterial color={pal.coreRing} wireframe transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.6, 32, 20]} />
        <meshStandardMaterial color={pal.glass} transparent opacity={0.07} roughness={0.3} depthWrite={false} />
      </mesh>
      <mesh ref={ringA} rotation-x={Math.PI / 2 + 0.28}>
        <torusGeometry args={[STAGE.orbitRings[0], 0.018, 6, 120]} />
        <meshBasicMaterial color={pal.coreRing} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation-x={Math.PI / 2 - 0.2} rotation-y={0.5}>
        <torusGeometry args={[STAGE.orbitRings[1], 0.014, 6, 140]} />
        <meshBasicMaterial color={pal.coreRing} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  )
}
