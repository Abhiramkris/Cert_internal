'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'

interface WeeklyTimelineProps {
  projects: any[]
  userRole?: string
  currentUserId?: string
}

export function WeeklyTimeline({ projects, userRole, currentUserId }: WeeklyTimelineProps) {
  // 1. Calculate current week (Monday to Sunday)
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 (Sun) to 6 (Sat)
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust to Monday
  const startOfWeek = new Date(today.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  // 2. Filter projects that are active this week or have deadlines this week
  const activeProjects = (projects || [])
    .filter(p => {
      if (!p.deadline) return false
      const deadline = new Date(p.deadline)
      const created = new Date(p.created_at)
      const endOfWeek = new Date(days[6])
      endOfWeek.setHours(23, 59, 59, 999)

      // Project overlaps with current week if:
      // Project start is before end of week AND Project end is after start of week
      return created <= endOfWeek && deadline >= startOfWeek
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5) // Limit to top 5 for the small card

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase()
    if (s.includes('SEO')) return 'bg-emerald-500'
    if (s.includes('DEV') || s.includes('BUILD')) return 'bg-blue-500'
    if (s.includes('QA') || s.includes('TEST')) return 'bg-amber-500'
    if (s.includes('LEAD') || s.includes('DISCOVERY')) return 'bg-zinc-400'
    if (s.includes('COMPLETED')) return 'bg-indigo-500'
    return 'bg-zinc-900'
  }

  // 3. Helper to calculate bar position and width
  const getBarStyles = (p: any) => {
    const created = new Date(p.created_at)
    
    // Choose deadline: role-specific if available, else overall deadline
    let targetDate = p.deadline
    if (userRole === 'SEO' && p.seo_deadline) targetDate = p.seo_deadline
    if (userRole === 'Developer' && p.dev_deadline) targetDate = p.dev_deadline
    if (userRole === 'QA' && p.qa_deadline) targetDate = p.qa_deadline
    if (userRole === 'Sales' && p.discovery_deadline) targetDate = p.discovery_deadline
    
    const deadline = new Date(targetDate)
    const weekStart = startOfWeek.getTime()
    const weekEnd = days[6].getTime() + 86400000 // End of Sunday

    // Clip to current week
    const start = Math.max(created.getTime(), weekStart)
    const end = Math.min(deadline.getTime(), weekEnd)
    
    if (start >= end) return { display: 'none' }

    const leftPercent = ((start - weekStart) / (weekEnd - weekStart)) * 100
    const widthPercent = ((end - start) / (weekEnd - weekStart)) * 100

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header: Days labels */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((d, i) => {
          const isToday = d.toDateString() === new Date().toDateString()
          return (
            <div key={i} className="text-center group">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter block mb-1",
                isToday ? "text-blue-600" : "text-zinc-400"
              )}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
              <div className={cn(
                "text-[12px] font-black h-6 w-6 rounded-full flex items-center justify-center mx-auto transition-all",
                isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-zinc-900"
              )}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Timeline Rows */}
      <div className="flex-1 space-y-3 relative overflow-hidden">
        {/* Vertical Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-7 gap-1 pointer-events-none opacity-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-l border-zinc-200 h-full first:border-l-0" />
          ))}
        </div>

        {/* Project Bars */}
        {activeProjects.length > 0 ? (
          activeProjects.map((p) => (
            <div key={p.id} className="relative group/row">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] font-bold text-zinc-900 truncate max-w-[80px]" title={p.client_name}>
                  {p.client_name}
                </span>
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none">
                  {p.status.split('_').pop()}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-50 rounded-full relative overflow-hidden border border-zinc-100/50">
                <div 
                  className={cn(
                    "absolute top-0 bottom-0 rounded-full transition-all duration-500 group-hover/row:opacity-80",
                    getStatusColor(p.status)
                  )}
                  style={getBarStyles(p)}
                />
              </div>

              {/* Take Action Button for Assigned Projects */}
              {currentUserId === p.current_assignee_id && (
                <Link 
                  href={`/dashboard/projects/${p.id}`}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all duration-300 z-20"
                >
                  <Button size="icon" className="w-6 h-6 rounded-full bg-zinc-900 text-white shadow-lg hover:scale-110">
                    <Zap className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <Calendar className="w-8 h-8 text-zinc-200 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No deadlines this week</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Week View</span>
        <div className="flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </div>
      </div>
    </div>
  )
}
