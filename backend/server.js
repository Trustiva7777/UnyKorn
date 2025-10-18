import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { randomUUID } from 'crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import rateLimit from 'express-rate-limit'
import client from 'prom-client'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

const XUMM_API_KEY = process.env.XUMM_API_KEY || process.env.XUMM_KEY || process.env.API_KEY
const XUMM_API_SECRET = process.env.XUMM_API_SECRET || process.env.XUMM_SECRET || process.env.API_SECRET

const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000']

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

const payloadStore = new Map()

// Xumm OAuth2/JWT verification
const XUMM_ISSUER = 'https://oauth2.xumm.app'
const jwks = createRemoteJWKSet(new URL(`${XUMM_ISSUER}/certs`))

async function verifyXummJwt(authHeader) {
  if (!authHeader) throw new Error('Missing Authorization')
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const verifyOpts = { issuer: XUMM_ISSUER, clockTolerance: '60s' }
  const aud = process.env.XUMM_CLIENT_ID
  if (aud) Object.assign(verifyOpts, { audience: aud })
  const { payload } = await jwtVerify(token, jwks, verifyOpts)
  return payload
}

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

// Protected user endpoint using Xumm JWT
const meLimiter = rateLimit({ windowMs: 60_000, max: 60 })
app.get('/me', meLimiter, async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    if (auth.length > 4096) return res.sendStatus(400)
    const claims = await verifyXummJwt(req.headers.authorization)
    res.json({ ok: true, claims })
  } catch (e) {
    res.status(401).json({ ok: false, error: e?.message || 'Unauthorized' })
  }
})

// Prometheus metrics
client.collectDefaultMetrics()
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})

// Lightweight health bundle for Spark status dashboard
app.get('/status.json', async (req, res) => {
  const startedAt = Date.now()

  // Helper: fetch with timeout
  async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(id)
      return resp
    } catch (err) {
      clearTimeout(id)
      throw err
    }
  }

  // API basics
  const api = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }

  // Xumm
  let xumm = {
    configured: !!(XUMM_API_KEY && XUMM_API_SECRET),
    status: 'simulated'
  }
  if (xumm.configured) {
    try {
      const xummModule = await import('xumm-sdk')
      const { XummSdk } = xummModule.default || xummModule
      const x = new XummSdk(XUMM_API_KEY, XUMM_API_SECRET)
      const ping = await x.ping()
      xumm = {
        configured: true,
        status: 'ok',
        app: ping.application.name
      }
    } catch (e) {
      xumm = {
        configured: true,
        status: 'error',
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }
  }

  // XRPL (public cluster)
  let xrpl = { status: 'error' }
  try {
    const resp = await fetchWithTimeout('https://xrplcluster.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'server_info', params: [{}] })
    }, 3500)
    if (resp.ok) {
      const data = await resp.json()
      const info = data?.result?.info
      xrpl = {
        status: 'ok',
        server: info?.build_version,
        complete_ledgers: info?.complete_ledgers,
        validated_ledger: info?.validated_ledger?.seq
      }
    } else {
      xrpl = { status: 'error', error: `HTTP ${resp.status}` }
    }
  } catch (e) {
    xrpl = { status: 'error', error: e instanceof Error ? e.message : 'Network error' }
  }

  res.json({
    api,
    xumm,
    xrpl,
    elapsed_ms: Date.now() - startedAt
  })
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
