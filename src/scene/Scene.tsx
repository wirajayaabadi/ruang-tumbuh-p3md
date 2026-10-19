import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_VIEWS, HOUSES } from '../config/presentation'
import { useStore } from '../store/useStore'
import { DEG, fromPolar } from '../utils/math'
import { CameraController } from './CameraController'
import { ExploreControls } from './ExploreControls'
import { CentralNetwork } from './CentralNetwork'
import { ConnectionPaths } from './ConnectionPaths'
import { HouseNode } from './HouseNode'
import { LabelProjector } from './Labels'
import { Lighting } from './Lighting'
import { Meteors } from './Meteors'
import { Planets } from './Planets'
import { ProblemTokens } from './ProblemTokens'
import { Decorations } from './Decorations'
import { Bats } from './Bats'
import { Companions } from './Companions'
import { Stage } from './Stage'
import { Sun } from './Sun'
import { Universe } from './Universe'
import { usePalette } from './theme'

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
        <Sun />
        <Meteors />
        <Planets />
        <Lighting />
        <Stage />
        <CentralNetwork />
        <ProblemTokens />
        <ConnectionPaths />
        {HOUSES.map((house, i) => (
          <HouseNode key={house.id} house={house} index={i} />
        ))}
        <Decorations />
        <Bats />
        <Companions />
        <LabelProjector />
        <CameraController />
        <ExploreControls />
      </Suspense>
    </Canvas>
  )
}
