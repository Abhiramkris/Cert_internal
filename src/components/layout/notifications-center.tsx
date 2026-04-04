'use client'

import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Bell, Check, ExternalLink, Inbox, Loader2 } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  message: string
  type: string
  project_id: string | null
  is_read: boolean
  created_at: string
}

interface NotificationsCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function NotificationsCenter({ open, onOpenChange, userId }: NotificationsCenterProps) {
  const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications()

  useEffect(() => {
    if (open) {
      refresh()
    }
  }, [open, refresh])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] border-l border-zinc-200 p-0 shadow-2xl bg-white flex flex-col">
        <SheetHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-zinc-100 bg-zinc-50 flex items-center justify-center rounded-none shadow-sm">
              <Bell className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Activity Feed</span>
              <SheetTitle className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">Intelligence</SheetTitle>
            </div>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead}
              className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors flex items-center gap-2"
            >
              Clear All <Check className="w-3 h-3" />
            </button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-zinc-200 animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-zinc-50">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-6 transition-all hover:bg-zinc-50/50 group relative",
                    !notification.is_read && "bg-blue-50/30"
                  )}
                >
                  {!notification.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-950" />
                  )}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        {notification.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
                        {(() => {
                          try {
                            const d = new Date(notification.created_at)
                            return isNaN(d.getTime()) ? 'Recently' : `${formatDistanceToNow(d)} ago`
                          } catch {
                            return 'Recently'
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-zinc-900 leading-relaxed uppercase tracking-tight">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3">
                      {notification.project_id && (
                        <Link 
                          href={`/dashboard/projects/${notification.project_id}`}
                          onClick={() => {
                            if (!notification.is_read) markAsRead(notification.id)
                            onOpenChange(false)
                          }}
                          className="text-[10px] font-black text-zinc-950 flex items-center gap-1.5 hover:underline"
                        >
                          Access Record <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors ml-auto"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-none flex items-center justify-center mb-6">
                <Inbox className="w-8 h-8 text-zinc-200" />
              </div>
              <p className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none">All Systems Clear</p>
              <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-tight">No active intelligence reports found</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
