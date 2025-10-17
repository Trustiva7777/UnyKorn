import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShieldCheck, BuildingOffice, Globe } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

export function PartnersPage() {
  const [formData, setFormData] = useState({ name: '', organization: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Request submitted. Our institutional team will contact you shortly.')
    setFormData({ name: '', organization: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            Compliant Infrastructure for the<br />Real-World Asset Economy
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Trusted by institutions, governments, and sovereign wealth funds to power the next generation of tokenized finance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="p-8 bg-card border-primary/20">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Global Partners & Institutions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-background border border-border rounded-lg flex items-center justify-center hover:border-primary/40 transition-colors"
                >
                  <BuildingOffice size={32} className="text-muted-foreground" weight="duotone" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Why Institutions Choose Unykorn
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-primary" weight="duotone" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">ISO-20022 Native</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Full compliance with global financial messaging standards, ensuring seamless integration with traditional banking infrastructure.
              </p>
              <Badge className="bg-primary/20 text-primary border-primary/40">Certified</Badge>
            </Card>

            <Card className="p-8 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-primary" weight="duotone" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Basel III Enforcement</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Automated capital adequacy and risk management frameworks meeting international banking regulations.
              </p>
              <Badge className="bg-primary/20 text-primary border-primary/40">Active</Badge>
            </Card>

            <Card className="p-8 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Globe size={24} className="text-primary" weight="duotone" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">FATF + SEC Compliant</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Built-in anti-money laundering (AML) and know-your-customer (KYC) protocols aligned with global regulatory frameworks.
              </p>
              <Badge className="bg-primary/20 text-primary border-primary/40">Verified</Badge>
            </Card>

            <Card className="p-8 space-y-4 bg-card border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Real-World Asset Collateralization</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Cryptographically verifiable proof-of-reserve for physical assets, commodities, real estate, and traditional securities.
              </p>
              <Badge className="bg-primary/20 text-primary border-primary/40">Enabled</Badge>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 bg-card border-primary/20">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Request Institutional Access</h2>
                <p className="text-muted-foreground">
                  Connect with our enterprise team to explore partnership opportunities
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="organization" className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
                      Organization
                    </label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      required
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-background border-border focus:border-primary resize-none"
                    placeholder="Tell us about your institution and partnership interests..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider font-semibold"
                >
                  Submit Request
                </Button>
              </form>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center space-y-4 py-12"
        >
          <p className="text-2xl font-semibold text-primary italic">
            "We don't follow compliance — we define it."
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
            Unykorn Global Finance
          </p>
        </motion.div>
      </div>
    </div>
  )
}
