import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ConstellationBackground } from './components/ConstellationBackground'
import { Navigation } from './components/Navigation'
import { HomePage } from './components/pages/HomePage'
import { JoinPage } from './components/pages/JoinPage'
import { ConnectPage } from './components/pages/ConnectPage'
import { AuthCallbackPage } from './components/pages/AuthCallbackPage'
import { WalletPage } from './components/pages/WalletPage'
import { StatusPage } from './components/pages/StatusPage'
import { PartnersPage } from './components/pages/PartnersPage'
import { AdminPage } from './components/pages/AdminPage'
import { useXummAuth } from '@/hooks/use-xumm-auth'

function App() {
  const [currentPage, setCurrentPage] = useState('Home')
  const { sessionExp, ready } = useXummAuth()

  // Sync with location hash for simple routing (/#/Connect etc.)
  useEffect(() => {
    const applyFromHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#/', '') : ''
      if (hash) setCurrentPage(decodeURIComponent(hash))
    }
    applyFromHash()
    window.addEventListener('hashchange', applyFromHash)
    return () => window.removeEventListener('hashchange', applyFromHash)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'Join':
        return <JoinPage />
      case 'Connect':
        return <ConnectPage />
      case 'auth/callback':
        return <AuthCallbackPage />
      case 'Wallet':
        if (!ready) return <div className="min-h-screen px-6 pt-24 pb-12"><div className="max-w-2xl mx-auto">Checking session…</div></div>
        if (!sessionExp) {
          return (
            <div className="min-h-screen px-6 pt-24 pb-12">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-primary">Sign in required</h2>
                <p className="text-muted-foreground">You need to connect your wallet before accessing the vault.</p>
                <button className="underline" onClick={() => setCurrentPage('Connect')}>Go to Connect</button>
              </div>
            </div>
          )
        }
        return <WalletPage />
      case 'Status':
        return <StatusPage />
      case 'Partners':
        return <PartnersPage />
      case 'Admin':
        return <AdminPage onNavigate={setCurrentPage} />
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="relative min-h-screen">
      <ConstellationBackground />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      <Toaster position="top-right" theme="dark" />
    </div>
  )
}

export default App