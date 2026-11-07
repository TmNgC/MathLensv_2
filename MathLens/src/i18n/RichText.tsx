import { useLang } from './LangContext'

/** Translated string where *starred* segments render emphasized (<em>). */
export function RichText({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const { t } = useLang()
  const parts = t(k, vars).split(/\*([^*]+)\*/)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <em key={i}>{p}</em> : <span key={i}>{p}</span>,
      )}
    </>
  )
}
