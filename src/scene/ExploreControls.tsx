import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { cameraState } from './CameraController'

const MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', ' '])
export const isExploreKey = (key: string) => MOVE_KEYS.has(key.toLowerCase())

const BASE_SPEED = 9 // satuan dunia per detik
const LOOK_SENS = 0.0024 // radian per piksel
const PAN_SENS = 0.012
const MAX_PITCH = Math.PI / 2 - 0.05

/**
 * Mode eksplorasi: kamera bebas orang pertama.
 * Seret kiri = menoleh (yaw/pitch di tempat, mengikuti pandangan kamera, bukan titik yang diklik).
 * Seret kanan / Shift+seret / dua jari = geser. Gulir / cubit = maju-mundur ke arah kursor.
 * Keyboard: WASD / panah bergerak, Q/E turun-naik, Shift lebih cepat.
 */
export function ExploreControls() {
  const explore = useStore((s) => s.explore)
  if (!explore) return null
  return <FreeCamera />
}

interface PointerState {
  id: number
  x: number
  y: number
  button: number
  shift: boolean
}

function FreeCamera() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const keys = useRef(new Set<string>())
  const look = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 })
  const pointers = useRef(new Map<number, PointerState>())
  const pinch = useRef<number | null>(null)
  const dolly = useRef({ amount: 0, dir: new THREE.Vector3() })
  const vec = useMemo(() => ({ f: new THREE.Vector3(), r: new THREE.Vector3(), u: new THREE.Vector3(), move: new THREE.Vector3(), euler: new THREE.Euler(0, 0, 0, 'YXZ') }), [])

  // yaw/pitch awal dari orientasi kamera saat ini
  useEffect(() => {
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    look.current = { yaw: e.y, pitch: e.x, targetYaw: e.y, targetPitch: e.x }
  }, [camera])

  useEffect(() => {
    const el = gl.domElement
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
    }
    const down = (e: KeyboardEvent) => {
      if (isTyping(e)) return
      const k = e.key.toLowerCase()
      if (!MOVE_KEYS.has(k)) return
      keys.current.add(k)
      if (k.startsWith('arrow') || k === ' ') e.preventDefault()
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())
    const blur = () => { keys.current.clear(); pointers.current.clear(); pinch.current = null }

    const onPointerDown = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey })
      el.setPointerCapture?.(e.pointerId)
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()]
        pinch.current = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const onPointerMove = (e: PointerEvent) => {
      const p = pointers.current.get(e.pointerId)
      if (!p) return
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      p.x = e.clientX
      p.y = e.clientY
      const n = pointers.current.size
      if (n >= 2) {
        // dua jari: geser mengikuti centroid, cubit = maju/mundur
        const [a, b] = [...pointers.current.values()]
        if (e.pointerId === a.id) panBy(dx / 2, dy / 2)
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinch.current != null) dolly.current.amount += (dist - pinch.current) * 0.03
        pinch.current = dist
        return
      }
      const isPan = p.button === 2 || p.button === 1 || p.shift
      if (isPan) panBy(dx, dy)
      else {
        look.current.targetYaw -= dx * LOOK_SENS
        look.current.targetPitch = THREE.MathUtils.clamp(look.current.targetPitch - dy * LOOK_SENS, -MAX_PITCH, MAX_PITCH)
      }
    }
    const onPointerUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId)
      el.releasePointerCapture?.(e.pointerId)
      if (pointers.current.size < 2) pinch.current = null
    }
    const panBy = (dx: number, dy: number) => {
      const scale = PAN_SENS * (0.4 + camera.position.length() / 40)
      camera.getWorldDirection(vec.f)
      vec.r.crossVectors(vec.f, camera.up).normalize()
      vec.u.crossVectors(vec.r, vec.f).normalize()
      camera.position.addScaledVector(vec.r, -dx * scale).addScaledVector(vec.u, dy * scale)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // arah kursor → maju ke titik yang dituju
      const rect = el.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
      dolly.current.dir.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize()
      dolly.current.amount += -e.deltaY * 0.02
    }
    const onContext = (e: Event) => e.preventDefault()

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('contextmenu', onContext)
    const prevTouch = el.style.touchAction
    el.style.touchAction = 'none'
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('contextmenu', onContext)
      el.style.touchAction = prevTouch
    }
  }, [camera, gl, vec])

  useFrame((_, dt) => {
    const dtc = Math.min(dt, 0.05)
    const l = look.current
    // orientasi: redaman halus menuju yaw/pitch target
    const k = 1 - Math.exp(-dtc * 18)
    l.yaw += (l.targetYaw - l.yaw) * k
    l.pitch += (l.targetPitch - l.pitch) * k
    vec.euler.set(l.pitch, l.yaw, 0)
    camera.quaternion.setFromEuler(vec.euler)

    // gerak keyboard
    const kset = keys.current
    camera.getWorldDirection(vec.f)
    vec.r.crossVectors(vec.f, camera.up).normalize()
    vec.move.set(0, 0, 0)
    if (kset.size) {
      const speed = BASE_SPEED * (kset.has('shift') ? 2.6 : 1) * dtc
      if (kset.has('w') || kset.has('arrowup')) vec.move.addScaledVector(vec.f, speed)
      if (kset.has('s') || kset.has('arrowdown')) vec.move.addScaledVector(vec.f, -speed)
      if (kset.has('d') || kset.has('arrowright')) vec.move.addScaledVector(vec.r, speed)
      if (kset.has('a') || kset.has('arrowleft')) vec.move.addScaledVector(vec.r, -speed)
      if (kset.has('e') || kset.has(' ')) vec.move.y += speed
      if (kset.has('q')) vec.move.y -= speed
    }
    // dolly (gulir/cubit) dengan inersia singkat
    const d = dolly.current
    if (Math.abs(d.amount) > 0.001) {
      const stepAmt = d.amount * Math.min(1, dtc * 10)
      const dir = d.dir.lengthSq() > 0 ? d.dir : vec.f
      vec.move.addScaledVector(dir, stepAmt)
      d.amount -= stepAmt
    } else d.amount = 0
    if (vec.move.lengthSq() > 0) camera.position.add(vec.move)

    // bagikan titik pandang ke pengendali presentasi agar transisi kembali mulus
    cameraState.target.copy(camera.position).addScaledVector(vec.f, 12)
  })

  return null
}
