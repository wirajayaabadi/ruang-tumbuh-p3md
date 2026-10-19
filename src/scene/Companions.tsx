import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HOUSES, housePosition, houseRotationY } from '../config/presentation'
import type { RuangKey } from '../data/types'
import { useStore } from '../store/useStore'
import { BulbasaurModel } from './Bulbasaur'
import { CharmanderModel } from './Charmander'
import { MewtwoModel } from './Mewtwo'
import { TorchicModel } from './Torchic'

type Kind = 'mewtwo' | 'charmander' | 'bulbasaur' | 'torchic' | 'jigglypuff'
const KIND_BY_RUANG: Record<RuangKey, Kind> = {
  aman: 'mewtwo',
  bersama: 'charmander',
  belajar: 'bulbasaur',
  inovasi: 'torchic',
  masa: 'jigglypuff',
}

const SPHERE = new THREE.SphereGeometry(1, 20, 14)
const CONE = new THREE.ConeGeometry(1, 1, 10)
const BOX = new THREE.BoxGeometry(1, 1, 1)

/** Posisi lokal pendamping di halaman: kanan-depan rumah, bebas dari rumput & jalur. */
const LOCAL_POS = new THREE.Vector3(1.55, 0.25, 2.45)
/** Posisi khusus per sosok (local rumah; pintu di z ≈ 1.5, menghadap +z). */
const LOCAL_POS_BY_KIND: Partial<Record<Kind, THREE.Vector3>> = {
  // Mewtwo berdiri tepat di depan pintu Ruang Aman, sedikit ke kanan agar pintu tetap terlihat
  mewtwo: new THREE.Vector3(0.55, 0.25, 2.35),
}

type Parts = Record<string, THREE.Object3D | null>

function useMats(defs: Record<string, THREE.MeshStandardMaterialParameters>) {
  const mats = useMemo(() => {
    const out: Record<string, THREE.MeshStandardMaterial> = {}
    for (const [k, v] of Object.entries(defs)) out[k] = new THREE.MeshStandardMaterial({ roughness: 0.8, ...v })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  return mats
}

const reg = (parts: React.MutableRefObject<Parts>, name: string) => (el: THREE.Object3D | null) => { parts.current[name] = el }

/* ---------------- model tiap sosok (menghadap +z, kaki di y=0) ---------------- */

function Jigglypuff({ parts }: { parts: React.MutableRefObject<Parts> }) {
  const m = useMats({
    body: { color: '#f6a9cc' },
    eye: { color: '#3e8fd6', emissive: '#3e8fd6', emissiveIntensity: 0.35 },
    white: { color: '#ffffff' },
    black: { color: '#1e1a1a' },
    note: { color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.8, transparent: true, opacity: 0 },
  })
  return (
    <group ref={reg(parts, 'root')}>
      <mesh ref={reg(parts, 'body')} geometry={SPHERE} material={m.body} scale={0.46} position={[0, 0.5, 0]} castShadow />
      {/* jambul melingkar */}
      <mesh geometry={SPHERE} material={m.body} scale={[0.14, 0.1, 0.12]} position={[0, 0.98, 0.1]} />
      <mesh geometry={SPHERE} material={m.body} scale={[0.1, 0.08, 0.1]} position={[0.08, 1.02, 0.2]} />
      {/* telinga */}
      <mesh geometry={CONE} material={m.body} scale={[0.12, 0.22, 0.1]} position={[-0.3, 0.86, -0.05]} rotation-z={0.6} />
      <mesh geometry={CONE} material={m.body} scale={[0.12, 0.22, 0.1]} position={[0.3, 0.86, -0.05]} rotation-z={-0.6} />
      {/* mata besar biru */}
      <mesh geometry={SPHERE} material={m.white} scale={[0.12, 0.14, 0.06]} position={[-0.16, 0.56, 0.4]} />
      <mesh geometry={SPHERE} material={m.white} scale={[0.12, 0.14, 0.06]} position={[0.16, 0.56, 0.4]} />
      <mesh geometry={SPHERE} material={m.eye} scale={[0.09, 0.11, 0.04]} position={[-0.16, 0.56, 0.44]} />
      <mesh geometry={SPHERE} material={m.eye} scale={[0.09, 0.11, 0.04]} position={[0.16, 0.56, 0.44]} />
      <mesh geometry={SPHERE} material={m.black} scale={[0.04, 0.06, 0.02]} position={[-0.16, 0.56, 0.47]} />
      <mesh geometry={SPHERE} material={m.black} scale={[0.04, 0.06, 0.02]} position={[0.16, 0.56, 0.47]} />
      <mesh geometry={SPHERE} material={m.white} scale={0.02} position={[-0.13, 0.6, 0.485]} />
      <mesh geometry={SPHERE} material={m.white} scale={0.02} position={[0.19, 0.6, 0.485]} />
      {/* mulut kecil (membuka saat bernyanyi) */}
      <mesh ref={reg(parts, 'mouth')} geometry={SPHERE} material={m.black} scale={[0.05, 0.03, 0.02]} position={[0, 0.4, 0.45]} />
      {/* tangan & kaki mungil */}
      <mesh geometry={SPHERE} material={m.body} scale={[0.1, 0.07, 0.08]} position={[-0.42, 0.42, 0.12]} />
      <mesh geometry={SPHERE} material={m.body} scale={[0.1, 0.07, 0.08]} position={[0.42, 0.42, 0.12]} />
      <mesh geometry={SPHERE} material={m.body} scale={[0.1, 0.06, 0.12]} position={[-0.16, 0.05, 0.1]} />
      <mesh geometry={SPHERE} material={m.body} scale={[0.1, 0.06, 0.12]} position={[0.16, 0.05, 0.1]} />
      {/* not musik sederhana */}
      <group ref={reg(parts, 'note')} position={[0.45, 1.05, 0.2]}>
        <mesh geometry={SPHERE} material={m.note} scale={[0.05, 0.035, 0.03]} />
        <mesh geometry={BOX} material={m.note} scale={[0.015, 0.16, 0.015]} position={[0.04, 0.08, 0]} />
        <mesh geometry={BOX} material={m.note} scale={[0.07, 0.015, 0.015]} position={[0.07, 0.16, 0]} />
      </group>
    </group>
  )
}

const MODEL: Record<Kind, (p: { parts: React.MutableRefObject<Parts> }) => React.JSX.Element> = {
  mewtwo: ({ parts }) => (
    <group ref={reg(parts, 'root')}>
      <MewtwoModel />
    </group>
  ),
  charmander: ({ parts }) => (
    <group ref={reg(parts, 'root')}>
      <CharmanderModel />
    </group>
  ),
  bulbasaur: ({ parts }) => (
    <group ref={reg(parts, 'root')}>
      <BulbasaurModel />
    </group>
  ),
  torchic: ({ parts }) => (
    <group ref={reg(parts, 'root')}>
      <TorchicModel />
    </group>
  ),
  jigglypuff: Jigglypuff,
}

function Companion({ houseIndex }: { houseIndex: number }) {
  const camera = useThree((s) => s.camera)
  const kind = KIND_BY_RUANG[HOUSES[houseIndex].id]
  const parts = useRef<Parts>({})
  const outer = useRef<THREE.Group>(null)
  const anim = useRef({ yaw: 0, seed: houseIndex * 1.37, sparkUntil: 0, nextSpark: 4 + houseIndex })
  const world = useMemo(() => {
    const local = LOCAL_POS_BY_KIND[kind] ?? LOCAL_POS
    const rot = houseRotationY(houseIndex)
    const x = local.x * Math.cos(rot) + local.z * Math.sin(rot)
    const z = -local.x * Math.sin(rot) + local.z * Math.cos(rot)
    return housePosition(houseIndex).add(new THREE.Vector3(x, local.y, z))
  }, [houseIndex, kind])
  const Model = MODEL[kind]

  useFrame((state, dt) => {
    const g = outer.current
    const root = parts.current.root
    if (!g || !root) return
    const st = useStore.getState()
    const reduce = st.reducedMotion
    const t = state.clock.elapsedTime
    const dtc = Math.min(dt, 0.05)
    const a = anim.current

    // menoleh ke arah kamera (hanya yaw), halus
    const dx = camera.position.x - world.x
    const dz = camera.position.z - world.z
    const targetYaw = Math.atan2(dx, dz)
    let dy = targetYaw - a.yaw
    dy = Math.atan2(Math.sin(dy), Math.cos(dy))
    a.yaw += dy * (1 - Math.exp(-dtc * 3))
    g.rotation.y = a.yaw

    const breathe = reduce ? 1 : 1 + Math.sin(t * 2.2 + a.seed) * 0.02
    const p = parts.current
    switch (kind) {
      case 'mewtwo':
        // animasi (melayang, napas, ekor, energi psikis) ditangani MewtwoModel sendiri
        break
      case 'charmander':
        // animasi (napas, ekor, api) ditangani CharmanderModel sendiri
        break
      case 'bulbasaur':
        // animasi (napas, kedip, kepala, umbi, pantulan klik) ditangani BulbasaurModel sendiri
        break
      case 'torchic':
        // animasi (napas, kedip, kepala, jambul, kepak & lompat saat klik) ditangani TorchicModel sendiri
        break
      case 'jigglypuff': {
        // bergoyang seperti bernyanyi, mulut membuka berirama
        root.rotation.z = reduce ? 0 : Math.sin(t * 2.4 + a.seed) * 0.12
        root.scale.set(breathe, 1 / breathe, breathe)
        const singing = Math.sin(t * 0.7 + a.seed) > 0.2
        if (p.mouth) p.mouth.scale.set(0.05, singing ? 0.05 + 0.03 * Math.abs(Math.sin(t * 6)) : 0.03, 0.02)
        if (p.note) {
          const u = (t * 0.6) % 1
          p.note.position.set(0.45 + Math.sin(u * 6) * 0.08, 1.0 + u * 0.5, 0.2)
          p.note.children.forEach((c) => (((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = singing ? Math.sin(u * Math.PI) : 0))
        }
        break
      }
    }
  })

  return (
    <group ref={outer} position={world} scale={kind === 'mewtwo' ? 0.95 : kind === 'charmander' ? 1.5 : kind === 'bulbasaur' ? 1.45 : kind === 'torchic' ? 1.5 : 1.15}>
      <Model parts={parts} />
    </group>
  )
}

/** Lima sosok pendamping low-poly, satu per halaman rumah, dengan animasi idle khas. */
export function Companions() {
  return (
    <group>
      {HOUSES.map((h, i) => (
        <Companion key={h.id} houseIndex={i} />
      ))}
    </group>
  )
}
