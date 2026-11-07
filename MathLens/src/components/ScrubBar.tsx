import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LangContext'

/**
 * Playhead scrubber. The fill width mirrors the shared playhead ref at
 * 60fps without re-rendering React; dragging writes the ref directly.
 */
export function ScrubBar({
  playheadRef,
  paused,
  onTogglePause,
  onStep,
}: {
  playheadRef: { current: number }
  paused: boolean
  onTogglePause: () => void
  onStep: (delta: number) => void
}) {
  const fillRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (fillRef.current) {
        fillRef.current.style.width = `${playheadRef.current * 100}%`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playheadRef])

  const scrubFrom = (e: React.PointerEvent) => {
    const r = trackRef.current!.getBoundingClientRect()
    playheadRef.current = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onTogglePause}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-curve/15 text-curve transition-colors hover:bg-curve/25"
        aria-label={paused ? t('scrub.play') : t('scrub.pause')}
        title={t('scrub.playToggle')}
      >
        {paused ? (
          <svg viewBox="0 0 16 16" className="size-4 fill-current">
            <path d="M4.5 2.8v10.4L13 8 4.5 2.8Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="size-4 fill-current">
            <path d="M4 3h2.8v10H4V3Zm5.2 0H12v10H9.2V3Z" />
          </svg>
        )}
      </button>

      <div
        ref={trackRef}
        className="relative h-6 flex-1 cursor-pointer touch-none select-none"
        onPointerDown={(e) => {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          scrubFrom(e)
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) scrubFrom(e)
        }}
        role="slider"
        aria-label={t('scrub.position')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(playheadRef.current * 100)}
      >
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-edge">
          <div
            ref={fillRef}
            className="h-full rounded-full bg-gradient-to-r from-curve to-teal"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onStep(-1)}
          className="grid size-9 place-items-center rounded-full bg-panel-2 text-dim transition-colors hover:bg-edge hover:text-ink"
          aria-label={t('scrub.prev')}
          title={t('scrub.prevKey')}
        >
          <svg viewBox="0 0 16 16" className="size-4 fill-current">
            <path d="M10.5 3.2v9.6L4 8l6.5-4.8ZM3 3h1.2v10H3V3Z" />
          </svg>
        </button>
        <button
          onClick={() => onStep(1)}
          className="grid size-9 place-items-center rounded-full bg-panel-2 text-dim transition-colors hover:bg-edge hover:text-ink"
          aria-label={t('scrub.next')}
          title={t('scrub.nextKey')}
        >
          <svg viewBox="0 0 16 16" className="size-4 fill-current">
            <path d="M5.5 3.2v9.6L12 8 5.5 3.2ZM11.8 3H13v10h-1.2V3Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
