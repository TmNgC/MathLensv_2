/** Supported languages — English is the default for new visitors. */
export type Lang = 'en' | 'vi' | 'fr' | 'zh' | 'ja'

export const LANGS: Array<{ code: Lang; label: string; flag: string }> = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
]

export const DEFAULT_LANG: Lang = 'en'

const KEY = 'mathlens:lang'

export function normalizeLang(v: string | null | undefined): Lang | null {
  return LANGS.some((l) => l.code === v) ? (v as Lang) : null
}

/** Read the persisted language (called once at startup). */
export function bootLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const stored = normalizeLang(window.localStorage.getItem(KEY))
  if (stored) return stored
  // follow the browser's first preferred language when we speak it
  for (const tag of navigator.languages ?? []) {
    const base = tag.slice(0, 2).toLowerCase()
    const hit = normalizeLang(base)
    if (hit) return hit
  }
  return DEFAULT_LANG
}

export function persistLang(lang: Lang): void {
  try {
    window.localStorage.setItem(KEY, lang)
  } catch {
    /* private mode — ignore */
  }
}

/** Map a UI lang to the instruction used in serverless LLM prompts. */
export const LLM_LANGUAGE_NAMES: Record<Lang, string> = {
  en: 'English',
  vi: 'Vietnamese',
  fr: 'French',
  zh: 'Simplified Chinese',
  ja: 'Japanese',
}
