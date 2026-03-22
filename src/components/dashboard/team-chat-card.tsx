'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { useChat } from '@/components/chat/chat-context'
import { cn } from '@/lib/utils'

interface TeamChatCardProps {
  staff: any[]
  currentUserId: string
}

export function TeamChatCard({ staff, currentUserId }: TeamChatCardProps) {
  const { openChat } = useChat()

  return (
    <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col hide-scrollbar h-[350px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h3 className="text-[18px] font-bold text-zinc-900 tracking-tight">Team Chat</h3>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Direct Messages</p>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-500">
          <PlusCircle className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
        {staff?.filter(s => s.id !== currentUserId).map(member => (
          <div 
            key={member.id} 
            onClick={() => openChat(member.id)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 transition-colors group cursor-pointer border border-transparent hover:border-zinc-100"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.full_name}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-zinc-900 tracking-tight">{member.full_name?.split(' ')[0]}</span>
                <span className="text-[11px] font-semibold text-zinc-500 leading-none">
                  {{'Admin': 'Administrator', 'Manager': 'Manager', 'SEO': 'SEO Specialist', 'Developer': 'Developer', 'Sales': 'Sales', 'HR': 'HR'}[member.role as string] || member.role}
                </span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 hover:bg-blue-100 p-0 shrink-0 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
