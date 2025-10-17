import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

const XUMM_API_KEY = process.env.XUMM_API_KEY || process.env.XUMM_KEY || process.env.API_KEY
const XUMM_API_SECRET = process.env.XUMM_API_SECRET || process.env.XUMM_SECRET || process.env.API_SECRET

const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({ origin: corsOrigins }))
app.use(express.json())

const payloadStore = new Map()

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.get('/xumm/ping', async (req, res) => {
  try {
    const hasXummConfig = !!(XUMM_API_KEY && XUMM_API_SECRET)
    
    if (hasXummConfig) {
      const xummModule = await import('xumm-sdk')
      const { XummSdk } = xummModule.default || xummModule
      const xumm = new XummSdk(XUMM_API_KEY, XUMM_API_SECRET)
      const ping = await xumm.ping()
      
      res.json({
        app: ping.application.name,
        network: 'XRPL Mainnet',
        status: 'ok'
      })
    } else {
      res.json({
        app: process.env.VITE_BRAND || 'Unykorn',
        network: process.env.VITE_NETWORK_LABEL || 'XRPL Mainnet',
        status: 'ok'
      })
    }
  } catch (error) {
    console.error('Xumm ping error:', error.message)
    res.status(500).json({ 
      error: 'Xumm configuration error',
      message: error.message 
    })
  }
})

app.post('/onboard/start', async (req, res) => {
  try {
    const hasXummConfig = !!(XUMM_API_KEY && XUMM_API_SECRET)
    
    if (hasXummConfig) {
      const xummModule = await import('xumm-sdk')
      const { XummSdk } = xummModule.default || xummModule
      const xumm = new XummSdk(XUMM_API_KEY, XUMM_API_SECRET)
      
      const payload = await xumm.payload.create({
        txjson: {
          TransactionType: 'SignIn'
        }
      })
      
      payloadStore.set(payload.uuid, {
        created: Date.now(),
        signed: false,
        account: null
      })
      
      res.json({
        uuid: payload.uuid,
        qr: payload.refs.qr_png,
        deeplink: payload.next.always
      })
    } else {
      const uuid = randomUUID()
      payloadStore.set(uuid, {
        created: Date.now(),
        signed: false,
        account: null
      })
      
      res.json({
        uuid,
        qr: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=xumm://sign/${uuid}`,
        deeplink: `xumm://sign/${uuid}`
      })
    }
  } catch (error) {
    console.error('Onboard start error:', error.message)
    res.status(500).json({ 
      error: 'Failed to create payload',
      message: error.message 
    })
  }
})

app.get('/onboard/result/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params
    const hasXummConfig = !!(XUMM_API_KEY && XUMM_API_SECRET)
    
    if (hasXummConfig) {
      const xummModule = await import('xumm-sdk')
      const { XummSdk } = xummModule.default || xummModule
      const xumm = new XummSdk(XUMM_API_KEY, XUMM_API_SECRET)
      
      const payload = await xumm.payload.get(uuid)
      
      res.json({
        signed: payload.meta.signed,
        account: payload.response?.account || null
      })
    } else {
      const stored = payloadStore.get(uuid)
      
      if (!stored) {
        return res.status(404).json({ 
          error: 'Payload not found',
          signed: false 
        })
      }
      
      const ageSeconds = (Date.now() - stored.created) / 1000
      
      if (ageSeconds > 15 && !stored.signed) {
        stored.signed = true
        stored.account = generateMockAddress()
        payloadStore.set(uuid, stored)
      }
      
      res.json({
        signed: stored.signed,
        account: stored.account
      })
    }
  } catch (error) {
    console.error('Onboard result error:', error.message)
    res.status(500).json({ 
      error: 'Failed to get payload result',
      message: error.message 
    })
  }
})

app.get('/wallet/:address', (req, res) => {
  const { address } = req.params
  
  res.json({
    address,
    balance: '1000.00 XRP',
    created: new Date().toISOString().split('T')[0],
    network: process.env.VITE_NETWORK_LABEL || 'XRPL Mainnet'
  })
})

app.get('/admin/clients', (req, res) => {
  res.json([
    {
      id: '1',
      address: 'rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL',
      status: 'Active',
      created: '2024-01-15',
      kyc: true
    },
    {
      id: '2',
      address: 'rK9DrarGKnVEo2nYp5MfVRXRYf5yRX3VnX',
      status: 'Active',
      created: '2024-02-03',
      kyc: true
    },
    {
      id: '3',
      address: 'rLHzPsX6oXkzU2qL3P5VWvKuD1XpzHQ3kM',
      status: 'Pending',
      created: '2024-03-12',
      kyc: false
    }
  ])
})

app.get('/admin/vaults', (req, res) => {
  res.json([
    {
      id: '1',
      address: 'rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL',
      collateral: '$2.5M',
      assets: 12,
      verified: true
    },
    {
      id: '2',
      address: 'rK9DrarGKnVEo2nYp5MfVRXRYf5yRX3VnX',
      collateral: '$1.8M',
      assets: 8,
      verified: true
    }
  ])
})

function generateMockAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let address = 'r'
  for (let i = 0; i < 33; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return address
}

setInterval(() => {
  const now = Date.now()
  for (const [uuid, data] of payloadStore.entries()) {
    if (now - data.created > 300000) {
      payloadStore.delete(uuid)
    }
  }
}, 60000)

app.listen(PORT, () => {
  console.log(`🚀 Unykorn API Server running on port ${PORT}`)
  console.log(`📡 CORS enabled for: ${corsOrigins.join(', ')}`)
  console.log(`🔐 Xumm configured: ${!!(XUMM_API_KEY && XUMM_API_SECRET)}`)
  console.log(`🔑 Looking for keys: XUMM_API_KEY, XUMM_KEY, or API_KEY`)
  console.log(`🔑 Looking for secrets: XUMM_API_SECRET, XUMM_SECRET, or API_SECRET`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})
