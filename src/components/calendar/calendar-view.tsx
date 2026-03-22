'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CalendarViewProps {
  projects: any[]
}

export function CalendarView({ projects }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const activeProjects = projects.filter(p => p.deadline && p.status !== 'Completed' && p.status !== 'Archived')

  return (
    <Card className="rounded-[2.5rem] border-none bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToday} className="rounded-xl border-zinc-200 text-[12px] font-bold h-9">
            Today
          </Button>
          <div className="flex bg-zinc-50 rounded-xl border border-zinc-200 p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 rounded-lg hover:bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-lg hover:bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-zinc-50 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            {day}
          </div>
        ))}
        
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="bg-white min-h-[120px] p-2" />
          }

          const isToday = new Date().toDateString() === date.toDateString()
          const dayProjects = activeProjects.filter(p => new Date(p.deadline).toDateString() === date.toDateString())

          return (
            <div key={idx} className={cn("bg-white min-h-[120px] p-2 flex flex-col transition-colors group relative", isToday ? "bg-blue-50/30" : "")}>
              <div className="flex justify-between items-start mb-2 px-1 pt-1">
                <span className={cn(
                  "text-[13px] font-bold w-7 h-7 flex items-center justify-center text-center rounded-full leading-none", 
                  isToday ? "bg-blue-600 text-white shadow-md" : "text-zinc-700"
                )}>
                  {date.getDate()}
                </span>
                {dayProjects.length > 0 && (
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                    {dayProjects.length}
                  </span>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5">
                {dayProjects.map(p => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                    <div className="group/item flex flex-col p-2 bg-zinc-50 hover:bg-[#10B981] text-zinc-700 hover:text-white rounded-xl transition-all border border-zinc-100 hover:border-[#10B981] hover:shadow-md cursor-pointer">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3 h-3 opacity-50" />
                        <span className="text-[11px] font-bold line-clamp-1 leading-tight">{p.client_name}</span>
                      </div>
                      {p.current_assignee_id && (
                        <div className="text-[9px] font-bold opacity-60 flex items-center gap-1 uppercase tracking-wider">
                          Assigned
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
