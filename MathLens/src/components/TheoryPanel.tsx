import type { TheorySection } from '../content/types'
import { Formula } from './Formula'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'

/**
 * "Lý thuyết" tab — scrollable KaTeX document with definition boxes,
 * notation tables, worked examples and common-mistakes warnings.
 */
export function TheoryPanel({
  title,
  accent,
  sections,
}: {
  title: string
  accent: string
  sections: TheorySection[]
}) {
  const { t } = useLang()
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
          {t('theory.ref')}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold">
          {t('theory.docPrefix')} <span style={{ color: accent }}>{title}</span>
        </h1>

        <div className="mt-6 space-y-5">
          {sections.map((s, i) => (
            <Section key={i} section={s} accent={accent} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-edge bg-panel p-4 text-[12.5px] leading-relaxed text-dim">
          {t('theory.footerA')}{' '}
          <span className="font-semibold text-ink">{t('shell.visual')}</span>{' '}
          {t('theory.footerB')}{' '}
          <Link to="/quiz" className="font-semibold text-curve hover:underline">
            {t('rail.quiz')}
          </Link>{' '}
          {t('theory.footerC')}
        </div>
      </div>
    </div>
  )
}

function Section({ section, accent }: { section: TheorySection; accent: string }) {
  const { kind, heading, body, table } = section
  const { t } = useLang()

  const box =
    kind === 'def'
      ? 'border-l-[3px] border-curve bg-curve/[0.07]'
      : kind === 'warn'
        ? 'border-l-[3px] border-coral bg-coral/[0.07]'
        : kind === 'example'
          ? 'border-l-[3px] border-mint bg-mint/[0.06]'
          : kind === 'note'
            ? 'border-l-[3px] border-gold bg-gold/[0.06]'
            : kind === 'history'
              ? 'border-l-[3px] border-violet bg-violet/[0.07]'
              : 'border border-edge bg-panel'

  const chip =
    kind === 'def'
      ? t('theory.def')
      : kind === 'warn'
        ? t('theory.warn')
        : kind === 'example'
          ? t('theory.example')
          : kind === 'note'
            ? t('theory.note')
            : kind === 'history'
              ? t('theory.history')
              : null

  return (
    <section className={`rounded-2xl p-4.5 px-5 py-4 md:px-6 ${box}`}>
      <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
        {chip && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider"
            style={{
              background: `${accent}1f`,
              color: kind === 'warn' ? undefined : accent,
              ...(kind === 'warn' ? { color: '#ff8b8b' } : {}),
            }}
          >
            {chip}
          </span>
        )}
        <h2 className="text-[15.5px] font-bold">
          <Formula text={heading} />
        </h2>
      </div>
      <p className="text-[13.5px] leading-relaxed text-dim">
        <Formula text={body} />
      </p>
      {table && (
        <div className="mt-3 overflow-hidden rounded-xl border border-edge">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-panel-2 text-[11px] uppercase tracking-wider text-faint">
                <th className="px-3.5 py-2 font-semibold">{t('theory.sym')}</th>
                <th className="px-3.5 py-2 font-semibold">{t('theory.meaning')}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="border-t border-edge">
                  <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[13px] text-ink">
                    <Formula text={row.sym} />
                  </td>
                  <td className="px-3.5 py-2.5 text-[12.5px] text-dim">
                    <Formula text={row.meaning} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
