import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { STAGE, STEP_FIRST_HOUSE, stepAt, type HouseConfig, type Palette } from '../config/presentation'
import { useStore } from '../store/useStore'
import { DEG, damp } from '../utils/math'
import { UNIT_BOX, UNIT_CYLINDER, UNIT_DOME, UNIT_PYRAMID, UNIT_PYRAMID_ROUND, UNIT_SPHERE, getGableRoof } from './geometry'
import { labelAnchors } from './Labels'
import { usePalette } from './theme'

interface Props {
  house: HouseConfig
  index: number
}

interface Mats {
  wall: THREE.MeshStandardMaterial
  roof: THREE.MeshStandardMaterial
  accent: THREE.MeshStandardMaterial
  trim: THREE.MeshStandardMaterial
  window: THREE.MeshStandardMaterial
  platform: THREE.MeshStandardMaterial
  earth: THREE.MeshStandardMaterial
  ring: THREE.MeshBasicMaterial
  bases: Map<THREE.MeshStandardMaterial, THREE.Color>
}

function makeMaterials(house: HouseConfig, pal: Palette): Mats {
  const accent = new THREE.Color(house.accent)
  const roofColor = accent.clone().lerp(new THREE.Color('#3f3a45'), 0.42)
  const platformColor = new THREE.Color(house.accentSoft).lerp(new THREE.Color(pal.platform), 0.45)
  const mk = (color: THREE.Color | string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...extra })
  const mats = {
    wall: mk(pal.wall),
    roof: mk(roofColor, { flatShading: true }),
    accent: mk(accent),
    trim: mk(pal.door),
    window: mk(pal.window, { emissive: new THREE.Color(pal.window), emissiveIntensity: 0.35, roughness: 0.6 }),
    platform: mk(platformColor),
    earth: mk(new THREE.Color(pal.platform).lerp(new THREE.Color('#4a3f36'), 0.55), { flatShading: true }),
    ring: new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, depthWrite: false }),
  }
  const bases = new Map<THREE.MeshStandardMaterial, THREE.Color>()
  for (const m of [mats.wall, mats.roof, mats.accent, mats.trim, mats.window, mats.platform, mats.earth]) {
    bases.set(m, m.color.clone())
  }
  return { ...mats, bases }
}

/* ---------- potongan bangunan ---------- */

function Box({ m, s, p, r }: { m: THREE.Material; s: [number, number, number]; p: [number, number, number]; r?: [number, number, number] }) {
  return <mesh geometry={UNIT_BOX} material={m} scale={s} position={p} rotation={r} castShadow receiveShadow />
}

function Windows({ m, frame, items }: { m: THREE.Material; frame: THREE.Material; items: Array<[number, number, number, number?]> }) {
  return (
    <>
      {items.map(([x, y, z, ry = 0], i) => (
        <group key={i} position={[x, y, z]} rotation-y={ry}>
          <mesh geometry={UNIT_BOX} material={frame} scale={[0.74, 0.74, 0.08]} />
          <mesh geometry={UNIT_BOX} material={m} scale={[0.58, 0.58, 0.1]} position-z={0.01} />
        </group>
      ))}
    </>
  )
}

function Door({ m, knob, p, w = 0.8, h = 1.35 }: { m: THREE.Material; knob: THREE.Material; p: [number, number, number]; w?: number; h?: number }) {
  return (
    <group position={p}>
      <mesh geometry={UNIT_BOX} material={m} scale={[w, h, 0.1]} position-y={h / 2} castShadow />
      <mesh geometry={UNIT_SPHERE} material={knob} scale={0.05} position={[w * 0.3, h * 0.5, 0.07]} />
    </group>
  )
}

function buildVariant(house: HouseConfig, m: Mats): ReactNode {
  const sideWin = (x: number, y: number) => [x, y, 0, Math.PI / 2] as [number, number, number, number]
  switch (house.variant) {
    case 'twin': {
      // Dua blok berdampingan dengan teras kecil: simbol kebersamaan.
      const main = getGableRoof(3.0, 2.9, 1.4)
      const annex = getGableRoof(1.9, 2.3, 0.9)
      return (
        <>
          <group position-x={-0.7}>
            <Box m={m.wall} s={[3.0, 2.3, 2.9]} p={[0, 1.15, 0]} />
            <mesh geometry={main} material={m.roof} position-y={2.3} castShadow receiveShadow />
            <Door m={m.trim} knob={m.accent} p={[0, 0, 1.5]} />
            <Windows m={m.window} frame={m.accent} items={[[-0.95, 1.35, 1.47], [0.95, 1.35, 1.47], sideWin(-1.52, 1.3)]} />
            {/* teras */}
            <Box m={m.accent} s={[1.7, 0.08, 0.9]} p={[0, 1.7, 1.9]} />
            <mesh geometry={UNIT_CYLINDER} material={m.trim} scale={[0.05, 1.7, 0.05]} position={[-0.75, 0.85, 2.25]} castShadow />
            <mesh geometry={UNIT_CYLINDER} material={m.trim} scale={[0.05, 1.7, 0.05]} position={[0.75, 0.85, 2.25]} castShadow />
          </group>
          <group position-x={1.75}>
            <Box m={m.wall} s={[1.9, 1.7, 2.3]} p={[0, 0.85, 0]} />
            <mesh geometry={annex} material={m.roof} position-y={1.7} castShadow receiveShadow />
            <Door m={m.trim} knob={m.accent} p={[0, 0, 1.2]} w={0.6} h={1.1} />
            <Windows m={m.window} frame={m.accent} items={[sideWin(0.98, 1.0)]} />
          </group>
        </>
      )
    }
    case 'school': {
      const roof = getGableRoof(4.2, 2.9, 1.5)
      return (
        <>
          <Box m={m.wall} s={[4.2, 2.5, 2.9]} p={[0, 1.25, 0]} />
          <mesh geometry={roof} material={m.roof} position-y={2.5} castShadow receiveShadow />
          <Door m={m.trim} knob={m.accent} p={[0, 0, 1.5]} />
          <Windows m={m.window} frame={m.accent} items={[[-1.4, 1.35, 1.47], [1.4, 1.35, 1.47], sideWin(-2.12, 1.3), sideWin(2.12, 1.3)]} />
          {/* jam di gevel */}
          <mesh geometry={UNIT_CYLINDER} material={m.accent} scale={[0.36, 0.08, 0.36]} rotation-x={Math.PI / 2} position={[0, 3.15, 1.6]} />
          <mesh geometry={UNIT_CYLINDER} material={m.wall} scale={[0.26, 0.1, 0.26]} rotation-x={Math.PI / 2} position={[0, 3.15, 1.62]} />
          {/* menara lonceng kecil */}
          <Box m={m.wall} s={[0.7, 0.9, 0.7]} p={[1.3, 3.45, -0.3]} />
          <mesh geometry={UNIT_PYRAMID} material={m.roof} scale={[0.6, 0.55, 0.6]} rotation-y={Math.PI / 4} position={[1.3, 4.17, -0.3]} castShadow />
          {/* tiang bendera */}
          <mesh geometry={UNIT_CYLINDER} material={m.trim} scale={[0.04, 2.6, 0.04]} position={[-2.65, 1.3, 1.1]} castShadow />
          <Box m={m.accent} s={[0.6, 0.38, 0.03]} p={[-2.33, 2.35, 1.1]} />
        </>
      )
    }
    case 'lab': {
      return (
        <>
          <Box m={m.wall} s={[3.4, 2.6, 2.9]} p={[0, 1.3, 0]} />
          {/* atap datar + parapet */}
          <Box m={m.roof} s={[3.8, 0.22, 3.3]} p={[0, 2.71, 0]} />
          <Door m={m.trim} knob={m.accent} p={[0, 0, 1.5]} />
          <Windows m={m.window} frame={m.accent} items={[[-1.05, 1.45, 1.47], [1.05, 1.45, 1.47], sideWin(-1.72, 1.4), sideWin(1.72, 1.4)]} />
          {/* ruang mesin di atap, panel miring, antena */}
          <Box m={m.wall} s={[1.2, 0.7, 1.2]} p={[-0.85, 3.17, -0.4]} />
          <Box m={m.accent} s={[1.5, 0.06, 1.0]} p={[0.7, 3.2, 0.5]} r={[-0.5, 0, 0]} />
          <mesh geometry={UNIT_CYLINDER} material={m.trim} scale={[0.04, 1.7, 0.04]} position={[1.1, 3.6, -0.6]} castShadow />
          <mesh geometry={UNIT_SPHERE} material={m.accent} scale={0.15} position={[1.1, 4.5, -0.6]} />
          <mesh geometry={UNIT_CYLINDER} material={m.accent} scale={[0.2, 0.3, 0.2]} position={[1.1, 2.95, -0.6]} />
        </>
      )
    }
    case 'fort': {
      return (
        <>
          <Box m={m.wall} s={[3.6, 2.0, 3.0]} p={[0, 1.0, 0]} />
          <mesh geometry={UNIT_PYRAMID} material={m.roof} scale={[3.0, 1.3, 2.6]} rotation-y={Math.PI / 4} position-y={2.65} castShadow receiveShadow />
          <Door m={m.trim} knob={m.accent} p={[0, 0, 1.55]} />
          <Windows m={m.window} frame={m.accent} items={[[-1.05, 1.2, 1.52], sideWin(-1.82, 1.1), sideWin(1.82, 1.1)]} />
          {/* plakat perisai */}
          <Box m={m.accent} s={[0.62, 0.72, 0.06]} p={[1.05, 1.25, 1.53]} />
          {/* tiang sudut */}
          {[[-1.85, -1.55], [1.85, -1.55], [-1.85, 1.55], [1.85, 1.55]].map(([x, z], i) => (
            <Box key={i} m={m.accent} s={[0.34, 2.35, 0.34]} p={[x, 1.17, z]} />
          ))}
          {/* pagar depan */}
          {[-2.2, -1.75, -1.3, -0.85, 0.85, 1.3, 1.75, 2.2].map((x) => (
            <Box key={x} m={m.trim} s={[0.09, 0.5, 0.09]} p={[x, 0.25, 2.5]} />
          ))}
          <Box m={m.trim} s={[1.45, 0.06, 0.06]} p={[-1.52, 0.4, 2.5]} />
          <Box m={m.trim} s={[1.45, 0.06, 0.06]} p={[1.52, 0.4, 2.5]} />
        </>
      )
    }
    case 'dome':
    default: {
      return (
        <>
          <mesh geometry={UNIT_CYLINDER} material={m.wall} scale={[1.7, 2.0, 1.7]} position-y={1.0} castShadow receiveShadow />
          <mesh geometry={UNIT_DOME} material={m.roof} scale={1.85} position-y={2.0} castShadow receiveShadow />
          <mesh position-y={2.03} rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.9, 0.06, 8, 40]} />
            <primitive object={m.accent} attach="material" />
          </mesh>
          <Door m={m.trim} knob={m.accent} p={[0, 0, 1.66]} w={0.75} h={1.3} />
          <Windows m={m.window} frame={m.accent} items={[[-1.2, 1.25, 1.2, 0.78], [1.2, 1.25, 1.2, -0.78], [-1.7, 1.25, 0.0, Math.PI / 2]]} />
          {/* panel surya miring di samping */}
          <mesh geometry={UNIT_CYLINDER} material={m.trim} scale={[0.05, 0.9, 0.05]} position={[2.35, 0.45, 0.5]} castShadow />
          <Box m={m.accent} s={[1.3, 0.06, 1.0]} p={[2.35, 0.95, 0.5]} r={[-0.6, 0, 0]} />
          {/* antena puncak */}
          <mesh geometry={UNIT_CYLINDER} material={m.trim} scale={[0.03, 0.8, 0.03]} position-y={4.2} />
          <mesh geometry={UNIT_SPHERE} material={m.accent} scale={0.14} position-y={4.6} />
        </>
      )
    }
  }
}

const LABEL_Y = 5.4

export function HouseNode({ house, index }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const pal = usePalette()
  const m = useMemo(() => makeMaterials(house, pal), [house, pal])
  const children = useMemo(() => buildVariant(house, m), [house, m])
  const anim = useRef({ emph: 1, active: 0 })
  const goTo = useStore((s) => s.goTo)

  useEffect(() => () => { m.bases.forEach((_, mat) => mat.dispose()); m.ring.dispose() }, [m])

  const position = useMemo(() => {
    const a = house.angle * DEG
    return new THREE.Vector3(Math.cos(a) * house.radius, 0, Math.sin(a) * house.radius)
  }, [house])
  // pintu (local +z) menghadap pusat panggung
  const rotationY = useMemo(() => {
    const a = house.angle * DEG
    return Math.atan2(-Math.cos(a), -Math.sin(a))
  }, [house])
  const labelPos = useMemo(() => position.clone().add(new THREE.Vector3(0, LABEL_Y, 0)), [position])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return
    const st = useStore.getState()
    const a = anim.current
    const dtc = Math.min(dt, 0.05)
    const step = stepAt(st.step)
    const kind = st.explore ? 'intro' : step.kind
    const isActive = kind === 'house' && step.houseIndex === index
    const hlRuang = st.highlight?.ruang ?? null
    let targetE = 1
    if (kind === 'house') targetE = isActive ? 1 : 0.3
    else if (hlRuang && hlRuang.length) targetE = hlRuang.includes(house.id) ? 1 : 0.45
    const targetA = isActive || (hlRuang?.includes(house.id) ?? false) ? 1 : 0

    // label: sembunyikan saat kamera fokus ke inti
    const labelOpacity =
      kind === 'confidence' || kind === 'relations' || kind === 'load' ? 0 : kind === 'house' ? (isActive ? 1 : 0.45) : kind === 'move' ? 0.55 : targetE
    labelAnchors.set(`house:${house.id}`, { position: labelPos, opacity: labelOpacity })

    if (a.emph === targetE && a.active === targetA) return
    a.emph += (targetE - a.emph) * damp(dtc, 5)
    a.active += (targetA - a.active) * damp(dtc, 5)
    if (Math.abs(a.emph - targetE) < 0.002) a.emph = targetE
    if (Math.abs(a.active - targetA) < 0.002) a.active = targetA

    const dim = new THREE.Color(pal.dim)
    m.bases.forEach((base, mat) => mat.color.copy(base).lerp(dim, (1 - a.emph) * 0.75))
    m.window.emissiveIntensity = 0.35 * a.emph + 0.45 * a.active
    m.ring.opacity = a.active * 0.85
    g.scale.setScalar(1 + 0.05 * a.active)
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Abaikan "klik" yang sebenarnya adalah seretan (misalnya orbit pada mode eksplorasi).
    if (e.delta > 4) return
    goTo(STEP_FIRST_HOUSE + index)
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation-y={rotationY}
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* pulau melayang: alas + tanah berbentuk kerucut di bawahnya */}
      <mesh geometry={UNIT_CYLINDER} material={m.platform} scale={[STAGE.housePlatformRadius, 0.5, STAGE.housePlatformRadius]} position-y={0} receiveShadow castShadow />
      <mesh geometry={UNIT_PYRAMID_ROUND} material={m.earth} scale={[STAGE.housePlatformRadius - 0.15, 2.6, STAGE.housePlatformRadius - 0.15]} rotation-x={Math.PI} position-y={-1.55} castShadow />
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} material={m.ring}>
        <ringGeometry args={[STAGE.housePlatformRadius + 0.12, STAGE.housePlatformRadius + 0.42, 48]} />
      </mesh>
      <group position-y={0.25}>{children}</group>
    </group>
  )
}
