import { useEffect, useRef, useState } from 'react'
import { LANGS } from '../i18n'
import { useLang } from '../i18n/LangContext'

/** 🌐 pill — opens a small dropdown listing every supported language. */
export function LanguagePicker({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`grid size-9 place-items-center rounded-full border border-edge bg-panel-2 text-dim transition-colors hover:text-ink ${className}`}
        aria-label={t('lang.name')}
        title={t('lang.name')}
        aria-expanded={open}
      >
        <svg viewBox="0 0 16 16" className="size-4 fill-none stroke-current" strokeWidth="1.3">
          <circle cx="8" cy="8" r="6.2" />
          <path d="M1.8 8h12.4M8 1.8c-1.9 1.9-2.7 4-2.7 6.2s.8 4.3 2.7 6.2c1.9-1.9 2.7-4 2.7-6.2S9.9 3.7 8 1.8Z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-edge bg-panel shadow-xl">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold transition-colors ${
                l.code === lang ? 'bg-curve/15 text-curve' : 'text-dim hover:bg-panel-2 hover:text-ink'
              }`}
            >
              <span className="text-[15px] leading-none">{l.flag}</span>
              {l.label}
              {l.code === lang && <span className="ml-auto text-[11px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
