import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_VIEWS, HOUSES } from '../config/presentation'
import { useStore } from '../store/useStore'
import { DEG, fromPolar } from '../utils/math'
import { CameraController, cameraState } from './CameraController'
import { CentralNetwork } from './CentralNetwork'
import { ConnectionPaths } from './ConnectionPaths'
import { HouseNode } from './HouseNode'
import { LabelProjector } from './Labels'
import { Lighting } from './Lighting'
import { LoadColumns } from './LoadColumns'
import { ProblemTokens } from './ProblemTokens'
import { Stage } from './Stage'
import { Universe } from './Universe'
import { usePalette } from './theme'

function ExploreControls() {
  const explore = useStore((s) => s.explore)
  if (!explore) return null
  const t = cameraState.target
  return (
    <OrbitControls
      makeDefault
      target={[t.x, t.y, t.z]}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={7}
      maxDistance={70}
      minPolarAngle={0.2}
      maxPolarAngle={1.4}
      zoomSpeed={0.7}
      rotateSpeed={0.6}
    />
  )
}

export function Scene() {
  const isSmall = useStore((s) => s.layout.isSmall)
  const pal = usePalette()
  const initialPosition = useMemo(() => {
    const v = CAMERA_VIEWS.intro
    const p = fromPolar({ angle: v.angle * DEG, radius: v.radius, y: v.height })
    return [p.x, p.y, p.z] as [number, number, number]
  }, [])

  return (
    <Canvas
      className="scene-canvas"
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={isSmall ? [1, 1.3] : [1, 1.75]}
      camera={{ fov: CAMERA_VIEWS.fov, near: 0.5, far: 600, position: initialPosition }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ camera }) => camera.lookAt(...CAMERA_VIEWS.intro.lookAt)}
    >
      <color attach="background" args={[pal.background]} />
      <fog attach="fog" args={[pal.background, 70, 190]} />
      <Suspense fallback={null}>
        <Universe />
        <Lighting />
        <Stage />
        <CentralNetwork />
        <ProblemTokens />
        <ConnectionPaths />
        <LoadColumns />
        {HOUSES.map((house, i) => (
          <HouseNode key={house.id} house={house} index={i} />
        ))}
        <LabelProjector />
        <CameraController />
        <ExploreControls />
      </Suspense>
    </Canvas>
  )
}
