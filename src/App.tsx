import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ConstellationBackground } from './components/ConstellationBackground'
import { Navigation } from './components/Navigation'
import { HomePage } from './components/pages/HomePage'
import { JoinPage } from './components/pages/JoinPage'
import { WalletPage } from './components/pages/WalletPage'
import { StatusPage } from './components/pages/StatusPage'
import { PartnersPage } from './components/pages/PartnersPage'
import { AdminPage } from './components/pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('Home')

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'Join':
        return <JoinPage />
      case 'Wallet':
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