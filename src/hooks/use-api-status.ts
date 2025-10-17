import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function useApiStatus() {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [xummStatus, setXummStatus] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true)
      
      const healthCheck = await api.health()
      setIsOnline(healthCheck.status === 200)

      if (healthCheck.status === 200) {
        const xummCheck = await api.xumm.ping()
        if (xummCheck.data) {
          setXummStatus(xummCheck.data.status)
        }
      }
      
      setIsLoading(false)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isOnline, isLoading, xummStatus }
}
