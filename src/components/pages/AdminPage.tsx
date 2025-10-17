import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Vault, Globe, Terminal, Lock } from '@phosphor-icons/react'
import { useState } from 'react'

interface AdminPageProps {
  onNavigate: (page: string) => void
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [commandOutput, setCommandOutput] = useState<string[]>([])

  const executeCommand = (cmd: string) => {
    setCommandOutput(prev => [
      ...prev,
      `$ ${cmd}`,
      cmd === 'ignite:verify' ? '✓ System verification complete. All proofs validated.' :
      cmd === 'vault:create' ? '✓ New vault created: rN7n...3d2e' :
      cmd === 'cf:sync' ? '✓ Cloudflare DNS synced. Deployment live.' :
      cmd === 'proof:export' ? '✓ Proof bundle exported to IPFS: QmX4f...h7Jk' :
      `✓ Command executed: ${cmd}`
    ])
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 max-w-md w-full space-y-6 bg-card border-primary/20 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Lock size={40} className="text-primary" weight="duotone" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Admin Command Hub</h2>
              <p className="text-sm text-muted-foreground">
                Wallet signature required for access
              </p>
            </div>
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => setIsAuthenticated(true)}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider font-semibold"
              >
                Authenticate with Wallet
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('Home')}
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
              >
                Return to Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-primary">Command Hub</h1>
            <p className="text-muted-foreground mt-1">Sovereign system administration</p>
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/40">Authenticated</Badge>
        </motion.div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="clients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users size={16} className="mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="vaults" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Vault size={16} className="mr-2" />
              Vaults
            </TabsTrigger>
            <TabsTrigger value="dns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Globe size={16} className="mr-2" />
              DNS / API
            </TabsTrigger>
            <TabsTrigger value="terminal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Terminal size={16} className="mr-2" />
              Terminal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card className="p-6 bg-card border-primary/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">Onboarded Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Address</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Balance</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">KYC</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { address: 'rN7n7otQ...FYsL', balance: '$42,350', kyc: 'Verified', status: 'Active' },
                      { address: 'rP4X2mnD...8hG2', balance: '$128,900', kyc: 'Verified', status: 'Active' },
                      { address: 'rK8fT3vN...Lk9P', balance: '$3,200', kyc: 'Pending', status: 'Onboarding' },
                      { address: 'rM2dH5wQ...Rt7K', balance: '$87,450', kyc: 'Verified', status: 'Active' }
                    ].map((client, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-background transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-foreground">{client.address}</td>
                        <td className="py-3 px-4 font-mono text-sm text-primary">{client.balance}</td>
                        <td className="py-3 px-4">
                          <Badge className={client.kyc === 'Verified' ? 'bg-accent/20 text-accent border-accent/40' : 'bg-muted/20 text-muted-foreground border-muted'}>
                            {client.kyc}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={client.status === 'Active' ? 'bg-primary/20 text-primary border-primary/40' : 'bg-muted/20 text-muted-foreground border-muted'}>
                            {client.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vaults">
            <Card className="p-6 bg-card border-primary/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">RWA Assets & Proofs</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Asset ID</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Type</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Value</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Proof Hash</th>
                      <th className="text-left py-3 px-4 text-sm text-muted-foreground uppercase tracking-wider font-mono">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'ASSET-001', type: 'Real Estate', value: '$2.4M', hash: '0x7a9f...3d2e', status: 'Verified' },
                      { id: 'ASSET-002', type: 'Gold Bar', value: '$78K', hash: '0x3b2c...9f1a', status: 'Verified' },
                      { id: 'ASSET-003', type: 'Bonds', value: '$500K', hash: '0x8d4e...2c7b', status: 'Pending' },
                      { id: 'ASSET-004', type: 'Commodity', value: '$156K', hash: '0x2f6a...8h3k', status: 'Verified' }
                    ].map((asset, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-background transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-foreground">{asset.id}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{asset.type}</td>
                        <td className="py-3 px-4 font-mono text-sm text-primary">{asset.value}</td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{asset.hash}</td>
                        <td className="py-3 px-4">
                          <Badge className={asset.status === 'Verified' ? 'bg-accent/20 text-accent border-accent/40' : 'bg-muted/20 text-muted-foreground border-muted'}>
                            {asset.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="dns">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-primary/20 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">DNS Configuration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground font-mono">unykorn.org</span>
                    <Badge className="bg-accent/20 text-accent border-accent/40">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground font-mono">api.unykorn.org</span>
                    <Badge className="bg-accent/20 text-accent border-accent/40">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground font-mono">vault.unykorn.org</span>
                    <Badge className="bg-accent/20 text-accent border-accent/40">Active</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => executeCommand('cf:sync')}
                >
                  Sync Cloudflare DNS
                </Button>
              </Card>

              <Card className="p-6 bg-card border-primary/20 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">API Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-foreground">REST API</span>
                    <Badge className="bg-accent/20 text-accent border-accent/40">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-foreground">WebSocket</span>
                    <Badge className="bg-accent/20 text-accent border-accent/40">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-foreground">XRPL Node</span>
                    <Badge className="bg-accent/20 text-accent border-accent/40">Synced</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-primary/40 text-primary hover:bg-primary/10"
                >
                  Restart Services
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="terminal">
            <Card className="p-6 bg-card border-primary/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground font-mono">System Terminal</h3>
                <Badge variant="outline" className="border-accent text-accent font-mono">root@unykorn</Badge>
              </div>

              <ScrollArea className="h-64 bg-background border border-border rounded-lg p-4">
                <div className="space-y-2 font-mono text-sm">
                  <p className="text-accent">Unykorn Command Interface v1.0.0</p>
                  <p className="text-muted-foreground">Type a command or select from quick actions below.</p>
                  <div className="h-px bg-border my-2" />
                  {commandOutput.map((line, i) => (
                    <p key={i} className={line.startsWith('$') ? 'text-primary' : 'text-foreground'}>
                      {line}
                    </p>
                  ))}
                </div>
              </ScrollArea>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCommand('ignite:verify')}
                  className="border-primary/40 text-primary hover:bg-primary/10 font-mono"
                >
                  ignite:verify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCommand('vault:create')}
                  className="border-primary/40 text-primary hover:bg-primary/10 font-mono"
                >
                  vault:create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCommand('cf:sync')}
                  className="border-primary/40 text-primary hover:bg-primary/10 font-mono"
                >
                  cf:sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCommand('proof:export')}
                  className="border-primary/40 text-primary hover:bg-primary/10 font-mono"
                >
                  proof:export
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
