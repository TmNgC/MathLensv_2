import { Formula } from './Formula'
import { useLang } from '../i18n/LangContext'

/**
 * "Bạn có biết?" — collapsible story disclosure in the step card.
 * Uses native <details> so it works without JS state and is accessible.
 */
export function FunFact({ fact }: { fact: { title: string; body: string } }) {
  const { t } = useLang()
  return (
    <details className="group mt-2.5 rounded-xl border border-gold/30 bg-gold/[0.06] open:bg-gold/[0.09]">
      <summary className="flex cursor-pointer select-none list-none items-center gap-2 px-3.5 py-2 text-[12px] font-bold text-gold [&::-webkit-details-marker]:hidden">
        <span aria-hidden>💡</span>
        <span className="min-w-0 flex-1 truncate">{t('funfact.label', { title: fact.title })}</span>
        <svg
          viewBox="0 0 16 16"
          className="size-3.5 shrink-0 fill-current opacity-60 transition-transform group-open:rotate-90"
          aria-hidden
        >
          <path d="M5.5 3.2v9.6L12 8 5.5 3.2Z" />
        </svg>
      </summary>
      <p className="border-t border-gold/20 px-3.5 pb-3 pt-2 text-[12.5px] leading-relaxed text-dim">
        <Formula text={fact.body} />
      </p>
    </details>
  )
}
