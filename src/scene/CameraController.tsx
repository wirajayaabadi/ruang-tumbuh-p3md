import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_VIEWS, HOUSES, stepAt } from '../config/presentation'
import { useStore } from '../store/useStore'
import type { Layout } from '../utils/layout'
import { DEG, clamp, damp, easeInOutCubic, fromPolar, shortestAngleDelta, toPolar, type Polar } from '../utils/math'

const UP = new THREE.Vector3(0, 1, 0)
const PANEL_HIDE_DELAY = 160

/** Titik pandang kamera saat ini, dibagikan ke OrbitControls ketika mode eksplorasi dimulai. */
export const cameraState = {
  target: new THREE.Vector3(...CAMERA_VIEWS.intro.lookAt),
}

export interface ViewTarget {
  position: THREE.Vector3
  target: THREE.Vector3
}

/** Posisi & titik pandang kamera untuk sebuah langkah, disesuaikan dengan aspect ratio dan area panel/UI. */
export function computeView(stepIndex: number, aspect: number, layout: Layout, fovDeg: number, out: ViewTarget) {
  const pos = out.position
  const target = out.target
  const step = stepAt(stepIndex)

  if (step.kind === 'house') {
    const house = HOUSES[step.houseIndex!]
    const hv = house.view
    fromPolar({ angle: (house.angle + hv.angleOffset) * DEG, radius: hv.radius, y: hv.height }, pos)
    fromPolar({ angle: house.angle * DEG, radius: house.radius, y: hv.lookAtY }, target)
  } else {
    const v = CAMERA_VIEWS[step.kind]
    fromPolar({ angle: v.angle * DEG, radius: v.radius, y: v.height }, pos)
    target.set(...v.lookAt)
  }

  const right = layout.panelRight
  const bottom = layout.bottomBar + layout.panelBottom
  const top = layout.top

  // Mundur untuk viewport sempit, dan bila area bebas berkurang karena panel.
  // Total faktor dibatasi supaya dunia tidak menjadi terlalu kecil di layar ponsel.
  let f = clamp(1.45 / aspect, 1, 2.0)
  if (step.kind !== 'house') {
    f *= 1 / Math.max(0.35, 1 - right)
    f *= Math.pow(1 / Math.max(0.35, 1 - top - bottom), layout.panelSide === 'bottom' ? 0.45 : 1) * 0.92
  }
  f = clamp(f, 0.9, layout.panelSide === 'bottom' ? 2.7 : 3.2)
  pos.sub(target).multiplyScalar(f).add(target)

  // Geser lateral/vertikal supaya objek fokus berada di tengah area yang tidak tertutup UI.
  const dist = pos.distanceTo(target)
  const halfH = dist * Math.tan((fovDeg * DEG) / 2)
  const halfW = halfH * aspect
  const forward = target.clone().sub(pos).normalize()
  const rightV = forward.clone().cross(UP).normalize()
  const upV = rightV.clone().cross(forward).normalize()
  const shift = rightV.multiplyScalar(right * halfW).sub(upV.multiplyScalar((bottom - top) * halfH))
  pos.add(shift)
  target.add(shift)
  return out
}

/**
 * Satu-satunya pengendali kamera. Perjalanan diinterpolasi dalam koordinat polar
 * (sudut/jari-jari/tinggi) sehingga kamera mengitari pusat dan tidak menembus objek.
 */
export function CameraController() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3 } | null

  const desired = useMemo<ViewTarget>(() => ({ position: new THREE.Vector3(), target: new THREE.Vector3() }), [])
  const r = useRef({
    pos: new THREE.Vector3(),
    target: cameraState.target,
    fromP: { angle: 0, radius: 0, y: 0 } as Polar,
    fromT: new THREE.Vector3(),
    animating: false,
    pendingStart: -1,
    startTime: 0,
    duration: 1000,
    bump: 0,
    lastTravelId: -1,
  })

  useEffect(() => {
    r.current.pos.copy(camera.position)
  }, [camera])

  useFrame((state, dt) => {
    const s = r.current
    const st = useStore.getState()
    const now = performance.now()
    const aspect = state.size.width / Math.max(1, state.size.height)
    const dtc = Math.min(dt, 0.05)

    if (st.explore) {
      // kamera bebas menulis posisi & titik pandang (cameraState.target) sendiri
      s.pos.copy(camera.position)
      if (controls) s.target.copy(controls.target)
      s.animating = false
      s.pendingStart = -1
      return
    }

    computeView(st.step, aspect, st.layout, CAMERA_VIEWS.fov, desired)

    if (st.travelId !== s.lastTravelId) {
      s.lastTravelId = st.travelId
      s.pendingStart = now + (st.reducedMotion ? 0 : PANEL_HIDE_DELAY)
    }

    if (s.pendingStart >= 0 && now >= s.pendingStart) {
      s.pendingStart = -1
      s.fromP = toPolar(s.pos, toPolar(desired.position).angle)
      s.fromT.copy(s.target)
      const toP = toPolar(desired.position, s.fromP.angle)
      const dAngle = Math.abs(shortestAngleDelta(s.fromP.angle, toP.angle))
      const dLinear = Math.abs(toP.radius - s.fromP.radius) + Math.abs(toP.y - s.fromP.y)
      const lowFlight = Math.max(s.fromP.y, toP.y) < 12 ? 1 : 0
      s.bump = st.reducedMotion ? 0 : lowFlight * clamp(dAngle / (0.3 * Math.PI), 0, 1)
      s.duration = st.reducedMotion
        ? CAMERA_VIEWS.durationReduced
        : clamp(CAMERA_VIEWS.durationMin + 520 * (dAngle / Math.PI) + 6 * dLinear, CAMERA_VIEWS.durationMin, CAMERA_VIEWS.durationMax)
      s.startTime = now
      s.animating = true
    }

    if (s.animating) {
      const t = clamp((now - s.startTime) / s.duration, 0, 1)
      const e = easeInOutCubic(t)
      const toP = toPolar(desired.position, s.fromP.angle)
      const angle = s.fromP.angle + shortestAngleDelta(s.fromP.angle, toP.angle) * e
      const arc = Math.sin(e * Math.PI) * s.bump
      const radius = s.fromP.radius + (toP.radius - s.fromP.radius) * e + arc * 2.6
      const y = s.fromP.y + (toP.y - s.fromP.y) * e + arc * 4.5
      fromPolar({ angle, radius, y }, s.pos)
      s.target.lerpVectors(s.fromT, desired.target, e)
      if (t >= 1) {
        s.animating = false
        s.pos.copy(desired.position)
        s.target.copy(desired.target)
        st.setArrived()
      }
    } else if (s.pendingStart < 0) {
      s.pos.lerp(desired.position, damp(dtc, 6))
      s.target.lerp(desired.target, damp(dtc, 6))
      if (st.phase === 'idle') {
        s.pos.copy(desired.position)
        s.target.copy(desired.target)
      }
    }

    camera.position.copy(s.pos)
    camera.lookAt(s.target)
  })

  return null
}
