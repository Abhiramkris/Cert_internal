'use client'

import React from 'react'
import { MessageSquare } from 'lucide-react'
import { useChat } from '@/components/chat/chat-context'

interface PipelineDMButtonProps {
  userId: string
}

export function PipelineDMButton({ userId }: PipelineDMButtonProps) {
  const { openChat } = useChat()

  return (
    <button 
      onClick={() => openChat(userId)}
      className="w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:border-blue-200 transition-colors cursor-pointer"
    >
      <MessageSquare className="w-3.5 h-3.5" />
    </button>
  )
}
