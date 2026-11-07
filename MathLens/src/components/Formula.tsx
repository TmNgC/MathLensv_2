import { useMemo } from 'react'
import katex from 'katex'

const escapeHtml = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

/**
 * Renders prose containing math: "độ dốc $\\frac{dy}{dx}$ của đường cong".
 * $...$ renders inline; $$...$$ renders as a display block.
 */
export function Formula({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => {
    const out: string[] = []
    const re = /\$\$(.+?)\$\$|\$(.+?)\$/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(escapeHtml(text.slice(last, m.index)))
      const display = m[1] !== undefined
      out.push(
        katex.renderToString(display ? m[1] : m[2]!, {
          throwOnError: false,
          displayMode: display,
        }),
      )
      last = m.index + m[0].length
    }
    if (last < text.length) out.push(escapeHtml(text.slice(last)))
    return out.join('')
  }, [text])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
