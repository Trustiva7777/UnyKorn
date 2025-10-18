import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useXummAuth } from '@/hooks/use-xumm-auth'

export function ConnectPage() {
  const { login, logout, jwt, profile, ready } = useXummAuth()

  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Connect Wallet</h1>
          <p className="text-muted-foreground">Sign in with Xaman (Xumm) using PKCE OAuth2</p>
        </motion.div>

        <Card className="p-8 bg-card border-primary/20 space-y-4">
          {!ready ? (
            <p className="text-sm text-muted-foreground">Initializing…</p>
          ) : !jwt ? (
            <Button onClick={login} className="w-full">Sign in with Xaman</Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">Signed in</p>
              <pre className="text-xs p-3 bg-background rounded border border-border overflow-auto">
                {JSON.stringify(profile ?? { jwt }, null, 2)}
              </pre>
              <Button variant="outline" onClick={logout} className="w-full">Sign out</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
