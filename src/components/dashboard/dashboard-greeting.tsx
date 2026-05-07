'use client'

import { useEffect, useState } from 'react'
import { getAIGreeting } from '@/app/dashboard/actions'

interface DashboardGreetingProps {
  initialGreeting: string
  userName: string
}

export function DashboardGreeting({ initialGreeting, userName }: DashboardGreetingProps) {
  const [greeting, setGreeting] = useState(initialGreeting)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadGreeting() {
      const aiGreeting = await getAIGreeting(userName)
      if (aiGreeting) {
        setGreeting(aiGreeting)
        setIsLoaded(true)
      }
    }
    loadGreeting()
  }, [userName])

  return (
    <h1 className={`text-2xl md:text-[32px] font-semibold tracking-tighter text-zinc-900 uppercase transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-90'}`}>
      {greeting} {greeting.includes(userName) ? '' : userName}
    </h1>
  )
}
