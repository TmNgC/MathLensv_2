import { useEffect, useRef } from 'react'
import { Stage } from './Stage'

/**
 * Mount a Stage on a canvas element. The draw callback is kept in a ref,
 * so scenes can close over React state freely and re-render cheaply —
 * the rAF loop always calls the latest draw.
 */
export function useStage(draw: (stage: Stage) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<Stage | null>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const stage = new Stage()
    stage.attach(canvasRef.current!, (s) => drawRef.current(s))
    stageRef.current = stage
    return () => {
      stage.detach()
      stageRef.current = null
    }
  }, [])

  return { canvasRef, stageRef }
}
