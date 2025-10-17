export const config = {
  apiBase: import.meta.env.VITE_API_BASE || 'https://api.unykorn.org',
  brand: import.meta.env.VITE_BRAND || 'Unykorn',
  networkLabel: import.meta.env.VITE_NETWORK_LABEL || 'XRPL Mainnet',
  enableSimulation: import.meta.env.VITE_ENABLE_SIMULATION === 'true',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const

export type Config = typeof config
