import * as THREE from 'three'

export const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Tabung dengan radius bervariasi sepanjang kurva. `geom` lama bisa dipakai ulang (posisi diperbarui di tempat).
 * `colorAt(t, upDot)` opsional: warna per vertex (upDot = komponen Y arah radial, +1 atas / −1 bawah).
 */
export function buildTube(
  curve: THREE.Curve<THREE.Vector3>,
  segs: number,
  radial: number,
  radiusAt: (t: number) => number,
  geom?: THREE.BufferGeometry,
  colorAt?: (t: number, upDot: number, out: THREE.Color) => void,
) {
  const frames = curve.computeFrenetFrames(segs, false)
  const count = (segs + 1) * (radial + 1)
  const g = geom ?? new THREE.BufferGeometry()
  let pos = g.getAttribute('position') as THREE.BufferAttribute | undefined
  if (!pos || pos.count !== count) {
    pos = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    g.setAttribute('position', pos)
    if (colorAt) g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    const idx: number[] = []
    for (let i = 0; i < segs; i++)
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j
        const b = a + radial + 1
        idx.push(a, b, a + 1, b, b + 1, a + 1)
      }
    g.setIndex(idx)
  }
  const col = colorAt ? (g.getAttribute('color') as THREE.BufferAttribute) : null
  const P = new THREE.Vector3()
  const c = new THREE.Color()
  let k = 0
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    curve.getPointAt(t, P)
    const r = radiusAt(t)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2
      const cx = Math.cos(v)
      const sx = Math.sin(v)
      const dx = cx * N.x + sx * B.x
      const dy = cx * N.y + sx * B.y
      const dz = cx * N.z + sx * B.z
      pos.setXYZ(k, P.x + dx * r, P.y + dy * r, P.z + dz * r)
      if (col && colorAt) {
        colorAt(t, dy, c)
        col.setXYZ(k, c.r, c.g, c.b)
      }
      k++
    }
  }
  pos.needsUpdate = true
  if (col) col.needsUpdate = true
  g.computeVertexNormals()
  return g
}

/** Deformasi bola satuan per-vertex: fn menerima posisi (dimodifikasi di tempat). Mengembalikan geometri baru. */
export function deformedSphere(wSeg: number, hSeg: number, fn: (p: THREE.Vector3) => void) {
  const g = new THREE.SphereGeometry(1, wSeg, hSeg)
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    fn(p)
    pos.setXYZ(i, p.x, p.y, p.z)
  }
  g.computeVertexNormals()
  return g
}

/** Memberi vertex color pada geometri berdasarkan fungsi posisi+normal. */
export function paintVertices(g: THREE.BufferGeometry, fn: (p: THREE.Vector3, n: THREE.Vector3, out: THREE.Color) => void) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const nor = g.getAttribute('normal') as THREE.BufferAttribute
  const col = new Float32Array(pos.count * 3)
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    n.fromBufferAttribute(nor, i)
    fn(p, n, c)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}
