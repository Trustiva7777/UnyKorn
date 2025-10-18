export function parseJwt(t: string): any {
  try {
    const [, p] = t.split('.')
    return JSON.parse(atob(p || ''))
  } catch {
    return {}
  }
}

export function secondsLeft(t: string): number {
  const payload = parseJwt(t)
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  return Math.max(0, exp - Math.floor(Date.now() / 1000))
}
