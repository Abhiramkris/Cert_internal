'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  LayoutList, 
  Table as TableIcon, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  Search,
  Filter, 
  MoreHorizontal,
  Zap,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PipelineDMButton } from './pipeline-dm-button'

interface Project {
  id: string
  client_name: string
  status: string
  created_at: string
  current_assignee_id: string | null
  deadline?: string
}

interface ProjectPipelineTrackerProps {
  initialProjects: Project[]
  staff: any[]
  currentUserId?: string
}

const PHASES = [
  { label: 'Discovery', status: 'NEW_LEAD', color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'SEO Strategy', status: 'TEAM_ASSIGNED', color: 'bg-purple-500', text: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Development', status: 'SEO_COMPLETED', color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Review', status: 'DEV_PREVIEW_READY', color: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Delivery', status: 'MANAGER_APPROVED', color: 'bg-indigo-500', text: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'Completed', status: 'CLIENT_APPROVED', color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50' }
]

export function ProjectPipelineTracker({ initialProjects, staff, currentUserId }: ProjectPipelineTrackerProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(p => {
      const matchesPhase = selectedPhase ? p.status === selectedPhase : true
      const matchesSearch = p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesPhase && matchesSearch
    })
  }, [initialProjects, selectedPhase, searchQuery])

  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    PHASES.forEach(p => {
      counts[p.status] = initialProjects.filter(proj => proj.status === p.status).length
    })
    return counts
  }, [initialProjects])

  return (
    <div className="space-y-8">
      {/* Phase Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PHASES.map((phase) => (
          <Card 
            key={phase.status} 
            onClick={() => setSelectedPhase(selectedPhase === phase.status ? null : phase.status)}
            className={cn(
              "border-none p-5 shadow-sm rounded-3xl flex flex-col gap-1 cursor-pointer transition-all duration-300 group hover:shadow-md",
              selectedPhase === phase.status 
                ? "bg-zinc-900 text-white scale-[1.02] shadow-xl ring-2 ring-zinc-900/10" 
                : "bg-white text-zinc-900"
            )}
          >
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest transition-colors",
              selectedPhase === phase.status ? "text-zinc-400" : "text-zinc-400"
            )}>
              {phase.label}
            </span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black">{stats[phase.status] || 0}</span>
              <div className={cn(
                "w-2 h-2 rounded-full mb-2 transition-transform group-hover:scale-125",
                selectedPhase === phase.status ? "bg-[#10B981]" : phase.color
              )} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area (9 Columns) */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
             <div>
                <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  {selectedPhase ? PHASES.find(p => p.status === selectedPhase)?.label : 'All Projects'}
                </h2>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                  {selectedPhase ? `${filteredProjects.length} Active in This Stage` : 'Global Pipeline'}
                </h1>
             </div>

             <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none w-64 shadow-sm"
                  />
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 shadow-inner">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setViewMode('list')}
                    className={cn("w-10 h-10 rounded-xl transition-all", viewMode === 'list' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    <LayoutList className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setViewMode('table')}
                    className={cn("w-10 h-10 rounded-xl transition-all", viewMode === 'table' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}
                  >
                    <TableIcon className="w-5 h-5" />
                  </Button>
                </div>
             </div>
          </div>

          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const phase = PHASES.find(p => p.status === project.status) || { label: project.status, color: 'bg-zinc-500', text: 'text-zinc-500', bg: 'bg-zinc-50' }
                const isAssignedToMe = project.current_assignee_id === currentUserId
                return (
                  <Card key={project.id} className={cn(
                    "rounded-[2rem] border-none bg-white p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full",
                    isAssignedToMe && "ring-2 ring-zinc-900 ring-offset-4",
                    project.status === 'CLIENT_APPROVED' && "bg-emerald-50/30 border border-emerald-100"
                  )}>
                    {project.status === 'CLIENT_APPROVED' && (
                      <div className="absolute top-0 right-0 lg:right-4 lg:top-4 z-20">
                        <Badge className="bg-emerald-600 text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </Badge>
                      </div>
                    )}
                    {isAssignedToMe && project.status !== 'CLIENT_APPROVED' && (
                      <div className="absolute top-0 right-0 lg:right-4 lg:top-4 z-20">
                        <Badge className="bg-zinc-900 text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                          <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          Take Action
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-zinc-400" />
                      </div>
                      <Badge className={cn("border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", phase.bg, phase.text)}>
                        {phase.label}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-black text-zinc-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-tight line-clamp-1">{project.client_name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                      <div className={cn("w-2 h-2 rounded-full", project.status === 'CLIENT_APPROVED' ? "bg-emerald-500" : "bg-emerald-500 animate-pulse")} />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{project.status === 'CLIENT_APPROVED' ? 'Project Completed' : 'Active Tracker'}</span>
                    </div>

                    <div className="mt-auto space-y-4 pt-6 border-t border-zinc-50">
                      <div className="flex justify-between items-center text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                        <span>Lead Assignee</span>
                        <span>{staff?.find(s => s.id === project.current_assignee_id)?.full_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex -space-x-3 overflow-hidden">
                           {[1, 2, 3].map((_, i) => (
                             <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-zinc-100 border border-zinc-200 overflow-hidden">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.id + i}`} className="w-full h-full object-cover" />
                             </div>
                           ))}
                         </div>
                         <div className="flex gap-2">
                           {project.current_assignee_id && <PipelineDMButton userId={project.current_assignee_id} />}
                           <Link 
                             href={`/dashboard/projects/${project.id}`} 
                             className={cn(
                               "h-8 px-4 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-[11px]",
                               isAssignedToMe 
                                 ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md shadow-zinc-200" 
                                 : "bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                             )}
                           >
                              {isAssignedToMe ? (
                                <>
                                  <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                  <span>Open Phase</span>
                                </>
                              ) : (
                                <ArrowRight className="w-4 h-4" />
                              )}
                           </Link>
                         </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden border border-zinc-100">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th className="px-8 py-5 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Project Name</th>
                      <th className="px-8 py-5 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status Phase</th>
                      <th className="px-8 py-5 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Assignee</th>
                      <th className="px-8 py-5 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Deadline</th>
                      <th className="px-8 py-5 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filteredProjects.map((project) => {
                      const phase = PHASES.find(p => p.status === project.status) || { label: project.status, color: 'bg-zinc-500', text: 'text-zinc-500', bg: 'bg-zinc-50' }
                      const assignee = staff?.find(s => s.id === project.current_assignee_id)
                      return (
                        <tr key={project.id} className="group hover:bg-zinc-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <Briefcase className="w-5 h-5 text-zinc-400 group-hover:text-blue-500" />
                              </div>
                              <span className="text-sm font-bold text-zinc-900 tracking-tight">{project.client_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <Badge className={cn("border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest", phase.bg, phase.text)}>
                              {phase.label}
                            </Badge>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee?.full_name}`} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs font-bold text-zinc-500">{assignee?.full_name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-zinc-400">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Date'}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                {project.current_assignee_id && <PipelineDMButton userId={project.current_assignee_id} />}
                                <Link href={`/dashboard/projects/${project.id}`} className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                                  <ArrowRight className="w-4 h-4" />
                                </Link>
                             </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {filteredProjects.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-zinc-200" />
              </div>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No projects found in this phase</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
