import { motion } from 'framer-motion'

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const pages = ['Home', 'Join', 'Connect', 'Wallet', 'Status', 'Partners', 'Admin']

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🦄</div>
            <div className="font-bold text-lg tracking-tight text-primary">UNYKORN</div>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {pages.map(page => (
              <button
                key={page}
                onClick={() => { onNavigate(page); if (typeof window !== 'undefined') window.location.hash = `#/${encodeURIComponent(page)}` }}
                className="relative px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors"
              >
                <span className={currentPage === page ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}>
                  {page}
                </span>
                {currentPage === page && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {pages.map(page => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`text-xs px-2 py-1 rounded ${
                  currentPage === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {page.charAt(0)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
