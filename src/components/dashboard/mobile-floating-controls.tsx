'use client'

import React from 'react'
import { MessageSquare, Activity, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileFloatingControls() {
  const scrollToTimeline = () => {
    const element = document.getElementById('mobile-activity-timeline')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // This can be used to trigger the chat once we have a global chat state
  const openChat = () => {
    // For now, this could emit an event or update a context that FloatingChat listens to
    window.dispatchEvent(new CustomEvent('toggle-floating-chat'))
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden z-[100]">
      <Button 
        onClick={openChat}
        className="w-14 h-14 rounded-full bg-zinc-950 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white/10"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
      
      <Button 
        onClick={scrollToTimeline}
        className="w-14 h-14 rounded-full bg-white text-zinc-950 shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-zinc-200"
      >
        <Activity className="w-6 h-6" />
      </Button>
    </div>
  )
}
