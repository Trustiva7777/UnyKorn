import { useCallback, useEffect, useRef, useState } from 'react'
import { XummPkce } from 'xumm-oauth2-pkce'
import { api } from '@/lib/api'

const clientId = import.meta.env.VITE_XUMM_CLIENT_ID as string | undefined
const baseUrl = (import.meta.env.VITE_BASE_URL as string | undefined) || (typeof window !== 'undefined' ? window.location.origin : '')
const redirectUrl = `${baseUrl}/auth/callback`

export function useXummAuth() {
  const [xumm, setXumm] = useState<XummPkce | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sessionExp, setSessionExp] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const refreshTimer = useRef<number | null>(null)

  const clearRefreshTimer = () => {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current)
      refreshTimer.current = null
    }
  }

  const scheduleRefresh = useCallback((expSeconds?: number | null) => {
    clearRefreshTimer()
    if (!expSeconds || expSeconds <= 0) return
    const msUntilExp = expSeconds * 1000 - Date.now()
    // fire 2 minutes before expiry (min 5s clamp)
    const fireIn = Math.max(5000, msUntilExp - 2 * 60 * 1000)
    refreshTimer.current = window.setTimeout(async () => {
      try {
        // Try to silently refresh by prompting PKCE re-auth; this preserves session if user confirms
        await xumm?.authorize()
      } catch {}
    }, fireIn)
  }, [xumm])

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
            try {
              // Get CSRF token
              const csrfRes = await api.auth.csrf()
              const csrf = csrfRes.data?.csrf || ''
              // Create server-side session cookie (Bearer allowed here only)
              const sess = await api.auth.session(token, csrf)
              const exp = sess.data?.exp
              setSessionExp(exp ?? null)
              scheduleRefresh(exp ?? null)
            } catch {}
          }
        } else {
          // Probe existing cookie session
          const me = await api.me()
          if (me.data?.ok && me.data?.claims?.exp) {
            setSessionExp(me.data.claims.exp)
            scheduleRefresh(me.data.claims.exp)
          }
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
      const csrfRes = await api.auth.csrf()
      const csrf = csrfRes.data?.csrf || ''
      await api.auth.logout(csrf)
    } catch {}
    clearRefreshTimer()
    setJwt(null)
    setProfile(null)
    setSessionExp(null)
  }

  return { login, logout, jwt, profile, sessionExp, ready }
}
