import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { skyState } from './Sun'

/** Satu lampu directional dengan shadow + ambient + hemisphere. Jumlah lampu sengaja dibatasi. */
export function Lighting() {
  const isSmall = useStore((s) => s.layout.isSmall)
  const dark = useStore((s) => s.theme === 'dark')
  const mapSize = isSmall ? 1024 : 2048
  const sunLight = useRef<THREE.DirectionalLight>(null)
  const moonLight = useRef<THREE.DirectionalLight>(null)

  // cahaya tepi mengikuti posisi matahari (hangat) dan bulan (biru dingin) yang mengorbit
  useFrame(() => {
    if (sunLight.current) {
      sunLight.current.position.copy(skyState.sun).normalize().multiplyScalar(50)
      sunLight.current.intensity = (dark ? 0.55 : 0.4) * (0.35 + 0.65 * skyState.sunUp)
    }
    if (moonLight.current) {
      moonLight.current.position.copy(skyState.moon).normalize().multiplyScalar(50)
      moonLight.current.intensity = (dark ? 0.3 : 0.12) * (0.35 + 0.65 * (1 - skyState.sunUp))
    }
  })
  return (
    <>
      <ambientLight intensity={dark ? 0.35 : 0.55} color={dark ? '#dfeaf0' : '#fff8ee'} />
      <hemisphereLight args={[dark ? '#b9d2da' : '#fdfaf3', dark ? '#1a262b' : '#cfc6b8', dark ? 0.45 : 0.55]} />
      <directionalLight
        position={[16, 26, 12]}
        intensity={dark ? 1.5 : 1.9}
        color={dark ? '#e8f3f6' : '#fff4e2'}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={2}
        shadow-camera-far={80}
        shadow-radius={isSmall ? 2 : 4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      {/* cahaya tepi hangat dari matahari & cahaya biru dari bulan (tanpa shadow, mengikuti orbit) */}
      <directionalLight ref={sunLight} intensity={dark ? 0.55 : 0.4} color="#ffd9a0" />
      <directionalLight ref={moonLight} intensity={dark ? 0.3 : 0.12} color="#9fb8ff" />
    </>
  )
}
