import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HOUSES, STAGE, housePosition, stepAt } from '../config/presentation'
import { useStore } from '../store/useStore'
import { damp } from '../utils/math'
import { getSoftDotTexture } from './textures'

/** Aura cahaya lembut berwarna aksen di sekeliling tiap pulau: pendar sprite + cincin tipis yang berdenyut. */
export function HouseAuras() {
  const tex = useMemo(() => getSoftDotTexture(), [])
  const items = useMemo(
    () =>
      HOUSES.map((h, i) => ({
        pos: housePosition(i),
        glow: new THREE.SpriteMaterial({ map: tex, color: h.accent, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }),
        ring: new THREE.MeshBasicMaterial({ color: h.accent, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
        halo: new THREE.MeshBasicMaterial({ color: h.accent, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
      })),
    [tex],
  )
  useEffect(() => () => items.forEach((it) => { it.glow.dispose(); it.ring.dispose(); it.halo.dispose() }), [items])
  const glowRefs = useRef<Array<THREE.Sprite | null>>([])
  const ringRefs = useRef<Array<THREE.Mesh | null>>([])
  const haloRefs = useRef<Array<THREE.Mesh | null>>([])
  const emph = useRef(new Float32Array(HOUSES.length).fill(0))

  useFrame((state, dt) => {
    const st = useStore.getState()
    const t = state.clock.elapsedTime
    const dtc = Math.min(dt, 0.05)
    const step = stepAt(st.step)
    const activeHouse = !st.explore && step.kind === 'house' ? step.houseIndex! : -1
    const reduce = st.reducedMotion
    items.forEach((it, i) => {
      const target = activeHouse === i ? 1 : activeHouse >= 0 ? 0.25 : 0.55
      emph.current[i] += (target - emph.current[i]) * damp(dtc, 4)
      const e = emph.current[i]
      const pulse = reduce ? 1 : 1 + Math.sin(t * 1.4 + i * 1.3) * 0.08
      const g = glowRefs.current[i]
      if (g) {
        g.scale.setScalar((10 + 4 * e) * pulse)
        it.glow.opacity = 0.1 + 0.26 * e
      }
      const r = ringRefs.current[i]
      if (r) {
        const s = (1 + 0.04 * Math.sin(t * 1.4 + i * 1.3) * (reduce ? 0 : 1)) * (1 + 0.08 * e)
        r.scale.setScalar(s)
        it.ring.opacity = 0.18 + 0.45 * e
        if (!reduce) r.rotation.z += dtc * 0.15
      }
      const h = haloRefs.current[i]
      if (h) {
        it.halo.opacity = 0.05 + 0.16 * e
        h.scale.setScalar(1 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.9 + i)) * (reduce ? 0 : 1))
      }
    })
  })

  const R = STAGE.housePlatformRadius
  return (
    <group>
      {items.map((it, i) => (
        <group key={HOUSES[i].id} position={it.pos}>
          <sprite ref={(el) => { glowRefs.current[i] = el }} material={it.glow} position-y={0.6} />
          <mesh ref={(el) => { ringRefs.current[i] = el }} material={it.ring} rotation-x={-Math.PI / 2} position-y={0.3}>
            <ringGeometry args={[R + 0.55, R + 0.75, 64]} />
          </mesh>
          <mesh ref={(el) => { haloRefs.current[i] = el }} material={it.halo} rotation-x={-Math.PI / 2} position-y={0.28}>
            <ringGeometry args={[R + 0.2, R + 1.6, 64]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
