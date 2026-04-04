'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Bell, MessageSquare } from 'lucide-react'

interface NotificationsHandlerProps {
  userId: string
}

export function NotificationsHandler({ userId }: NotificationsHandlerProps) {
  const supabase = createClient()

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Subtle ping
      audio.volume = 0.5
      audio.play().catch(e => console.log('Audio play blocked:', e))
    } catch (err) {
      console.warn('Notification sound failed:', err)
    }
  }

  useEffect(() => {
    if (!userId) return

    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    const showBrowserNotification = (title: string, options: NotificationOptions) => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/file.svg', // Fallback icon from public
          ...options
        })
      }
    }

    // 1. Listen for general notifications
    const notificationChannel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const notification = payload.new
          playNotificationSound()
          
          showBrowserNotification('Mission Intelligence Alert', {
            body: notification.message,
            tag: notification.id
          })

          toast(notification.message, {
            description: new Date().toLocaleTimeString(),
            action: {
              label: 'View',
              onClick: () => {
                if (notification.project_id) {
                  window.location.href = `/dashboard/projects/${notification.project_id}`
                }
              }
            },
            icon: <Bell className="w-4 h-4 text-blue-500" />
          })
        }
      )
      .subscribe()

    // 2. Listen for direct messages
    const messageChannel = supabase
      .channel(`user-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`
        },
        async (payload: any) => {
          const message = payload.new
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single()

          playNotificationSound()
          
          showBrowserNotification(`Message from ${sender?.full_name || 'Team Member'}`, {
            body: message.content.substring(0, 50),
            tag: message.id
          })

          toast.message(`New message from ${sender?.full_name || 'Someone'}`, {
            description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
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
      .subscribe()

    return () => {
      supabase.removeChannel(notificationChannel)
      supabase.removeChannel(messageChannel)
    }
  }, [userId, supabase])

  return null
}
