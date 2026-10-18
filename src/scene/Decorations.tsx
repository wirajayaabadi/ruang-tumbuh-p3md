import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { HOUSES, STAGE, housePosition, houseRotationY } from '../config/presentation'

const GRASS_PER_ISLAND = 44
const FLOWERS_PER_ISLAND = 13
const ISLAND_TOP = 0.25

const GRASS_GEOM = new THREE.ConeGeometry(0.07, 0.38, 4)
GRASS_GEOM.translate(0, 0.19, 0)
const STEM_GEOM = new THREE.CylinderGeometry(0.018, 0.022, 0.32, 5)
STEM_GEOM.translate(0, 0.16, 0)
const HEAD_GEOM = new THREE.IcosahedronGeometry(0.075, 0)

const GRASS_COLORS = ['#5fae5a', '#79c46b', '#4c9a53', '#8bd07a']
const FLOWER_COLORS = ['#ffd166', '#ff8fab', '#ffffff', '#c3a6ff', '#ffb347', '#8be9fd']

/** Titik acak deterministik di cincin luar pulau, menghindari sisi depan (jalur & slot masalah) dan kolom beban. */
function islandSpots(seed: number, count: number) {
  let s = seed
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const spots: Array<[number, number]> = []
  let tries = 0
  while (spots.length < count && tries++ < 600) {
    const a = rnd() * Math.PI * 2
    const r = 2.3 + rnd() * 0.95
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (z > 1.7 && Math.abs(x) < 2.0) continue // depan rumah: pintu, slot masalah
    if (Math.hypot(x - 2.45, z - 0.9) < 0.75) continue // kolom beban
    if (Math.abs(x) < 2.3 && Math.abs(z) < 1.8) continue // badan rumah + teras
    if (spots.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.2)) continue
    spots.push([x, z])
  }
  return spots
}

/** Rumput dan bunga low-poly di tepi tiap pulau (tiga InstancedMesh untuk semua pulau). */
export function Decorations() {
  const data = useMemo(() => {
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    const grassCount = HOUSES.length * GRASS_PER_ISLAND
    const flowerCount = HOUSES.length * FLOWERS_PER_ISLAND
    const grass = new THREE.InstancedMesh(GRASS_GEOM, new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), grassCount)
    const stems = new THREE.InstancedMesh(STEM_GEOM, new THREE.MeshStandardMaterial({ color: '#4f9a4e', roughness: 0.9 }), flowerCount)
    const heads = new THREE.InstancedMesh(HEAD_GEOM, new THREE.MeshStandardMaterial({ roughness: 0.6, emissiveIntensity: 0.25 }), flowerCount)
    let gi = 0
    let fi = 0
    HOUSES.forEach((h, hi) => {
      const base = housePosition(hi)
      const rot = houseRotationY(hi)
      const spots = islandSpots(hi * 7919 + 13, GRASS_PER_ISLAND + FLOWERS_PER_ISLAND)
      let s = hi * 31 + 5
      const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
      spots.forEach(([lx, lz], k) => {
        const wx = lx * Math.cos(rot) + lz * Math.sin(rot)
        const wz = -lx * Math.sin(rot) + lz * Math.cos(rot)
        dummy.position.set(base.x + wx, ISLAND_TOP, base.z + wz)
        dummy.rotation.set((rnd() - 0.5) * 0.5, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.5)
        if (k < GRASS_PER_ISLAND) {
          dummy.scale.setScalar(0.7 + rnd() * 0.7)
          dummy.updateMatrix()
          grass.setMatrixAt(gi, dummy.matrix)
          grass.setColorAt(gi, color.set(GRASS_COLORS[Math.floor(rnd() * GRASS_COLORS.length)]))
          gi++
        } else {
          dummy.rotation.set((rnd() - 0.5) * 0.25, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.25)
          dummy.scale.setScalar(0.85 + rnd() * 0.5)
          dummy.updateMatrix()
          stems.setMatrixAt(fi, dummy.matrix)
          const head = dummy.clone()
          head.position.y += 0.33 * dummy.scale.y
          head.updateMatrix()
          heads.setMatrixAt(fi, head.matrix)
          const c = rnd() < 0.25 ? h.accent : FLOWER_COLORS[Math.floor(rnd() * FLOWER_COLORS.length)]
          heads.setColorAt(fi, color.set(c))
          fi++
        }
      })
    })
    grass.count = gi
    stems.count = fi
    heads.count = fi
    grass.castShadow = true
    heads.castShadow = true
    grass.instanceMatrix.needsUpdate = true
    stems.instanceMatrix.needsUpdate = true
    heads.instanceMatrix.needsUpdate = true
    return { grass, stems, heads }
  }, [])

  useEffect(
    () => () => {
      ;[data.grass, data.stems, data.heads].forEach((m) => {
        ;(m.material as THREE.Material).dispose()
        m.dispose()
      })
    },
    [data],
  )

  return (
    <group>
      <primitive object={data.grass} />
      <primitive object={data.stems} />
      <primitive object={data.heads} />
    </group>
  )
}

export const ISLAND_RADIUS = STAGE.housePlatformRadius
