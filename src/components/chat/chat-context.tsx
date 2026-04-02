'use client'

import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react'

interface ChatContextType {
  openChats: string[] // List of receiverId strings
  openChat: (userId: string) => void
  closeChat: (userId: string) => void
  isMinimized: boolean
  setIsMinimized: Dispatch<SetStateAction<boolean>>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [openChats, setOpenChats] = useState<string[]>([])
  const [isMinimized, setIsMinimized] = useState(false)

  const openChat = (userId: string) => {
    setOpenChats((prev) => {
      if (prev.includes(userId)) return prev
      // Limit to 3 open chats at once for UI sanity
      const next = [userId, ...prev].slice(0, 3)
      return next
    })
    setIsMinimized(false)
  }

  const closeChat = (userId: string) => {
    setOpenChats((prev) => prev.filter((id) => id !== userId))
  }

  return (
    <ChatContext.Provider value={{ openChats, openChat, closeChat, isMinimized, setIsMinimized }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
