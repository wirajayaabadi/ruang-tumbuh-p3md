import * as THREE from 'three'

let starTexture: THREE.CanvasTexture | null = null

/** Tekstur titik bundar lembut (dibuat sekali dari canvas, tanpa aset eksternal). Dipakai bintang, halo matahari, dan kilau peri. */
export function getSoftDotTexture() {
  if (starTexture) return starTexture
  const size = 64
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.65)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  starTexture = new THREE.CanvasTexture(cv)
  starTexture.colorSpace = THREE.SRGBColorSpace
  return starTexture
}
