import { config } from './config'

export const API_BASE = config.apiBase

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
  simulated?: boolean
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  simulateFn?: () => T
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      if (config.enableSimulation && simulateFn) {
        return {
          status: 200,
          data: simulateFn(),
          simulated: true,
        }
      }
      return {
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    if (config.enableSimulation && simulateFn) {
      return {
        status: 200,
        data: simulateFn(),
        simulated: true,
      }
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

function generateMockAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let address = 'r'
  for (let i = 0; i < 33; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return address
}

export const api = {
  health: () =>
    fetchApi<{ status: string }>(
      '/health',
      undefined,
      () => ({ status: 'simulated' })
    ),

  xumm: {
    ping: () =>
      fetchApi<{ app: string; network: string; status: string }>(
        '/xumm/ping',
        undefined,
        () => ({
          app: config.brand,
          network: config.networkLabel,
          status: 'simulated',
        })
      ),
  },

  onboard: {
    start: () =>
      fetchApi<{ uuid: string; qr: string; deeplink: string }>(
        '/onboard/start',
        { method: 'POST' },
        () => {
          const uuid = crypto.randomUUID()
          return {
            uuid,
            qr: `https://xumm.app/sign/${uuid}`,
            deeplink: `xumm://xumm.app/sign/${uuid}`,
          }
        }
      ),
    result: (uuid: string) =>
      fetchApi<{ signed: boolean; account?: string }>(
        `/onboard/result/${uuid}`,
        undefined,
        () => ({
          signed: Math.random() > 0.3,
          account: generateMockAddress(),
        })
      ),
  },

  wallet: {
    details: (address: string) =>
      fetchApi<{
        address: string
        balance: string
        created: string
        network: string
      }>(
        `/wallet/${address}`,
        undefined,
        () => ({
          address,
          balance: '1000.00 XRP',
          created: new Date().toISOString().split('T')[0],
          network: config.networkLabel,
        })
      ),
  },

  admin: {
    clients: () =>
      fetchApi<
        Array<{
          id: string
          address: string
          status: string
          created: string
          kyc: boolean
        }>
      >(
        '/admin/clients',
        undefined,
        () => [
          {
            id: '1',
            address: 'rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL',
            status: 'Active',
            created: '2024-01-15',
            kyc: true,
          },
          {
            id: '2',
            address: 'rK9DrarGKnVEo2nYp5MfVRXRYf5yRX3VnX',
            status: 'Active',
            created: '2024-02-03',
            kyc: true,
          },
          {
            id: '3',
            address: 'rLHzPsX6oXkzU2qL3P5VWvKuD1XpzHQ3kM',
            status: 'Pending',
            created: '2024-03-12',
            kyc: false,
          },
        ]
      ),

    vaults: () =>
      fetchApi<
        Array<{
          id: string
          address: string
          collateral: string
          assets: number
          verified: boolean
        }>
      >(
        '/admin/vaults',
        undefined,
        () => [
          {
            id: '1',
            address: 'rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL',
            collateral: '$2.5M',
            assets: 12,
            verified: true,
          },
          {
            id: '2',
            address: 'rK9DrarGKnVEo2nYp5MfVRXRYf5yRX3VnX',
            collateral: '$1.8M',
            assets: 8,
            verified: true,
          },
        ]
      ),
  },
}
