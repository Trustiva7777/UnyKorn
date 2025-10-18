import { useEffect } from 'react'
import { useXummAuth } from '@/hooks/use-xumm-auth'

export function AuthCallbackPage() {
  const { ready, jwt } = useXummAuth()
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== 'undefined' && (ready || jwt)) {
        window.location.hash = '#/Wallet'
      }
    }, 1200)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <p>Completing sign-in…</p>
      </div>
    </div>
  )
}
