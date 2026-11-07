import { useEffect, useMemo, useRef, useState } from 'react'
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
    disk: light ? '#0d9488' : '#2dffd8',
    gold: light ? '#b86e00' : '#ffe066',
    rim: light ? '#7fb6dd' : '#58c4dd',
  }
}

const A = 0
const B = 3
const f = (x: number) => 1 + 0.5 * Math.sin(2 * x)
/** exact V = π∫f² (precomputed trapezoid table) */
const V_EXACT = (() => {
  const n = 2000
  const h = (B - A) / n
  let s = 0
  for (let i = 0; i <= n; i++) {
    const w = i === 0 || i === n ? 0.5 : 1
    s += w * f(A + i * h) ** 2
  }
  return Math.PI * s * h
})()

const diskVolume = (n: number) => {
  const dx = (B - A) / n
  let v = 0
  for (let i = 0; i < n; i++) v += Math.PI * f(A + i * dx) ** 2 * dx
  return v
}

/** live values shared between the 3D loop and the HTML HUD */
interface Live {
  phi: number
  n: number
  sum: number
  xs: number
}
export type LiveRef = { current: Live }

/** profile points for LatheGeometry: (radius, height=u along axis) */
function profilePoints(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 72; i++) {
    const x = A + ((B - A) * i) / 72
    pts.push(new THREE.Vector2(Math.max(f(x), 0.001), x))
  }
  return pts
}
const PROFILE = profilePoints()

/**
 * Bài "Khối tròn xoay" (3D):
 * 0 — the curve in space + the axis it will spin around
 * 1 — sweep φ 0→2π: the surface of revolution appears
 * 2 — disk method: stack of disks approximates the volume
 * 3 — one cross-section slice sweeping along the axis
 * 4 — N→∞ (user slider): sum converges to V = π∫f²
 */
export function RevolutionScene({ step }: SceneProps) {
  const { playheadRef } = useLessonClock()
  const liveRef = useRef<Live>({ phi: Math.PI * 2, n: 1, sum: 0, xs: 0 })
  const [userN, setUserN] = useState<number | null>(null)
  const col = use3dColors()

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [4.6, 2.8, 5.4], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 7, 4]} intensity={1.25} />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} color={col.rim} />
        <Grid
          position={[1.5, -1.6, 0]}
          args={[12, 12]}
          cellSize={0.5}
          cellColor={col.gridA}
          sectionSize={1.5}
          sectionColor={col.gridB}
          fadeDistance={16}
          infiniteGrid
        />
        <Scene3D step={step} playheadRef={playheadRef} liveRef={liveRef} userN={userN} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={14}
          target={[1.5, 0, 0]}
          makeDefault
        />
      </Canvas>

      <Hud3d step={step} liveRef={liveRef} />
      {step === 4 && (
        <div className="absolute bottom-4 left-1/2 flex w-64 -translate-x-1/2 flex-col gap-1.5 rounded-2xl border border-edge bg-bg/85 p-3 backdrop-blur">
          <div className="flex justify-between text-[11px] font-semibold text-dim">
            <span>số đĩa n = {userN ?? 'tự động'}</span>
            {userN !== null && (
              <button onClick={() => setUserN(null)} className="text-curve hover:underline">
                tự động
              </button>
            )}
          </div>
          <input
            type="range"
            min={1}
            max={150}
            value={userN ?? 20}
            onChange={(e) => setUserN(Number(e.target.value))}
            className="accent-teal"
            aria-label="Số đĩa"
          />
        </div>
      )}
    </div>
  )
}

function Scene3D({
  step,
  playheadRef,
  liveRef,
  userN,
}: {
  step: number
  playheadRef: { current: number }
  liveRef: LiveRef
  userN: number | null
}) {
  const col = use3dColors()
  const solid = useRef<THREE.Mesh>(null)
  const disks = useRef<THREE.InstancedMesh>(null)
  const slice = useRef<THREE.Mesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lastPhi = useRef(-1)
  const lastSliceX = useRef(-1)
  const phiSm = useRef(Math.PI * 2)
  const solidOpacity = useRef(0.85)

  useFrame(() => {
    const ph = playheadRef.current
    // per-step targets
    const phiTarget = step <= 0 ? 0.0001 : step === 1 ? Math.max(0.02, easeInOutSine(ph) * Math.PI * 2) : Math.PI * 2
    phiSm.current = lerp(phiSm.current, phiTarget, 0.14)
    const phi = step === 1 ? phiSm.current : phiTarget

    // solid mesh
    const m = solid.current
    if (m) {
      const roundedPhi = Math.round(phi * 1000) / 1000
      if (roundedPhi !== lastPhi.current) {
        m.geometry.dispose()
        m.geometry = new THREE.LatheGeometry(PROFILE, 64, 0, roundedPhi)
        lastPhi.current = roundedPhi
      }
      const ghost = step === 2 || step === 3 || step === 4
      solidOpacity.current = lerp(solidOpacity.current, ghost ? 0.12 : 0.85, 0.12)
      const mat = m.material as THREE.MeshStandardMaterial
      mat.opacity = solidOpacity.current
    }

    // disks
    const d = disks.current
    if (d) {
      const autoN =
        step === 2
          ? Math.max(2, Math.round(lerp(2, 36, easeInOutSine(ph))))
          : step === 4
            ? Math.max(2, Math.round(lerp(2, 140, easeInOutSine(ph))))
            : 0
      const n = step === 4 && userN !== null ? userN : autoN
      d.count = n > 0 ? n : 0
      if (n > 0) {
        const dx = (B - A) / n
        for (let i = 0; i < n; i++) {
          const x = A + i * dx
          const r = f(x + dx / 2)
          dummy.position.set(x + dx / 2, 0, 0)
          dummy.rotation.set(0, 0, Math.PI / 2) // cylinder Y-axis → X-axis
          dummy.scale.set(r, dx * 0.94, r)
          dummy.updateMatrix()
          d.setMatrixAt(i, dummy.matrix)
        }
        d.instanceMatrix.needsUpdate = true
        liveRef.current.n = n
        liveRef.current.sum = diskVolume(n)
      }
    }

    // sweeping cross-section slice
    const s = slice.current
    if (s) {
      const active = step === 3
      s.visible = active
      if (active) {
        const xs = lerp(A + 0.05, B - 0.05, easeInOutSine(ph))
        const rounded = Math.round(xs * 200) / 200
        if (rounded !== lastSliceX.current) {
          s.geometry.dispose()
          s.geometry = new THREE.CircleGeometry(f(xs), 48)
          s.position.set(xs, 0, 0)
          lastSliceX.current = rounded
        }
        liveRef.current.xs = xs
      }
    }

    liveRef.current.phi = phi
  })

  return (
    <group>
      {/* axis Ox */}
      <Line
        points={[
          [A - 0.6, 0, 0],
          [B + 0.8, 0, 0],
        ]}
        color={col.gold}
        lineWidth={2}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />
      {/* generating curve y=f(x) in the xy-plane */}
      <Line
        points={Array.from({ length: 73 }, (_, i) => {
          const x = A + ((B - A) * i) / 72
          return [x, f(x), 0] as [number, number, number]
        })}
        color={col.gold}
        lineWidth={2.5}
      />

      {/* surface of revolution (lathe around axis Ox via rotation) */}
      <mesh ref={solid} rotation={[0, 0, -Math.PI / 2]}>
        <meshStandardMaterial
          color={col.solid}
          transparent
          opacity={0.85}
          roughness={0.35}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* disk stack (instanced cylinders) */}
      <instancedMesh ref={disks} args={[undefined, undefined, 150]}>
        <cylinderGeometry args={[1, 1, 1, 40]} />
        <meshStandardMaterial color={col.disk} transparent opacity={0.5} roughness={0.4} />
      </instancedMesh>

      {/* cross-section circle */}
      <mesh ref={slice} rotation={[0, Math.PI / 2, 0]} visible={false}>
        <meshBasicMaterial color={col.gold} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** HTML HUD fed by the 3D loop (updates textContent directly, no re-render) */
function Hud3d({ step, liveRef }: { step: number; liveRef: LiveRef }) {
  const lines = useRef<HTMLDivElement>(null)
  useFrameHud(() => {
    const el = lines.current
    if (!el) return
    const L = liveRef.current
    const rows: string[][] = [
      ['y = f(x)', 'quay quanh trục Ox'],
      [`φ = ${Math.round((L.phi * 180) / Math.PI)}°`, 'kéo để xoay góc nhìn ↻'],
      ['phương pháp đĩa', `n = ${L.n}`],
      [`x = ${L.xs.toFixed(2)}`, `bán kính R = ${f(L.xs).toFixed(2)}`],
      [`n = ${L.n}`, `ΣV = ${L.sum.toFixed(4)}`, `V = ${V_EXACT.toFixed(4)}`, `sai số = ${(L.sum - V_EXACT).toFixed(4)}`],
    ]
    el.textContent = (rows[step] ?? []).join('   ·   ')
  })
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 md:top-4">
      <div
        ref={lines}
        className="rounded-full border border-edge bg-bg/85 px-4 py-1.5 font-mono text-[12px] text-ink backdrop-blur"
      />
    </div>
  )
}

/** rAF hook usable outside the R3F canvas */
function useFrameHud(fn: () => void) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    let raf = 0
    const loop = () => {
      ref.current()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
}
