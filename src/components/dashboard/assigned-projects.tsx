'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Clock, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AssignedProjectsProps {
  projects: any[]
  currentUserId: string
}

export function AssignedProjects({ projects, currentUserId }: AssignedProjectsProps) {
  const assigned = (projects || []).filter(p => 
    p.current_assignee_id === currentUserId && 
    p.status !== 'Completed' && 
    p.status !== 'Archived'
  )

  if (assigned.length === 0) {
    return (
      <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 ml-1">
          <Briefcase className="w-3.5 h-3.5" /> Your Active Responsibilities
        </h2>
        <Card className="rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-zinc-50 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
             <User className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-black text-zinc-900 mb-2">You're all caught up!</h3>
          <p className="text-sm font-bold text-zinc-400 max-w-sm mx-auto leading-relaxed">
            There are no projects assigned to you right now. Use this time to explore the pipeline or check in with your team.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 ml-1">
          <Briefcase className="w-3.5 h-3.5" /> Your Active Responsibilities
        </h2>
        <Badge variant="outline" className="rounded-full border-zinc-200 text-zinc-500 font-bold px-3 py-0.5 bg-zinc-50">
          {assigned.length} {assigned.length === 1 ? 'Task' : 'Tasks'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assigned.map((p) => (
          <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
            <Card className="rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all cursor-pointer group h-full overflow-hidden border border-zinc-50 relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-100 group-hover:bg-zinc-900 transition-colors duration-500" />
              
              <CardContent className="p-6 pl-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {p.status?.split('_')?.pop() || 'ACTIVE'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-zinc-900 leading-tight mb-2 group-hover:text-zinc-600 transition-colors">
                  {p.client_name}
                </h3>
                
                <div className="flex flex-col gap-2 mt-6">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-zinc-50 rounded-full overflow-hidden">
                       <div className="h-full bg-zinc-900 w-1/3 rounded-full" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-tighter">In Progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
