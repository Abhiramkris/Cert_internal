'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { RefreshCw, Bell, AtSign, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

import { useNotifications } from '@/context/NotificationContext'

type TabType = 'Activity' | 'Mentions' | 'Notifications'

interface ActivityFeedProps {
  userId: string
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Activity')
  const { notifications, loading, refresh: fetchNotifications } = useNotifications()

  const activityCount = notifications.length
  const mentionsCount = notifications.filter(n => n.type.includes('MENTION')).length
  const unreadCount = notifications.filter(n => !n.is_read).length

  const tabs = [
    { id: 'Activity' as TabType, count: activityCount, color: 'text-blue-600', bg: 'bg-blue-100', icon: Activity },
    { id: 'Mentions' as TabType, count: mentionsCount, color: 'text-purple-600', bg: 'bg-purple-100', icon: AtSign },
    { id: 'Notifications' as TabType, count: unreadCount, color: 'text-orange-600', bg: 'bg-orange-100', icon: Bell },
  ]

  // Filter based on active tab
  const filteredFeed = notifications.filter(n => {
    if (activeTab === 'Mentions') return n.type.includes('MENTION')
    if (activeTab === 'Notifications') return !n.is_read // standard behavior for unread
    return true // 'Activity' essentially shows all history
  })

  return (
    <Card className="rounded-[2.5rem] border-none bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold tracking-tight text-zinc-900">Activity & notifications</h3>
        <button 
          onClick={() => fetchNotifications()}
          className="flex items-center gap-2 text-[12px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Auto updates
        </button>
      </div>

      {/* Tabs / Segmented Control */}
      <div className="flex bg-zinc-50/50 p-1 rounded-[1.25rem] border border-zinc-100 mb-8 inline-flex w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[1rem] text-[13px] font-bold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
            )}
          >
            {tab.id}
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", tab.bg, tab.color)}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Feed Area */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        <h4 className="text-[13px] font-bold text-zinc-900 mb-6 px-1">{activeTab} Feed</h4>
        
        {loading && notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm font-semibold">
            Loading...
          </div>
        ) : filteredFeed.length === 0 ? (
           <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm font-semibold">
            No items to display.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent px-2 max-h-[350px] overflow-y-auto no-scrollbar pb-10">
            {filteredFeed.map((item, index) => {
              // Time relative
              const diffMinutes = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 60000)
              const timeString = diffMinutes < 60 ? `${diffMinutes || 1} mins ago` : diffMinutes < 1440 ? `${Math.floor(diffMinutes / 60)} hours ago` : `${Math.floor(diffMinutes / 1440)} days ago`
              
              // Seed random avatar based on the type
              const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.type}`

              return (
                <div key={item.id} className="relative flex items-start gap-4 group">
                  {/* Timeline Line */}
                  {index !== filteredFeed.length - 1 && (
                    <div className="absolute top-10 left-5 w-px h-[calc(100%+1.5rem)] bg-zinc-200 hidden sm:block" />
                  )}
                  
                  {/* Avatar */}
                  <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-zinc-100 overflow-hidden shrink-0 shadow-sm mt-0.5 group-hover:border-blue-200 transition-colors">
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col min-w-0 pt-1 w-full">
                    <p className="text-[13px] text-zinc-600 leading-snug break-words">
                      <span className="font-bold text-zinc-900 mr-1">System</span>
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-semibold text-zinc-500">Project:</span>
                      <a href={`/dashboard/projects/${item.project_id}`} className="flex items-center text-[12px] font-bold text-blue-600 hover:text-blue-700 hover:underline truncate">
                        {item.type.replace('_', ' ')} Context
                      </a>
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {timeString}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
