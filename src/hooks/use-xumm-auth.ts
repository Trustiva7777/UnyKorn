import { useEffect, useState } from 'react'
import { XummPkce } from 'xumm-oauth2-pkce'

const clientId = import.meta.env.VITE_XUMM_CLIENT_ID as string | undefined
const baseUrl = (import.meta.env.VITE_BASE_URL as string | undefined) || (typeof window !== 'undefined' ? window.location.origin : '')
const redirectUrl = `${baseUrl}/auth/callback`

export function useXummAuth() {
  const [xumm, setXumm] = useState<XummPkce | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!clientId || !baseUrl) {
      setReady(true)
      return
    }
    const instance = new XummPkce({ clientId, redirectUrl })
    setXumm(instance)
    instance
      .handleCallback()
      .then(async (authed) => {
        if (authed) {
          const token = await instance.getToken()
          setJwt(token ?? null)
          const me = await instance.userInfo().catch(() => null)
          setProfile(me)
          if (token) {
            localStorage.setItem('xumm_jwt', token)
            // Create server-side session cookie
            try {
              await fetch(`${import.meta.env.VITE_API_BASE}/auth/session`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
              })
            } catch {}
          }
        } else {
          const existing = typeof window !== 'undefined' ? localStorage.getItem('xumm_jwt') : null
          if (existing) setJwt(existing)
        }
      })
      .finally(() => setReady(true))
      .catch(() => setReady(true))
  }, [])

  const login = async () => {
    await xumm?.authorize()
  }
  const logout = async () => {
    await xumm?.logout()
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {}
    if (typeof window !== 'undefined') localStorage.removeItem('xumm_jwt')
    setJwt(null)
    setProfile(null)
  }

  return { login, logout, jwt, profile, ready }
}
