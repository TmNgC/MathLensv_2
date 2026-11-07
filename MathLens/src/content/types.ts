import type { ComponentType } from 'react'

/** Props every lesson scene receives from the shell. */
export interface SceneProps {
  /** current step index (drives React re-render) */
  step: number
}

/**
 * The shared lesson clock, provided by LessonShell. Scenes read these
 * refs inside their draw loop — playhead advances at 60fps without
 * re-rendering React.
 */
export interface LessonClock {
  step: number
  /** 0..1 progress through the current step's animation, looping */
  playheadRef: { current: number }
  pausedRef: { current: boolean }
}

export interface LessonStep {
  title: string
  /** Vietnamese prose; $...$ segments render as inline KaTeX */
  body: string
  /** seconds for one full playhead sweep (default 6) */
  duration?: number
  /** optional "Bạn có biết?" story — collapsible gold disclosure */
  funFact?: { title: string; body: string }
}

/** one block of the per-lesson theory document */
export interface TheorySection {
  heading: string
  /** def = definition box · example = worked example · warn = common mistakes · note/text = plain · history = opening narrative */
  kind?: 'def' | 'example' | 'warn' | 'note' | 'text' | 'history'
  /** prose with $latex$ */
  body: string
  /** optional notation table rendered under the body */
  table?: Array<{ sym: string; meaning: string }>
}

export interface Lesson {
  id: string
  number: number
  title: string
  subtitle: string
  /** 'calc' 2D canvas · 'geo3d' R3F canvas · 'lab' playground · 'theory' document-only */
  kind: 'calc' | 'geo3d' | 'lab' | 'theory'
  /** accent color (hex) for cards and rail */
  accent: string
  /** emoji or short glyph for cards */
  glyph: string
  /** theory-only lessons use a single stub step so progress tracking works */
  steps: LessonStep[]
  /** theory/notation document ('theory' lessons REQUIRE it; others optional tab) */
  theory?: TheorySection[]
  /** absent for 'theory' lessons */
  Scene?: ComponentType<SceneProps>
}
