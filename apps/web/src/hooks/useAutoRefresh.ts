import { useEffect } from 'react'

export function useAutoRefresh(callback: () => void, interval = 20000) {
  useEffect(() => {
    // Run immediately
    callback()

    // Auto refresh
    const timer = setInterval(() => {
      callback()
    }, interval)

    return () => clearInterval(timer)
  }, [callback, interval])
}
