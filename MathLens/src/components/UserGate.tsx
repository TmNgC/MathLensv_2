import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  NAME_MAX,
  continueAsGuest,
  needsChoice,
  removeProfile,
  signIn,
  signOut,
  useUser,
  validateName,
} from '../lib/user'
import { useLang } from '../i18n/LangContext'
import { CHOOSE_USER_EVENT, avatarColor, openUserDialog } from '../lib/userUi'

const initial = (name: string) => name.trim().charAt(0).toLocaleUpperCase('vi') || '?'

export function Avatar({ name, userKey, size = 32 }: { name: string; userKey: string; size?: number }) {
  const c = avatarColor(userKey)
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold"
      style={{ width: size, height: size, background: `${c}26`, color: c, fontSize: size * 0.45 }}
      aria-hidden
    >
      {initial(name)}
    </span>
  )
}

/**
 * Mounted once at the app root. Opens the "who is learning?" dialog when this
 * tab has not chosen a profile (or guest mode) yet, or when asked to.
 */
export function UserGate() {
  const state = useUser()
  const [forced, setForced] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const open = () => setForced(true)
    window.addEventListener(CHOOSE_USER_EVENT, open)
    return () => window.removeEventListener(CHOOSE_USER_EVENT, open)
  }, [])

  const liveRoute = pathname === '/live' || pathname.startsWith('/play')
  const show = forced || (needsChoice() && !liveRoute)
  if (!show) return null
  return <UserDialog users={state.users} onDone={() => setForced(false)} canClose={!needsChoice()} />
}

function UserDialog({
  users,
  onDone,
  canClose,
}: {
  users: ReturnType<typeof useUser>['users']
  onDone: () => void
  canClose: boolean
}) {
  const { t } = useLang()
  const [name, setName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    const e = validateName(name)
    if (e) {
      setErr(t(e))
      return
    }
    signIn(name)
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="who-title">
      <div className="rise w-full max-w-md rounded-2xl border border-edge bg-panel p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">MathLens</p>
            <h2 id="who-title" className="mt-1 text-xl font-extrabold">{t('user.who')}</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{t('user.whoSub')}</p>
          </div>
          {canClose && (
            <button onClick={onDone} className="rounded-full px-2 text-xl leading-none text-faint hover:text-ink" aria-label={t('user.close')}>
              ×
            </button>
          )}
        </div>

        {users.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-bold text-dim">{t('user.onDevice')}</p>
              <button onClick={() => setEditing((v) => !v)} className="text-[11.5px] font-semibold text-faint hover:text-ink">
                {editing ? t('user.done') : t('user.manage')}
              </button>
            </div>
            <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
              {users.map((u) => (
                <div key={u.key} className="flex items-center gap-2 rounded-xl border border-edge bg-panel-2 p-2.5">
                  <button
                    onClick={() => {
                      signIn(u.name)
                      onDone()
                    }}
                    disabled={editing}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <Avatar name={u.name} userKey={u.key} />
                    <span className="min-w-0 truncate text-[13.5px] font-semibold">{u.name}</span>
                  </button>
                  {editing && (
                    <button
                      onClick={() => {
                        if (confirm(t('user.removeConfirm', { name: u.name }))) removeProfile(u.key)
                      }}
                      className="rounded-lg px-2 py-1 text-[11px] font-bold text-coral hover:bg-coral/10"
                    >
                      {t('user.remove')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="ml-username" className="mb-1.5 block text-[12px] font-bold text-dim">
            {users.length > 0 ? t('user.newName') : t('user.yourName')}
          </label>
          <div className="flex gap-2">
            <input
              id="ml-username"
              ref={inputRef}
              value={name}
              maxLength={NAME_MAX + 5}
              onChange={(e) => {
                setName(e.target.value)
                setErr(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={t('user.placeholder')}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-edge bg-panel-2 px-3.5 py-2.5 text-[14px] outline-none focus:border-curve/60"
            />
            <button onClick={submit} className="rounded-xl bg-curve px-4 text-[13.5px] font-bold text-[#08101c] transition-transform hover:scale-[1.02]">
              {t('user.go')}
            </button>
          </div>
          {err && <p className="mt-1.5 text-[11.5px] font-semibold text-coral">{err}</p>}
          <p className="mt-2 text-[11px] leading-relaxed text-faint">{t('user.note')}</p>
        </div>

        <button
          onClick={() => {
            continueAsGuest()
            onDone()
          }}
          className="mt-4 w-full rounded-xl border border-edge py-2.5 text-[12.5px] font-semibold text-dim transition-colors hover:text-ink"
        >
          {t('user.guest')}
        </button>
      </div>
    </div>
  )
}

/** compact chip showing who is learning; click to switch */
export function UserBadge({ compact = false }: { compact?: boolean }) {
  const { user } = useUser()
  const { t } = useLang()
  return (
    <button
      onClick={openUserDialog}
      title={user ? t('user.switchTitle', { name: user.name }) : t('user.signInTitle')}
      className={`flex shrink-0 items-center gap-2 rounded-full border border-edge bg-panel-2 text-dim transition-colors hover:text-ink ${
        compact ? 'size-9 justify-center' : 'h-9 max-w-[11rem] pl-1 pr-3'
      }`}
    >
      {user ? (
        <>
          <Avatar name={user.name} userKey={user.key} size={28} />
          {!compact && <span className="truncate text-[12.5px] font-semibold text-ink">{user.name}</span>}
        </>
      ) : (
        <>
          <span className="grid size-7 place-items-center rounded-full bg-edge text-[13px]">👤</span>
          {!compact && <span className="text-[12px] font-semibold">{t('user.guestShort')}</span>}
        </>
      )}
    </button>
  )
}

/** "sign out" link used on the leaderboard page */
export function SignOutLink() {
  const { user } = useUser()
  const { t } = useLang()
  if (!user) return null
  return (
    <button onClick={signOut} className="text-[12px] font-semibold text-faint hover:text-ink">
      {t('user.signOut')}
    </button>
  )
}
