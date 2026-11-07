import { useIsLight, toggleTheme } from '../lib/theme'

/** sun/moon pill — flips the whole app (CSS tokens + canvas palette). */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const light = useIsLight()
  return (
    <button
      onClick={toggleTheme}
      className={`grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-panel-2 text-dim transition-colors hover:text-ink ${className}`}
      aria-label={light ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
      title={light ? 'Chế độ tối 🌙' : 'Chế độ sáng ☀️'}
    >
      {light ? (
        <svg viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 1.4a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2ZM7.3 1h1.4v1.8H7.3V1Zm0 12.2h1.4V15H7.3v-1.8ZM1 7.3h1.8v1.4H1V7.3Zm12.2 0H15v1.4h-1.8V7.3Zm2.1-4.1 1 1-1.3 1.3-1-1 1.3-1.3ZM2.7 12.8l1-1L5 13.1l-1 1-1.3-1.3Zm10.2-10.5 1 1 1.3-1.3-1-1-1.3 1.3ZM2.7 3.2l1.3 1.3 1-1L3.7 2.2l-1 1Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M13.5 9.6A6 6 0 0 1 6.4 2.5 6 6 0 1 0 13.5 9.6Zm-.9 1.9A6 6 0 0 1 4.5 3.4a6.6 6.6 0 1 1 8.1 8.1Z" />
        </svg>
      )}
    </button>
  )
}
