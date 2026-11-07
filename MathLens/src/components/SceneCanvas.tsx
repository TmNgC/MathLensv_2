import { useStage } from '../engine/useStage'
import type { Stage } from '../engine/Stage'

/** Full-bleed 2D canvas for calc scenes (mounted inside LessonShell stage). */
export function SceneCanvas({ draw }: { draw: (stage: Stage) => void }) {
  const { canvasRef } = useStage(draw)
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none"
      aria-label="Hình ảnh tương tác — kéo các điểm để khám phá"
    />
  )
}
