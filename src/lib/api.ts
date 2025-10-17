const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      return {
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

export const api = {
  health: () => fetchApi<{ status: string }>('/health'),
  
  xumm: {
    ping: () => fetchApi<{ app: string; network: string; status: string }>('/xumm/ping'),
  },

  onboard: {
    start: () => fetchApi<{ uuid: string; qr: string; deeplink: string }>('/onboard/start', {
      method: 'POST',
    }),
    result: (uuid: string) => fetchApi<{ signed: boolean; account?: string }>(`/onboard/result/${uuid}`),
  },
}

export { API_BASE }
