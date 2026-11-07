import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Line, OrbitControls } from '@react-three/drei'
import type { SceneProps } from '../content/types'
import { useLessonClock } from '../components/LessonShell'
import { useIsLight } from '../lib/theme'
import { easeInOutSine, lerp } from '../engine/easing'

/** theme-aware 3D colors */
function use3dColors() {
  const light = useIsLight()
  return {
    gridA: light ? '#dfe5f2' : '#232b4d',
    gridB: light ? '#bcc6e2' : '#31407a',
    solid: light ? '#0a86d6' : '#45e0ff',
    coinL: light ? '#0d9488' : '#2dffd8',
    coinR: light ? '#7d3fd6' : '#cd9bff',
    gold: light ? '#b86e00' : '#ffe066',
    rim: light ? '#7fb6dd' : '#58c4dd',
  }
}

const R = 1.2
const H = 2.4
const COINS = 12
const COIN_H = H / COINS

interface Live {
  h: number
  r: number
  area: number
  volume: number
}

/**
 * Bài "Thiết diện" (3D):
 * 0 — slicing a cylinder (constant slice)
 * 1 — slicing a cone (shrinking slices → V = ∫S dh)
 * 2 — Cavalieri: two coin stacks, equal slices at every height
 * 3 — hemisphere finale: r(h)=√(R²−h²), V accumulates to ⅔πR³
 */
export function CrossSectionScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()
  const liveRef = useRef<Live>({ h: 0, r: R, area: Math.PI * R * R, volume: 0 })
  const col = use3dColors()

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [4.4, 2.6, 5.2], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 7, 4]} intensity={1.25} />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} color={col.rim} />
        <Grid
          position={[0, -0.02, 0]}
          args={[12, 12]}
          cellSize={0.5}
          cellColor={col.gridA}
          sectionSize={1.5}
          sectionColor={col.gridB}
          fadeDistance={16}
          infiniteGrid
        />
        <Scene3D step={step} playheadRef={playheadRef} liveRef={liveRef} />
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={14} target={[0, 0.9, 0]} makeDefault />
      </Canvas>
      <Hud3d step={step} liveRef={liveRef} />
    </div>
  )
}

function Scene3D({
  step,
  playheadRef,
  liveRef,
}: {
  step: number
  playheadRef: { current: number }
  liveRef: { current: Live }
}) {
  const ghost = useRef<THREE.Group>(null)
  const slice = useRef<THREE.Mesh>(null)
  const plane = useRef<THREE.Group>(null)
  const coinsL = useRef<THREE.InstancedMesh>(null)
  const coinsR = useRef<THREE.InstancedMesh>(null)
  const cavMarks = useRef<THREE.Group>(null)
  const col = use3dColors()
  const dummy = useRef(new THREE.Object3D())
  const lastSlice = useRef('')
  const ghostOp = useRef(0)

  useFrame(() => {
    const ph = playheadRef.current
    const t = easeInOutSine(ph)
    const h = lerp(0.08, H - 0.06, t) // sweep height

    // which solid is on stage
    const showCyl = step === 0
    const showCone = step === 1
    const showCav = step === 2
    const showHemi = step === 3
    if (ghost.current) {
      ghost.current.children.forEach((c, i) => {
        const on =
          (i === 0 && showCyl) || (i === 1 && showCone) || (i === 2 && showHemi)
        const m = c as THREE.Mesh
        m.visible = on
        if (on) {
          const mat = m.material as THREE.MeshStandardMaterial
          ghostOp.current = lerp(ghostOp.current, 0.16, 0.12)
          mat.opacity = ghostOp.current
        }
      })
    }
    if (plane.current) plane.current.visible = showCyl || showCone || showHemi
    if (coinsL.current) coinsL.current.visible = showCav
    if (coinsR.current) coinsR.current.visible = showCav

    // slice radius at height h
    let r = R
    let area = Math.PI * R * R
    let volume = 0
    if (showCyl) {
      r = R
    } else if (showCone) {
      r = R * (1 - h / H)
    } else if (showHemi) {
      r = Math.sqrt(Math.max(R * R - h * h, 0.0001))
      volume = Math.PI * (R * R * h - (h * h * h) / 3)
    } else {
      r = R
    }
    area = Math.PI * r * r

    const s = slice.current
    if (s) {
      s.visible = !showCav
      const key = `${step}:${r.toFixed(4)}:${h.toFixed(4)}`
      if (key !== lastSlice.current) {
        s.geometry.dispose()
        s.geometry = new THREE.CircleGeometry(r, 48)
        s.position.set(0, h, 0)
        lastSlice.current = key
      }
    }
    if (plane.current) plane.current.position.y = h

    // Cavalieri coin stacks: identical coins, right one slanted
    const cavLevel = Math.min(COINS - 1, Math.floor((h / H) * COINS))
    for (const [mesh, side] of [
      [coinsL.current, -1],
      [coinsR.current, 1],
    ] as const) {
      if (!mesh || !mesh.visible) continue
      for (let i = 0; i < COINS; i++) {
        const y = (i + 0.5) * COIN_H
        const shift = side === 1 ? i * 0.105 : 0
        dummy.current.position.set(side * 1.7 + shift, y, 0)
        dummy.current.scale.set(R, COIN_H * 0.92, R)
        dummy.current.updateMatrix()
        mesh.setMatrixAt(i, dummy.current.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }

    // gold rings marking the equal-area cross-sections of both stacks
    if (cavMarks.current) {
      cavMarks.current.visible = showCav
      cavMarks.current.children.forEach((c, i) => {
        const side = i === 0 ? -1 : 1
        c.position.set(side * 1.7 + (side === 1 ? cavLevel * 0.105 : 0), (cavLevel + 1) * COIN_H + 0.005, 0)
      })
    }

    liveRef.current = { h, r, area, volume }
  })

  return (
    <group>
      <group ref={ghost}>
        {/* cylinder */}
        <mesh position={[0, H / 2, 0]}>
          <cylinderGeometry args={[R, R, H, 48]} />
          <meshStandardMaterial color={col.solid} transparent opacity={0.16} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* cone */}
        <mesh position={[0, H / 2, 0]}>
          <coneGeometry args={[R, H, 48]} />
          <meshStandardMaterial color={col.solid} transparent opacity={0.16} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* hemisphere */}
        <mesh>
          <sphereGeometry args={[R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={col.solid} transparent opacity={0.16} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* slicing plane: translucent quad + outline */}
      <group ref={plane}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 3.6]} />
          <meshBasicMaterial color="#ffd35c" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
        <Line
          points={[
            [-1.8, 0, -1.8],
            [1.8, 0, -1.8],
            [1.8, 0, 1.8],
            [-1.8, 0, 1.8],
            [-1.8, 0, -1.8],
          ]}
          color={col.gold}
          lineWidth={1.5}
          transparent
          opacity={0.5}
        />
      </group>

      {/* the live cross-section */}
      <mesh ref={slice} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#ffd35c" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Cavalieri stacks */}
      <instancedMesh ref={coinsL} args={[undefined, undefined, COINS]} visible={false}>
        <cylinderGeometry args={[1, 1, 1, 40]} />
        <meshStandardMaterial color={col.coinL} transparent opacity={0.75} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={coinsR} args={[undefined, undefined, COINS]} visible={false}>
        <cylinderGeometry args={[1, 1, 1, 40]} />
        <meshStandardMaterial color={col.coinR} transparent opacity={0.75} roughness={0.4} />
      </instancedMesh>

      {/* gold rings on the two equal cross-sections (Cavalieri) */}
      <group ref={cavMarks} visible={false}>
        {[0, 1].map((i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[R - 0.03, R, 48]} />
            <meshBasicMaterial color="#ffd35c" transparent opacity={0.95} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Hud3d({ step, liveRef }: { step: number; liveRef: { current: Live } }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (el.current) {
        const L = liveRef.current
        const rows: string[] = [
          `h = ${L.h.toFixed(2)}   ·   S(h) = πR² = ${L.area.toFixed(2)}`,
          `h = ${L.h.toFixed(2)}   ·   r(h) = ${L.r.toFixed(2)}   ·   S(h) = ${L.area.toFixed(2)}`,
          'hai chồng xu: S(h) bằng nhau mọi độ cao',
          `r(h) = √(R²−h²) = ${L.r.toFixed(2)}   ·   V(h) = ${L.volume.toFixed(3)}   →   ⅔πR³ = ${((2 / 3) * Math.PI * R ** 3).toFixed(3)}`,
        ]
        el.current.textContent = rows[step] ?? ''
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [step, liveRef])
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 md:top-4">
      <div ref={el} className="rounded-full border border-edge bg-bg/85 px-4 py-1.5 font-mono text-[12px] text-ink backdrop-blur" />
    </div>
  )
}
