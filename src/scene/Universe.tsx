import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { getSoftDotTexture } from './textures'

const STAR_COUNT = 1600
const BRIGHT_COUNT = 140
const SHELL_R = 150

function makeStars(count: number, seed: number, minR: number, maxR: number) {
  let s = seed
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const tints = [
    [1, 1, 1],
    [0.8, 0.88, 1],
    [1, 0.93, 0.82],
    [0.75, 0.95, 1],
  ]
  for (let i = 0; i < count; i++) {
    // distribusi merata di kulit bola, hindari terlalu rendah di bawah cakrawala
    const u = rnd() * 2 - 1
    const y = Math.sign(u) * Math.pow(Math.abs(u), 0.75)
    const th = rnd() * Math.PI * 2
    const r = minR + rnd() * (maxR - minR)
    const xz = Math.sqrt(Math.max(0, 1 - y * y))
    pos[i * 3] = Math.cos(th) * xz * r
    pos[i * 3 + 1] = y * r
    pos[i * 3 + 2] = Math.sin(th) * xz * r
    const t = tints[Math.floor(rnd() * tints.length)]
    const b = 0.55 + rnd() * 0.45
    col[i * 3] = t[0] * b
    col[i * 3 + 1] = t[1] * b
    col[i * 3 + 2] = t[2] * b
  }
  return { pos, col }
}

const SKY_VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT = /* glsl */ `
  varying vec3 vDir;
  uniform float uTime;
  float blob(vec3 d, vec3 c, float k) { float x = distance(d, normalize(c)); return exp(-x * x * k); }
  void main() {
    float h = vDir.y * 0.5 + 0.5;
    vec3 col = mix(vec3(0.016, 0.022, 0.050), vec3(0.045, 0.062, 0.120), h);
    // nebula lembut: teal, ungu, biru
    col += vec3(0.04, 0.17, 0.19) * blob(vDir, vec3(-0.6, 0.35, -0.7), 5.0) * 0.85;
    col += vec3(0.19, 0.07, 0.26) * blob(vDir, vec3(0.75, 0.2, -0.45), 6.0) * 0.75;
    col += vec3(0.08, 0.10, 0.24) * blob(vDir, vec3(0.1, -0.35, 0.9), 4.0) * 0.55;
    col += vec3(0.16, 0.06, 0.12) * blob(vDir, vec3(-0.3, 0.6, 0.6), 7.0) * 0.45;
    // galaksi samar melintang
    float band = exp(-pow((vDir.y + 0.25 * vDir.x) * 3.2, 2.0));
    col += vec3(0.07, 0.09, 0.14) * band * 0.55;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/** Langit malam: bola latar dengan nebula lembut + dua lapis bintang yang berputar sangat perlahan. Hanya tampil pada tema gelap. */
export function Universe() {
  const dark = useStore((s) => s.theme === 'dark')
  const group = useRef<THREE.Group>(null)
  const brightMat = useRef<THREE.PointsMaterial>(null)
  const texture = useMemo(() => getSoftDotTexture(), [])
  const faint = useMemo(() => makeStars(STAR_COUNT, 20261018, SHELL_R * 0.9, SHELL_R * 1.1), [])
  const bright = useMemo(() => makeStars(BRIGHT_COUNT, 777, SHELL_R * 0.85, SHELL_R), [])
  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        uniforms: { uTime: { value: 0 } },
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  )

  useEffect(() => () => skyMat.dispose(), [skyMat])

  useFrame((state, dt) => {
    const st = useStore.getState()
    if (st.reducedMotion) return
    if (group.current) group.current.rotation.y += Math.min(dt, 0.05) * 0.004
    if (brightMat.current) brightMat.current.opacity = 0.75 + Math.sin(state.clock.elapsedTime * 1.3) * 0.15
  })

  if (!dark) return null
  return (
    <group>
      <mesh material={skyMat} frustumCulled={false} renderOrder={-10}>
        <sphereGeometry args={[SHELL_R * 1.5, 48, 24]} />
      </mesh>
      <group ref={group}>
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[faint.pos, 3]} />
            <bufferAttribute attach="attributes-color" args={[faint.col, 3]} />
          </bufferGeometry>
          <pointsMaterial size={1.1} sizeAttenuation vertexColors map={texture} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </points>
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bright.pos, 3]} />
            <bufferAttribute attach="attributes-color" args={[bright.col, 3]} />
          </bufferGeometry>
          <pointsMaterial ref={brightMat} size={2.6} sizeAttenuation vertexColors map={texture} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </points>
      </group>
    </group>
  )
}
