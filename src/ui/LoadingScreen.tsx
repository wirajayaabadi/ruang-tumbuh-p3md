import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { WELCOME } from '../data/narrative'
import { LOADING_TIPS } from '../data/tips'
import { Meteors } from '../scene/Meteors'
import { Universe } from '../scene/Universe'
import { paintVertices, smoothstep } from '../scene/procgeo'
import { getSoftDotTexture } from '../scene/textures'
import { useStore } from '../store/useStore'

const DURATION_MS = 8000
const TIP_MS = 2300
const LOGO_URL = `${import.meta.env.BASE_URL}p3md-logo.png`

/** Kontur perisai (mengikuti proporsi logo; lebar 2, tinggi ≈ 2.5, pusat 0,0). */
function shieldShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 1.3)
  s.lineTo(0.95, 1.05)
  s.bezierCurveTo(1.05, 0.2, 0.95, -0.55, 0, -1.25)
  s.bezierCurveTo(-0.95, -0.55, -1.05, 0.2, -0.95, 1.05)
  s.closePath()
  return s
}

/** Logo P3MD 3D: perisai navy tebal bertepi emas dengan logo di kedua sisi, melayang & berputar, dikelilingi kilau. */
function Logo3D() {
  const tex = useLoader(THREE.TextureLoader, LOGO_URL)
  const dot = useMemo(() => getSoftDotTexture(), [])
  const group = useRef<THREE.Group>(null)
  const rays = useRef<THREE.Mesh>(null)
  const sparkRef = useRef<THREE.Points>(null)
  const aspect = tex.image ? (tex.image as HTMLImageElement).height / (tex.image as HTMLImageElement).width : 1.25

  const geo = useMemo(() => {
    const slab = new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4 })
    slab.center()
    const rim = new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.09, bevelSegments: 4 })
    rim.center()
    // sinar: cakram bersegi dengan radius bergantian
    const rayShape = new THREE.Shape()
    const N = 36
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const r = i % 2 === 0 ? 3.4 : 1.6
      if (i === 0) rayShape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      else rayShape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    rayShape.closePath()
    const sparks = new THREE.BufferGeometry()
    const n = 90
    const pos = new Float32Array(n * 3)
    let seed = 7
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2
      const r = 1.8 + rnd() * 2.6
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = (rnd() - 0.5) * 4
      pos[i * 3 + 2] = Math.sin(a) * r
    }
    sparks.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { slab, rim, rays: new THREE.ShapeGeometry(rayShape), sparks }
  }, [])
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])

  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const reduce = useStore.getState().reducedMotion
    const amp = reduce ? 0.2 : 1
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.6) * 0.55 * amp
      group.current.rotation.x = Math.sin(t * 0.45 + 1) * 0.1 * amp
      group.current.position.y = Math.sin(t * 1.1) * 0.12 * amp
    }
    if (rays.current && !reduce) rays.current.rotation.z += dt * 0.15
    if (sparkRef.current && !reduce) sparkRef.current.rotation.y += dt * 0.12
  })

  const logoW = 2.5
  const logoH = logoW * aspect
  return (
    <group>
      {/* sinar & pendar di belakang logo */}
      <mesh ref={rays} geometry={geo.rays} position-z={-0.6}>
        <meshBasicMaterial color="#6fa8ff" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <sprite scale={7} position-z={-0.7}>
        <spriteMaterial map={dot} color="#7fb0ff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <points ref={sparkRef} geometry={geo.sparks}>
        <pointsMaterial map={dot} color="#ffe9a8" size={0.09} sizeAttenuation transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <group ref={group}>
        {/* perisai tebal: tepi emas + badan navy */}
        <mesh geometry={geo.rim} scale={[1.02, 1.02, 1]} castShadow>
          <meshStandardMaterial color="#d9a743" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh geometry={geo.slab} position-z={0.02}>
          <meshStandardMaterial color="#0f1e3a" metalness={0.2} roughness={0.55} />
        </mesh>
        {/* logo di depan & belakang */}
        <mesh position-z={0.19}>
          <planeGeometry args={[logoW, logoH]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.05} roughness={0.5} metalness={0.1} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.25} />
        </mesh>
        <mesh position-z={-0.19} rotation-y={Math.PI}>
          <planeGeometry args={[logoW, logoH]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.05} roughness={0.5} metalness={0.1} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  )
}

/** Dua planet dekoratif besar di tepi kiri & kanan (seperti referensi), berputar perlahan. */
function SidePlanets() {
  const dot = useMemo(() => getSoftDotTexture(), [])
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 48, 32)
    paintVertices(g, (p, _n, out) => {
      const k = 0.5 + 0.5 * Math.sin(p.y * 6 + Math.sin(p.x * 4) * 0.8) * Math.sin(p.x * 3 + p.z * 2)
      out.set('#5a4fd8').lerp(new THREE.Color('#b78cff'), k * 0.8).lerp(new THREE.Color('#5fd3ff'), smoothstep(0.6, 1, Math.abs(p.z)) * 0.5)
    })
    return g
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame((_, dt) => {
    if (useStore.getState().reducedMotion) return
    if (left.current) left.current.rotation.y += dt * 0.04
    if (right.current) right.current.rotation.y -= dt * 0.03
  })
  return (
    <group>
      <group position={[-10.5, 2.6, -10]}>
        <mesh ref={left} geometry={geo} scale={3.0} rotation-z={0.3}>
          <meshStandardMaterial vertexColors color="#ffffff" roughness={0.9} emissive="#3a2f9a" emissiveIntensity={0.35} />
        </mesh>
        <sprite scale={10}>
          <spriteMaterial map={dot} color="#8f7bff" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <group position={[11, -3, -11]}>
        <mesh ref={right} geometry={geo} scale={3.4} rotation-z={-0.4}>
          <meshStandardMaterial vertexColors color="#ffffff" roughness={0.9} emissive="#2f4a9a" emissiveIntensity={0.35} />
        </mesh>
        <sprite scale={11}>
          <spriteMaterial map={dot} color="#6fb6ff" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
    </group>
  )
}

/** Latar galaksi bersama (bintang, nebula, planet tepi, meteor) untuk layar sambutan & pemuatan. */
export function GalaxyBackdrop({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className="loading__nebula" aria-hidden />
      <Canvas className="loading__canvas" dpr={[1, 1.5]} camera={{ fov: 42, position: [0, 0, 7.5], near: 0.1, far: 600 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.8} color="#cfe0ff" />
        <directionalLight position={[3, 4, 6]} intensity={1.6} color="#fff2d8" />
        <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#9fb8ff" />
        <Suspense fallback={null}>
          <Universe force />
          <Meteors force />
          <SidePlanets />
          {children}
        </Suspense>
      </Canvas>
    </>
  )
}

/** Layar pemuatan bergaya galaksi: latar bintang & nebula, logo 3D di tengah, tip bergantian, bar progres. */
function LoadingInner() {
  const loading = useStore((s) => s.loading)
  const finishLoading = useStore((s) => s.finishLoading)
  const reduce = useStore((s) => s.reducedMotion)
  const [progress, setProgress] = useState(0)
  const [tip, setTip] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!loading) return
    const t0 = performance.now()
    const total = reduce ? 1600 : DURATION_MS
    let raf = 0
    const tick = () => {
      const u = Math.min(1, (performance.now() - t0) / total)
      // progres tidak linear agar terasa alami
      setProgress(1 - Math.pow(1 - u, 2.2))
      if (u < 1) raf = requestAnimationFrame(tick)
      else {
        setClosing(true)
        window.setTimeout(finishLoading, 650)
      }
    }
    raf = requestAnimationFrame(tick)
    const tipTimer = window.setInterval(() => setTip((i) => (i + 1) % LOADING_TIPS.length), TIP_MS)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(tipTimer)
    }
  }, [loading, reduce, finishLoading])

  return (
    <div className={`loading__content${closing ? ' is-closing' : ''}`} role="status" aria-live="polite" aria-label="Memuat presentasi">
      <div className="loading__text">
        <p className="loading__tip" key={tip}>{LOADING_TIPS[tip]}</p>
        <div className="loading__bar" aria-hidden>
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="loading__label">Memuat Peta 5 Ruang Tumbuh… {Math.round(progress * 100)}%</p>
      </div>
    </div>
  )
}

/** Lapisan pembuka: latar galaksi tetap terpasang; kartu sambutan VUCA bertukar menjadi logo 3D + progres saat memuat. */
export function IntroOverlay() {
  const started = useStore((s) => s.started)
  const loading = useStore((s) => s.loading)
  const start = useStore((s) => s.start)
  if (started && !loading) return null
  return (
    <div className={`intro${loading ? ' is-loading' : ''}`}>
      <GalaxyBackdrop>{loading && <Logo3D />}</GalaxyBackdrop>
      {!started && (
        <div className="welcome welcome--galaxy" role="dialog" aria-labelledby="welcome-title">
          <div className="welcome__card">
            <figure className="welcome__person">
              <img src={`${import.meta.env.BASE_URL}${WELCOME.person.photo}`} alt={WELCOME.person.name} width={120} height={120} />
              <figcaption>{WELCOME.person.name}</figcaption>
            </figure>
            <p className="welcome__eyebrow">{WELCOME.eyebrow}</p>
            <h1 id="welcome-title" className="welcome__title welcome__title--vuca">{WELCOME.title}</h1>
            <p className="welcome__text">{WELCOME.caption}</p>
            <button type="button" className="btn btn--primary btn--lg" onClick={start} autoFocus>
              {WELCOME.cta}
            </button>
            <p className="welcome__hint">Gunakan tombol → / ← untuk berpindah, ↑ / ↓ untuk tab di tiap rumah, atau klik rumah pada peta.</p>
          </div>
        </div>
      )}
      {loading && <LoadingInner />}
    </div>
  )
}

/** Kompatibilitas: komponen lama kini dibungkus IntroOverlay. */
export function LoadingScreen() {
  return <IntroOverlay />
}
