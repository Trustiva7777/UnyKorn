import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function useApiStatus() {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [xummStatus, setXummStatus] = useState<string | null>(null)
  const [xrplStatus, setXrplStatus] = useState<string | null>(null)
  const [xrplDetail, setXrplDetail] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true)
      const status = await api.status.get()
      setIsOnline(status.status === 200 && status.data?.api?.status === 'ok')
      if (status.data) {
        setXummStatus(status.data.xumm.status)
        setXrplStatus(status.data.xrpl.status)
        const ledger = status.data.xrpl.validated_ledger
        const server = status.data.xrpl.server
        setXrplDetail(
          status.data.xrpl.status === 'ok'
            ? [server ? `server ${server}` : null, ledger ? `ledger #${ledger}` : null].filter(Boolean).join(' • ') || null
            : status.data.xrpl.error || 'unreachable'
        )
      }
      setIsLoading(false)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isOnline, isLoading, xummStatus, xrplStatus, xrplDetail }
}
