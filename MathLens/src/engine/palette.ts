/**
 * Canvas palette — mirrors the CSS tokens in index.css and follows the
 * live theme (dark neon default, `html.light` for light mode). Exposed
 * as getters so every draw frame resolves the current theme.
 */
const DARK = {
  bg: '#0a0e20',
  bgSoft: '#0e142a',
  grid: '#222e5c',
  axis: '#5d76c8',
  ink: '#eef2ff',
  dim: '#a9b6e6',
  faint: '#6d7ab0',
  curve: '#45e0ff',
  gold: '#ffe066',
  mint: '#4dffa0',
  coral: '#ff7a7a',
  teal: '#2dffd8',
  violet: '#cd9bff',
} as const

const LIGHT = {
  bg: '#f6f8fd',
  bgSoft: '#eef1f9',
  grid: '#e6eaf5',
  axis: '#b3bdd6',
  ink: '#171a2e',
  dim: '#49536e',
  faint: '#8a93b0',
  curve: '#0077d9',
  gold: '#b86e00',
  mint: '#0a9e58',
  coral: '#d92c2c',
  teal: '#0d8f7e',
  violet: '#7d3fd6',
} as const

type Palette = Record<keyof typeof DARK, string>

export function isLightTheme(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('light')
}

function theme(): Palette {
  return isLightTheme() ? LIGHT : DARK
}

export const C: Palette = {
  get bg() {
    return theme().bg
  },
  get bgSoft() {
    return theme().bgSoft
  },
  get grid() {
    return theme().grid
  },
  get axis() {
    return theme().axis
  },
  get ink() {
    return theme().ink
  },
  get dim() {
    return theme().dim
  },
  get faint() {
    return theme().faint
  },
  get curve() {
    return theme().curve
  },
  get gold() {
    return theme().gold
  },
  get mint() {
    return theme().mint
  },
  get coral() {
    return theme().coral
  },
  get teal() {
    return theme().teal
  },
  get violet() {
    return theme().violet
  },
}

export const MONO = '"JetBrains Mono", ui-monospace, monospace'
export const SANS = '"Be Vietnam Pro", sans-serif'
