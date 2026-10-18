import * as THREE from 'three'

export const DEG = Math.PI / 180

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Faktor redaman eksponensial yang stabil terhadap frame rate. */
export const damp = (dt: number, speed: number) => 1 - Math.exp(-speed * dt)

/** Representasi polar titik di sekitar sumbu Y panggung. */
export interface Polar {
  angle: number
  radius: number
  y: number
}

export function toPolar(p: THREE.Vector3, fallbackAngle = 0): Polar {
  const radius = Math.hypot(p.x, p.z)
  const angle = radius < 1e-3 ? fallbackAngle : Math.atan2(p.z, p.x)
  return { angle, radius, y: p.y }
}

export function fromPolar(pl: Polar, out = new THREE.Vector3()) {
  return out.set(Math.cos(pl.angle) * pl.radius, pl.y, Math.sin(pl.angle) * pl.radius)
}

/** Selisih sudut terpendek dari a ke b, dalam rentang [-PI, PI]. */
export function shortestAngleDelta(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

export function housePosition(angleDeg: number, radius: number, out = new THREE.Vector3()) {
  return out.set(Math.cos(angleDeg * DEG) * radius, 0, Math.sin(angleDeg * DEG) * radius)
}
