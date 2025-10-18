import { useCallback, useEffect, useRef, useState } from 'react'
import { XummPkce, type ResolvedFlow } from 'xumm-oauth2-pkce'
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

    const instance = new XummPkce(clientId, { redirectUrl })
    setXumm(instance)

    const handleSession = async (session?: ResolvedFlow) => {
      try {
        if (!session) return
        const token = session.jwt
        setJwt(token ?? null)
        setProfile(session.me)
        if (token) {
          const csrfRes = await api.auth.csrf()
          const csrf = csrfRes.data?.csrf || ''
          const sess = await api.auth.session(token, csrf)
          const exp = sess.data?.exp
          setSessionExp(exp ?? null)
          scheduleRefresh(exp ?? null)
        }
      } catch {
        // Ignore
      }
    }

    instance.on('retrieved', async () => {
      const state = await instance.state()
      await handleSession(state)
      setReady(true)
    })
    instance.on('success', async () => {
      const state = await instance.state()
      await handleSession(state)
      setReady(true)
    })
    instance.on('error', () => setReady(true))

    // Also actively probe for existing state & cookie session
    const getState: () => Promise<ResolvedFlow | undefined> = () => (
      typeof instance.state === 'function' ? (instance.state() as Promise<ResolvedFlow | undefined>) : Promise.resolve(undefined)
    )
    getState().then(async (state) => {
      if (state?.jwt) {
        await handleSession(state)
      } else {
        const me = await api.me()
        if (me.data?.ok && me.data?.claims?.exp) {
          setSessionExp(me.data.claims.exp)
          scheduleRefresh(me.data.claims.exp)
        }
      }
      setReady(true)
    }).catch(() => setReady(true))
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
