import * as THREE from 'three'

/** Geometri bersama (unit), diskalakan per-mesh agar hemat memori. */
export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1)
export const UNIT_CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 24)
export const UNIT_SPHERE = new THREE.SphereGeometry(1, 16, 12)
export const UNIT_PYRAMID = new THREE.ConeGeometry(1, 1, 4)
/** kerucut bersegi rendah untuk tanah pulau melayang */
export const UNIT_PYRAMID_ROUND = new THREE.ConeGeometry(1, 1, 9, 1)
export const UNIT_DOME = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
export const NODE_SPHERE = new THREE.SphereGeometry(1, 14, 10)

const gableCache = new Map<string, THREE.BufferGeometry>()

/**
 * Atap pelana (gable) low-poly sebagai prisma segitiga dengan overhang.
 * Dibangun non-indexed supaya shading terlihat datar (flat).
 */
export function getGableRoof(width: number, depth: number, height: number, overhang = 0.3) {
  const key = `${width}|${depth}|${height}|${overhang}`
  const cached = gableCache.get(key)
  if (cached) return cached

  const hw = width / 2 + overhang
  const hd = depth / 2 + overhang
  const h = height
  const A = [-hw, 0, -hd]
  const B = [hw, 0, -hd]
  const C = [hw, 0, hd]
  const D = [-hw, 0, hd]
  const E = [0, h, -hd]
  const F = [0, h, hd]
  const tris = [
    // sisi kiri
    A, F, E, A, D, F,
    // sisi kanan
    B, F, C, B, E, F,
    // gevel depan (+z) & belakang (-z)
    D, C, F, A, E, B,
    // alas
    A, B, C, A, C, D,
  ]
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3))
  geom.computeVertexNormals()
  gableCache.set(key, geom)
  return geom
}
