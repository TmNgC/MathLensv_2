import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { bootLang, persistLang, type Lang } from './index'
import { translate } from './strings'
import { lessonMeta } from './lessonMeta'

export interface LangApi {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  /** localized lesson title (falls back to the Vietnamese original) */
  lessonTitle: (id: string, fallback: string) => string
  /** localized lesson subtitle */
  lessonSubtitle: (id: string, fallback: string) => string
}

const LangContext = createContext<LangApi | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(bootLang)

  const api = useMemo<LangApi>(() => {
    const setLang = (l: Lang) => {
      setLangState(l)
      persistLang(l)
    }
    return {
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      lessonTitle: (id, fallback) => lessonMeta[id]?.[lang]?.title ?? fallback,
      lessonSubtitle: (id, fallback) => lessonMeta[id]?.[lang]?.subtitle ?? fallback,
    }
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = api.t('app.title')
  }, [lang, api])

  return <LangContext.Provider value={api}>{children}</LangContext.Provider>
}

export function useLang(): LangApi {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
