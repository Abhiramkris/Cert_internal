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
    <div className="fixed bottom-6 left-6 right-6 flex items-center justify-between gap-4 md:hidden z-[100]">
      <div className="flex-1 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-2xl border border-zinc-200 rounded-[2rem] shadow-2xl shadow-black/10">
        <button 
          onClick={openChat}
          className="flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl bg-zinc-950 text-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
        </button>
        
        <button 
          onClick={scrollToTimeline}
          className="flex-1 flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-zinc-950 border border-zinc-100 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Pulse</span>
        </button>
      </div>
    </div>
  )
}
