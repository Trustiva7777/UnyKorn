import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ValueFlowDiagram } from '../ValueFlowDiagram'

interface HomePageProps {
  onNavigate: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
            The Future of Sovereign Finance
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 font-medium">
            Compliant. Autonomous. Real-World-Backed.
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
        >
          Unykorn Global Finance is a sovereign-grade blockchain infrastructure uniting digital and real-world assets under one compliant protocol.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button
            size="lg"
            onClick={() => onNavigate('Join')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-base font-semibold uppercase tracking-wider shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30"
          >
            Enter Ecosystem
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onNavigate('Partners')}
            className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-base font-semibold uppercase tracking-wider"
          >
            For Institutions
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-24 mb-12"
      >
        <h3 className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8 font-mono">
          Under the Hood
        </h3>
        <ValueFlowDiagram />
      </motion.div>
    </div>
  )
}
