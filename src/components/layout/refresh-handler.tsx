'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshHandler() {
  const router = useRouter()

  useEffect(() => {
    // Refresh the dashboard data every 60 seconds
    const interval = setInterval(() => {
      console.log('Refreshing dashboard data...')
      router.refresh()
    }, 65000)

    return () => clearInterval(interval)
  }, [router])

  return null
}
