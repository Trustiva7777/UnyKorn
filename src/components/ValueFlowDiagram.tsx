import { ArrowRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

const steps = [
  { label: 'Vault', icon: '🏦' },
  { label: 'Oracle', icon: '🔮' },
  { label: 'XRPL', icon: '⚡' },
  { label: 'Compliance', icon: '🛡️' },
  { label: 'Yield', icon: '📈' },
  { label: 'Proof', icon: '✓' }
]

export function ValueFlowDiagram() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            className="flex items-center gap-2 bg-card border border-primary/20 rounded-lg px-4 py-2"
          >
            <span className="text-lg">{step.icon}</span>
            <span className="text-sm font-mono text-primary uppercase tracking-wider">
              {step.label}
            </span>
          </motion.div>
          
          {index < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 + 0.2, duration: 0.3 }}
            >
              <ArrowRight className="text-accent" size={20} weight="bold" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}
