import { SUN_DIRECTION } from '../config/presentation'
import { useStore } from '../store/useStore'

/** Satu lampu directional dengan shadow + ambient + hemisphere. Jumlah lampu sengaja dibatasi. */
export function Lighting() {
  const isSmall = useStore((s) => s.layout.isSmall)
  const dark = useStore((s) => s.theme === 'dark')
  const mapSize = isSmall ? 1024 : 2048
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
      {/* cahaya tepi hangat dari arah matahari hias (tanpa shadow) */}
      <directionalLight position={[SUN_DIRECTION[0] * 50, SUN_DIRECTION[1] * 50, SUN_DIRECTION[2] * 50]} intensity={dark ? 0.55 : 0.4} color="#ffd9a0" />
    </>
  )
}
