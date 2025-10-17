import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Warning, FileText } from '@phosphor-icons/react'

export function StatusPage() {
  const statusItems = [
    { label: 'Chain Status', value: 'Operational', status: 'success', icon: CheckCircle },
    { label: 'XRPL Connectivity', value: 'Online', status: 'success', icon: CheckCircle },
    { label: 'Vault Registry', value: 'Synced', status: 'success', icon: CheckCircle, detail: 'Last block #8,472,391' },
    { label: 'Chainlink Proof of Reserve', value: 'Verified', status: 'success', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">System Status</h1>
          <p className="text-muted-foreground">Real-time infrastructure monitoring and proof verification</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {statusItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-mono">
                      {item.label}
                    </h3>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    {item.detail && (
                      <p className="text-xs text-muted-foreground font-mono">{item.detail}</p>
                    )}
                  </div>
                  <item.icon
                    size={32}
                    weight="fill"
                    className={item.status === 'success' ? 'text-accent' : 'text-destructive'}
                  />
                </div>
                <Badge className={item.status === 'success' ? 'bg-accent/20 text-accent border-accent/40' : 'bg-destructive/20 text-destructive border-destructive/40'}>
                  {item.status === 'success' ? '✓ Active' : '⚠ Alert'}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="p-8 space-y-6 bg-card border-primary/20">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Network Metrics</h2>
              <p className="text-sm text-muted-foreground">Live performance indicators</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Uptime</p>
                <p className="text-3xl font-mono font-bold text-primary">99.98%</p>
                <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '99.98%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Avg Response</p>
                <p className="text-3xl font-mono font-bold text-primary">42ms</p>
                <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">TPS</p>
                <p className="text-3xl font-mono font-bold text-primary">1,247</p>
                <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Active Vaults</p>
                <p className="text-3xl font-mono font-bold text-primary">8.4K</p>
                <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="p-8 bg-card border-primary/20 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
                <FileText size={32} className="text-primary" weight="duotone" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Auditable by Design</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every proof notarized on IPFS. Complete transparency for regulators and institutional auditors.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider font-semibold mt-4"
              >
                <FileText size={18} className="mr-2" />
                View Attestation Bundle
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card className="p-6 bg-card border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Verifications</h3>
            <div className="space-y-3">
              {[
                { time: '2 min ago', event: 'Vault collateral verified', hash: '0x7a9f...3d2e' },
                { time: '8 min ago', event: 'IPFS proof notarized', hash: 'Qm5X4...h7Jk' },
                { time: '15 min ago', event: 'Chainlink oracle updated', hash: '0x3b2c...9f1a' },
                { time: '23 min ago', event: 'Compliance check passed', hash: '0x8d4e...2c7b' }
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-foreground">{log.event}</p>
                    <p className="text-xs font-mono text-muted-foreground">{log.hash}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
