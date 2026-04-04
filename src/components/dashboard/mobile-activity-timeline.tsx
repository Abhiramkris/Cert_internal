'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, ArrowRight, Zap, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  project_id?: string;
  is_read?: boolean;
}

interface MobileActivityTimelineProps {
  userId: string;
}

import { useNotifications } from '@/context/NotificationContext'

export function MobileActivityTimeline({ userId }: MobileActivityTimelineProps) {
  const { notifications, loading } = useNotifications()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div id="mobile-activity-timeline" className="space-y-6 md:hidden scroll-mt-20">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Activity & Notifications
        </h3>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-0.5">Live</span>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[1.25rem] before:-translate-x-px before:h-full before:w-[1px] before:bg-zinc-200">
        {notifications.length > 0 ? (
          notifications.map((item, index) => {
            const date = new Date(item.created_at)
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            
            return (
              <div key={item.id} className="relative flex items-start gap-6 group">
                {/* Timeline Dot */}
                <div className="relative z-10 w-2.5 h-2.5 bg-zinc-950 border border-white shrink-0 mt-1.5 ml-[1.125rem]" />
                
                {/* Content Card */}
                <div className="flex-1 bg-white border border-zinc-200 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.type.replace('_', ' ')}</span>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeStr}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-zinc-900 leading-relaxed mb-3">
                    {item.message}
                  </p>
                  {item.project_id && (
                    <Link 
                      href={`/dashboard/projects/${item.project_id}`}
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-950 hover:bg-zinc-100 p-1 px-2 border border-zinc-200 transition-colors"
                    >
                      View Report <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50 border border-dashed border-zinc-200">
            <Bell className="w-8 h-8 text-zinc-200 mb-3" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Clear: No Intel Found</p>
          </div>
        )}
      </div>
    </div>
  )
}
