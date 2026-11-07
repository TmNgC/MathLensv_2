/** small UI helpers shared by the profile components */

/** deterministic accent per name so the same student keeps the same colour */
export function avatarColor(key: string): string {
  const palette = ['#58c4dd', '#2dd4bf', '#97e3a2', '#ffd35c', '#ff8b8b', '#b28ddd', '#f0a64a', '#5b9be6']
  let h = 0
  for (const ch of key) h = (h * 31 + ch.codePointAt(0)!) >>> 0
  return palette[h % palette.length]
}

export const CHOOSE_USER_EVENT = 'mathlens:choose-user'

/** ask the root <UserGate> to open the "who is learning?" dialog */
export function openUserDialog() {
  window.dispatchEvent(new Event(CHOOSE_USER_EVENT))
}
