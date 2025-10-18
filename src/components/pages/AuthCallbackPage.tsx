import { useEffect } from 'react'

export function AuthCallbackPage() {
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== 'undefined') window.location.hash = '#/Wallet'
    }, 1000)
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
