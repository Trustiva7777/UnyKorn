import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Vault, ShieldCheck, CopySimple, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function WalletPage() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Your Vault Account</h1>
          <p className="text-muted-foreground">Sovereign digital identity and asset registry</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="p-8 space-y-6 bg-card border-primary/20 hover:border-primary/40 transition-all h-full">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">XRPL Address</h2>
                  <p className="text-sm text-muted-foreground">Primary vault identifier</p>
                </div>
                <Vault size={32} className="text-primary" weight="duotone" />
              </div>
              
              <div className="space-y-3">
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="font-mono text-sm text-foreground break-all">
                    rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy('rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL')}
                  className="w-full border-primary/40 text-primary hover:bg-primary/10"
                >
                  <CopySimple size={16} className="mr-2" />
                  Copy Address
                </Button>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-mono">Network</span>
                  <Badge className="bg-accent/20 text-accent border-accent/40">XRPL Mainnet</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-mono">Created</span>
                  <span className="text-sm text-foreground font-mono">2024-12-15</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-8 space-y-6 bg-card border-primary/20 hover:border-primary/40 transition-all h-full">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Vault Status</h2>
                  <p className="text-sm text-muted-foreground">Compliance & verification</p>
                </div>
                <ShieldCheck size={32} className="text-primary" weight="duotone" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <span className="text-sm text-foreground">KYC Verification</span>
                  <Badge className="bg-primary/20 text-primary border-primary/40">Verified</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <span className="text-sm text-foreground">ISO-20022 Compliant</span>
                  <Badge className="bg-primary/20 text-primary border-primary/40">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <span className="text-sm text-foreground">Basel III Enforcement</span>
                  <Badge className="bg-primary/20 text-primary border-primary/40">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <span className="text-sm text-foreground">FATF Compliance</span>
                  <Badge className="bg-primary/20 text-primary border-primary/40">Certified</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="p-8 space-y-6 bg-card border-primary/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Tokenized Assets</h2>
                <p className="text-sm text-muted-foreground">Real-world asset registry</p>
              </div>
              <span className="text-3xl">💎</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-background rounded-lg border border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Total Assets</p>
                <p className="text-3xl font-mono font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Ready to tokenize</p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Collateral Value</p>
                <p className="text-3xl font-mono font-bold text-primary">$0</p>
                <p className="text-xs text-muted-foreground">USD equivalent</p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Proof Attestations</p>
                <p className="text-3xl font-mono font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Chainlink verified</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full border-primary/40 text-primary hover:bg-primary/10"
              >
                <FileText size={18} className="mr-2" />
                Export Proof to Regulator / Auditor
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="p-8 bg-card border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Collateral Proofs</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/40 transition-colors cursor-pointer">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">IPFS Proof Hash</p>
                  <p className="text-xs font-mono text-muted-foreground">QmX4fY8...h7Jk2N</p>
                </div>
                <Badge variant="outline" className="border-accent text-accent">View on IPFS</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/40 transition-colors cursor-pointer">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Chainlink Attestation</p>
                  <p className="text-xs font-mono text-muted-foreground">0x7a9f...3d2e</p>
                </div>
                <Badge variant="outline" className="border-accent text-accent">Verify</Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
