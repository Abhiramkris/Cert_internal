'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Bell, MessageSquare } from 'lucide-react'

export interface Notification {
  id: string
  user_id: string
  project_id: string | null
  type: string
  message: string
  is_read: boolean
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children, userId }: { children: React.ReactNode, userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    console.log('MISSION CONTROL: Fetching initial notifications for', userId)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('MISSION CONTROL: Fetch failed:', error)
    } else if (data) {
      console.log('MISSION CONTROL: Fetched', data.length, 'notifications')
      setNotifications(data)
      const unread = data.filter(n => !n.is_read).length
      setUnreadCount(unread)
      console.log('MISSION CONTROL: Initial unread count:', unread)
    }
    setLoading(false)
  }, [userId, supabase])

  const playSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    if (!userId) return

    console.log('MISSION CONTROL: Initializing Realtime Subscriptions...')
    fetchNotifications()

    const channel = supabase
      .channel(`central-notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('MISSION CONTROL: Realtime Event Received:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            const next = payload.new as Notification
            setNotifications(prev => [next, ...prev].slice(0, 50))
            setUnreadCount(c => c + 1)
            playSound()
            toast(next.message, { icon: <Bell className="w-4 h-4 text-blue-500" /> })
          } else if (payload.eventType === 'UPDATE') {
            const next = payload.new as Notification
            setNotifications(prev => {
              const updated = prev.map(n => n.id === next.id ? next : n)
              setUnreadCount(updated.filter(n => !n.is_read).length)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => {
              const remaining = prev.filter(n => n.id === payload.old.id)
              setUnreadCount(remaining.filter(n => !n.is_read).length)
              return remaining
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('MISSION CONTROL: Notification Channel Status:', status)
      })

    // Also listen for DMs for cross-context alerts
    const dmChannel = supabase
      .channel(`central-dms-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${userId}` },
        async (payload) => {
          console.log('MISSION CONTROL: DM Received:', payload)
          const message = payload.new as any
          playSound()
          
          // Fetch sender name for a better toast
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single()

          toast.message(`New message from ${sender?.full_name || 'Someone'}`, {
            description: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
            icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
            action: {
              label: 'Reply',
              onClick: () => {
                const event = new CustomEvent('open-chat', { detail: { userId: message.sender_id } })
                window.dispatchEvent(event)
              }
            }
          })
        }
      )
      .subscribe((status) => {
        console.log('MISSION CONTROL: DM Channel Status:', status)
      })

    return () => {
      console.log('MISSION CONTROL: Cleaning up Subscriptions')
      supabase.removeChannel(channel)
      supabase.removeChannel(dmChannel)
    }
  }, [userId, fetchNotifications, supabase])

  const markAsRead = async (id: string) => {
    console.log('MISSION CONTROL: Marking as read:', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(c => Math.max(0, c - 1))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    console.log('MISSION CONTROL: Marking all as read')
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}
