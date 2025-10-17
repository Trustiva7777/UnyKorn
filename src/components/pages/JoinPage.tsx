import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { QrCode, Wallet, ShieldCheck, Vault, ArrowRight } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export function JoinPage() {
  const [qrData, setQrData] = useState<{ uuid: string; qr: string; deeplink: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [, setWalletAddress] = useKV<string | null>('wallet-address', null)
  const [, setWalletData] = useKV<{ created?: string; network?: string } | null>('wallet-data', null)
  const [connected, setConnected] = useState(false)
  const [progress, setProgress] = useState(0)

  const startOnboarding = async () => {
    setIsLoading(true)
    const response = await api.onboard.start()
    
    if (response.data) {
      setQrData(response.data)
      setIsPolling(true)
      toast.success('QR code generated - scan with Xumm')
    } else {
      toast.error(response.error || 'Backend offline - using simulation mode')
      handleSimulatedConnect()
    }
    
    setIsLoading(false)
  }

  const handleSimulatedConnect = () => {
    setConnected(true)
    let current = 0
    const interval = setInterval(() => {
      current += 33.33
      setProgress(current)
      if (current >= 100) {
        clearInterval(interval)
        setWalletAddress('rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL')
        setWalletData({
          created: new Date().toISOString().split('T')[0],
          network: 'XRPL Mainnet (Simulated)'
        })
      }
    }, 400)
  }

  useEffect(() => {
    if (!isPolling || !qrData) return

    const pollResult = async () => {
      const response = await api.onboard.result(qrData.uuid)
      
      if (response.data?.signed && response.data.account) {
        setIsPolling(false)
        setConnected(true)
        
        let current = 0
        const interval = setInterval(() => {
          current += 33.33
          setProgress(current)
          if (current >= 100) {
            clearInterval(interval)
            setWalletAddress(response.data!.account!)
            setWalletData({
              created: new Date().toISOString().split('T')[0],
              network: 'XRPL Mainnet'
            })
            toast.success('Wallet connected successfully!')
          }
        }, 400)
      }
    }

    const interval = setInterval(pollResult, 2000)
    const timeout = setTimeout(() => {
      setIsPolling(false)
      toast.error('QR code expired - please try again')
    }, 300000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isPolling, qrData, setWalletAddress, setWalletData])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
      <div className="max-w-6xl w-full">
        {!connected ? (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Welcome to Sovereignty
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Connect your XRPL wallet to access the Unykorn ecosystem. Your vault awaits.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-sm text-foreground/80">Decentralized identity verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-sm text-foreground/80">Sovereign vault creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-sm text-foreground/80">Compliance-ready onboarding</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 space-y-6 bg-card border-primary/20 hover:border-primary/40 transition-colors">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <QrCode size={48} className="text-primary" weight="duotone" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">XUMM Wallet Connection</h3>
                  <p className="text-sm text-muted-foreground">Scan QR code or sign with XUMM</p>
                </div>

                <div className="aspect-square bg-background border border-border rounded-lg flex items-center justify-center relative">
                  {qrData ? (
                    <img src={qrData.qr} alt="Xumm QR Code" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="w-48 h-48 bg-primary/10 border-4 border-primary/30 rounded-lg flex items-center justify-center">
                      <QrCode size={64} className="text-primary/40" weight="duotone" />
                    </div>
                  )}
                  {isPolling && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
                        <p className="text-sm text-muted-foreground">Waiting for signature...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={startOnboarding}
                    disabled={isLoading || isPolling || !!qrData}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider font-semibold"
                    size="lg"
                  >
                    {isLoading ? 'Generating...' : qrData ? 'Scan with Xumm' : 'Connect with Xumm'}
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                  
                  {!qrData && (
                    <Button
                      onClick={handleSimulatedConnect}
                      variant="outline"
                      className="w-full border-primary/40 text-primary hover:bg-primary/10"
                      size="sm"
                    >
                      Or Simulate (Demo Mode)
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-primary">Onboarding Progress</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">COMPLETION</span>
                  <span className="text-foreground font-mono">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-primary text-primary">
                  <Wallet size={14} className="mr-1" weight="fill" />
                  Wallet Connected
                </Badge>
                <Badge variant="outline" className={progress >= 66 ? "border-accent text-accent" : "border-muted text-muted-foreground"}>
                  <ShieldCheck size={14} className="mr-1" weight="fill" />
                  KYC Verified
                </Badge>
                <Badge variant="outline" className={progress >= 100 ? "border-accent text-accent" : "border-muted text-muted-foreground"}>
                  <Vault size={14} className="mr-1" weight="fill" />
                  Vault Created
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Vault Account</h3>
                  <Vault size={24} className="text-primary" weight="duotone" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Address</p>
                  <p className="text-sm font-mono text-foreground break-all">rN7n7otQDd6FczFgLdl...</p>
                  <Badge className="bg-accent/20 text-accent border-accent/40">Active</Badge>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Vault Status</h3>
                  <ShieldCheck size={24} className="text-primary" weight="duotone" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Compliance</p>
                  <p className="text-sm text-foreground">ISO-20022 Compliant</p>
                  <Badge className="bg-primary/20 text-primary border-primary/40">Verified</Badge>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Tokenized Assets</h3>
                  <span className="text-2xl">💎</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Portfolio</p>
                  <p className="text-2xl font-mono text-primary font-bold">0</p>
                  <Badge variant="outline" className="border-muted text-muted-foreground">Ready</Badge>
                </div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider font-semibold"
              >
                Create Vault
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10 uppercase tracking-wider font-semibold"
              >
                Tokenize Asset
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10 uppercase tracking-wider font-semibold"
              >
                Institutional Access
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
