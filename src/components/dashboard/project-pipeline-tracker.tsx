'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Filter,
  MoreHorizontal,
  Zap,
  CheckCircle2,
  Sparkles,
  Trash2,
  FileText,
  History,
  Info,
  Code2,
  Download,
  Settings,
  Smartphone,
  Check
} from 'lucide-react'
import { generateProjectZip, saveWebsiteConfig } from '@/app/dashboard/projects/builder-actions'
import { WebsiteBuilderConfigurator } from '@/components/projects/website-builder-configurator'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { finalizeProject, selfAssignProject, saveHandoffPreset, closeProject, handoffProject } from '@/app/dashboard/projects/actions'
import { toast } from 'sonner'
import { AdminStats } from './admin-stats'
import { PipelineDMButton } from './pipeline-dm-button'
import staticQuestions from '@/utils/builder/static-questions.json'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProject } from '@/context/ProjectContext'
import { useRouter } from 'next/navigation'
import { WorkflowForm } from '@/components/workflow/workflow-form'
import { PaymentForm } from '@/app/dashboard/projects/[id]/payment-form'
import { RealtimeComments } from '@/app/dashboard/projects/[id]/realtime-comments'
import { StudioArchitectButton } from '@/components/projects/studio-architect-button'


interface Project {
  id: string
  client_name: string
  status: string
  created_at: string
  created_by: string
  workflow_template_id: string
  current_assignee_id: string | null
  deadline?: string
  workflow_templates?: any
  project_team?: any[]
  description?: string
  budget: number
  existing_domain?: string
  stage_data?: Record<string, any>
  payments?: any[]
  config?: any
  is_active?: boolean
  current_stage_id?: string
  next_stage_id?: string
  comments?: any[]
}

interface ProjectPipelineTrackerProps {
  initialProjects: Project[]
  staff: any[]
  currentUserId: string
  currentUserRole: string
}



function PendingButton({ loading, children, className, ...props }: any) {
  return (
    <Button
      disabled={loading}
      className={cn("relative transition-all duration-300", className)}
      {...props}
    >
      <span className={cn("transition-all duration-300 flex items-center gap-2", loading ? "opacity-0 scale-95" : "opacity-100 scale-100")}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
        </div>
      )}
    </Button>
  )
}


function HandoffTerminalContent({
  project,
  currentUserRole,
  currentUserId,
  staff,
  handoffStatusOverrides,
  setHandoffStatusOverrides,
  setActiveProjectId,
  allProjects,
  setStudioProjectId
}: any) {
  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const template = Array.isArray(project.workflow_templates) ? project.workflow_templates[0] : project.workflow_templates
  const stages = template?.workflow_stages || []

  const isStatusEquivalent = (s1: string | undefined, s2: string | undefined) => {
    if (!s1 || !s2) return false
    const clean = (s: string) => s.toLowerCase().replace(/_/g, '').replace(/\s/g, '')
    return clean(s1) === clean(s2)
  }

  const currentStage = stages.find((s: any) => s.id === project.current_stage_id) ||
    stages.find((s: any) => isStatusEquivalent(s.status_key, project.status)) ||
    stages[0]

  const currentStageIndex = stages.findIndex((s: any) => s.id === currentStage?.id)
  const nextStageId = handoffStatusOverrides[project.id] || project.next_stage_id || stages[currentStageIndex + 1]?.id || currentStage?.id
  const nextStageObj = stages?.find((s: any) => s.id === nextStageId)

  const filteredStaff = staff?.filter((s: any) => {
    if (!nextStageObj) return true
    return s.role === nextStageObj.acting_role
  })

  const isManager = currentUserRole === 'Admin' || currentUserRole === 'Manager'

  return (
    <div
      className="flex flex-col h-full bg-[#fafafa] overflow-hidden"
      style={{ fontFamily: mazzardFont }}
    >
      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-zinc-200 flex-shrink-0 flex items-center justify-between bg-[#fafafa]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="space-y-0">
            <DialogTitle className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter italic leading-none">{project.client_name}</DialogTitle>
            <p className="text-[12px] md:text-[14px] font-black text-emerald-500 tracking-[0.05em] mt-1">Handoff Protocol</p>
          </div>
        </div>

        <Badge variant="outline" className="h-7 md:h-8 px-3 md:px-4 rounded-none border-zinc-200 bg-zinc-100 text-zinc-900 font-black uppercase tracking-widest text-[11px] md:text-[12px]">
          {currentStage?.display_name} Phase
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 md:py-6 custom-scrollbar bg-[#fafafa]">
        <div className="max-w-4xl mx-auto space-y-4">
          <form id={`handoff-form-${project.id}`} className="space-y-4" onSubmit={(e) => e.preventDefault()}>

            <WorkflowForm
              key={`handoff-${project.id}-${currentStage?.id || 'none'}`}
              workflowId={project.workflow_template_id}
              stageId={currentStage?.id}
              prefix="dyn_"
              userRole={currentUserRole}
              initialData={{
                ...(project.stage_data?.[currentStage?.id]?.data || {}),
                ...(project.config?.builder?.content_overrides || {}),
                ...(project.config?.builder?.global_styles || {}),
                ...(project.config?.seo || {})
              }}
            />

            <div className="border-t border-zinc-100/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-100/50">
                <div className="space-y-2 group/field">
                  <label className="text-[13px] font-black tracking-[0.05em] text-zinc-500 group-hover/field:text-zinc-950 transition-colors">Destination Phase</label>
                  <div className="w-full h-11 bg-zinc-50 border border-zinc-950 px-4 text-[13px] font-black text-zinc-900 flex items-center rounded-none opacity-60">
                    {nextStageObj?.display_name || 'Project Finalization'}
                  </div>
                </div>

                <div className="space-y-2 group/field">
                  <label className="text-[13px] font-black tracking-[0.05em] text-zinc-500 group-hover/field:text-zinc-950 transition-colors">Successor Unit</label>
                  <select
                    id={`handoff-assignee-${project.id}`}
                    className="w-full h-11 bg-white border border-zinc-950 px-4 text-[13px] font-black text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all appearance-none cursor-pointer outline-none rounded-none shadow-sm"
                    defaultValue={project.current_assignee_id || ''}
                    onChange={async (e) => {
                      const targetStage = stages.find((s: any) => s.id === nextStageId)
                      await saveHandoffPreset(project.id, targetStage?.status_key || '', e.target.value)
                    }}
                  >
                    <option value="">Select Personnel</option>
                    {filteredStaff?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {isManager && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 group/field">
                  <label className="text-[13px] font-black tracking-[0.05em] text-zinc-500 group-hover/field:text-zinc-950 transition-colors pt-1">Strategic Note</label>
                  <div className="md:col-span-2">
                    <textarea
                      id={`handoff-note-${project.id}`}
                      className="w-full min-h-[120px] bg-white border border-zinc-950 p-4 text-[13px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all outline-none resize-none placeholder:text-zinc-300 leading-relaxed rounded-none shadow-sm"
                      placeholder="Add context for successor..."
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="px-6 md:px-8 py-4 md:py-6 border-t border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0 flex-shrink-0 bg-[#fafafa]">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveProjectId(null)}
            className="h-10 md:h-12 px-4 md:px-6 border border-zinc-200 rounded-none text-zinc-900 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all"
          >
            Cancel Protocol
          </Button>

          {(currentUserRole === 'Admin' || currentUserRole === 'Manager' || currentUserRole === 'Developer') && (
            <StudioArchitectButton
              project={project}
              initialConfig={project.config?.builder}
              onOpen={() => setActiveProjectId(null)}
            />
          )}
        </div>
        <PendingButton
          loading={isSubmitting}
          form={`handoff-form-${project.id}`}
          onClick={async () => {
            setIsSubmitting(true)
            const formElement = document.getElementById(`handoff-form-${project.id}`)
            if (formElement) {
              const formData = new FormData(formElement as HTMLFormElement)
              const stageDataValues: Record<string, any> = {}
              formData.forEach((value, key) => key.startsWith('dyn_') && (stageDataValues[key.replace('dyn_', '')] = value))

              if (currentUserRole === 'Developer') {
                const githubLink = formData.get('dyn_github_link') || formData.get('github_link')
                if (!githubLink) {
                  toast.error("Requirements Missing", { description: "Github Repository URL is mandatory for developers." })
                  setIsSubmitting(false)
                  return
                }
              }

              try {
                const note = (document.getElementById(`handoff-note-${project.id}`) as HTMLTextAreaElement)?.value || ""
                const targetStageId = nextStageId
                const targetAssigneeId = (document.getElementById(`handoff-assignee-${project.id}`) as HTMLSelectElement).value

                const result = await handoffProject(project.id, targetAssigneeId, undefined, note, { stageId: currentStage?.id, data: stageDataValues }, targetStageId)
                if (result.success) {
                  toast.success("Stage Authorization Complete")
                  setActiveProjectId(null)
                } else {
                  toast.error("Process Failure")
                }
              } catch (error) {
                toast.error("System Error")
              } finally {
                setIsSubmitting(false)
              }
            }
          }}
          className="h-10 md:h-12 px-6 md:px-10 bg-zinc-950 text-white rounded-none border border-zinc-950 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3"
        >
          Authorize Transition <ArrowRight className="w-3.5 h-3.5" />
        </PendingButton>
      </div>
    </div>
  )
}

export function ProjectPipelineTracker({
  initialProjects,
  staff,
  currentUserId,
  currentUserRole
}: ProjectPipelineTrackerProps) {
  const router = useRouter()
  const {
    activeProjectId,
    setActiveProjectId,
    setProjects,
    activeProject: handoffProjectData,
    missingFields,
    searchQuery,
    setSearchQuery,
    showArchived,
    setShowArchived,
    viewMode,
    setViewMode
  } = useProject()

  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [handoffMessage, setHandoffMessage] = useState('')
  const [missingDataValues, setMissingDataValues] = useState<Record<string, string>>({})
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [handoffStatusOverrides, setHandoffStatusOverrides] = useState<Record<string, string>>({})

  const isStatusEquivalent = (a: string, b: string) =>
    a?.toLowerCase().replace(/_/g, '') === b?.toLowerCase().replace(/_/g, '')

  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  // Sync projects to context
  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects, setProjects])

  const dynamicPhases = useMemo(() => {
    const phaseMap = new Map<string, { label: string, status: string, order: number }>()

    initialProjects.forEach(project => {
      const template = (Array.isArray(project.workflow_templates) ? project.workflow_templates[0] : project.workflow_templates) || null
      if (template && template.workflow_stages) {
        template.workflow_stages.forEach((s: any, idx: number) => {
          if (!phaseMap.has(s.status_key)) {
            phaseMap.set(s.status_key, {
              label: s.display_name,
              status: s.status_key,
              order: idx
            })
          }
        })
      }
    })

    const phases = Array.from(phaseMap.values()).sort((a, b) => a.order - b.order)

    const styles = [
      { color: 'bg-zinc-200', text: 'text-zinc-900', bg: 'bg-zinc-50' },
      { color: 'bg-amber-200', text: 'text-amber-900', bg: 'bg-amber-50' },
      { color: 'bg-blue-200', text: 'text-blue-900', bg: 'bg-blue-50' },
      { color: 'bg-emerald-200', text: 'text-emerald-900', bg: 'bg-emerald-50' },
      { color: 'bg-purple-200', text: 'text-purple-900', bg: 'bg-purple-50' },
      { color: 'bg-rose-200', text: 'text-rose-900', bg: 'bg-rose-50' },
      { color: 'bg-indigo-200', text: 'text-indigo-900', bg: 'bg-indigo-50' }
    ]

    return phases.map((s, i) => ({
      ...s,
      ...styles[i % styles.length]
    }))
  }, [initialProjects])

  const handleLongPress = (project: Project) => {
    longPressTimer.current = setTimeout(() => {
      const isManager = currentUserRole === 'Manager' || currentUserRole === 'Admin'
      const isAssignee = project.current_assignee_id === currentUserId

      if (isManager || isAssignee) {
        setActiveProjectId(project.id)
        setHandoffMessage("")
        setMissingDataValues({})
      } else {
        toast.error("Access Denied", {
          description: "Only Managers or project owners can view detailed mission records."
        })
      }
    }, 700)
  }

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(p => {
      let statusToMatch = p.status
      if (p.status === 'NEW_LEAD') {
        const template = (Array.isArray(p.workflow_templates) ? p.workflow_templates[0] : p.workflow_templates) || null
        statusToMatch = template?.workflow_stages?.[0]?.status_key || p.status
      }
      const matchesPhase = selectedPhase ? statusToMatch === selectedPhase : true
      const matchesSearch = p.client_name.toLowerCase().includes(searchQuery.toLowerCase())
      const isActive = p.is_active !== false || showArchived
      return matchesPhase && matchesSearch && isActive
    })
  }, [initialProjects, selectedPhase, searchQuery, showArchived])

  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    dynamicPhases.forEach((p: any) => {
      counts[p.status] = initialProjects.filter(proj => {
        let statusToMatch = proj.status
        if (proj.status === 'NEW_LEAD') {
          const template = (Array.isArray(proj.workflow_templates) ? proj.workflow_templates[0] : proj.workflow_templates) || null
          statusToMatch = template?.workflow_stages?.[0]?.status_key || proj.status
        }
        return statusToMatch === p.status
      }).length
    })
    return counts
  }, [initialProjects, dynamicPhases])

  return (
    <div className="bg-[#fafafa] p-4 md:p-10 space-y-6 md:space-y-10">
      {/* Phase Navigation Tabs - Minimalist Row */}
      {(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
          {dynamicPhases.map((phase: any) => (
            <button
              key={phase.status}
              onClick={() => setSelectedPhase(selectedPhase === phase.status ? null : phase.status)}
              className={cn(
                "flex flex-col gap-2 p-4 pt-3 border transition-all text-left group rounded-none",
                selectedPhase === phase.status
                  ? `${phase.bg} border-zinc-200 text-zinc-900`
                  : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] leading-none",
                  selectedPhase === phase.status ? "text-zinc-600" : "text-zinc-400"
                )}>
                  {phase.label}
                </span>
                <div className={cn(
                  "w-2 h-2 rounded-none border border-zinc-200",
                  phase.color
                )} />
              </div>
              <span className="text-2xl font-black tabular-nums leading-none mt-1 text-zinc-900">
                {stats[phase.status] || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
        <AdminStats projects={initialProjects} staff={staff || []} />
      )}

      <div className="space-y-4 md:space-y-6">

        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 gap-1">
            {filteredProjects.map((project) => {
              const template = Array.isArray(project.workflow_templates) ? project.workflow_templates[0] : project.workflow_templates
              const stages = template?.workflow_stages || []
              const currentStage = stages.find((s: any) => isStatusEquivalent(s.status_key, project.status)) || stages[0]
              const isAssignedToMe = project.current_assignee_id === currentUserId

              return (
                <div
                  key={project.id}
                  onMouseDown={() => handleLongPress(project)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  className={cn(
                    "group relative flex items-center justify-between py-4 border border-zinc-200 hover:bg-zinc-50/80 transition-all px-8 cursor-pointer mb-2 rounded-none bg-white"
                  )}
                >
                  {project.deadline && (
                    <div className={cn(
                      "absolute -top-[1px] right-20 px-3 py-0.5 border-x border-b border-zinc-200 text-[9px] font-black uppercase tracking-widest",
                      new Date(project.deadline).getTime() - new Date().getTime() < 172800000
                        ? "bg-rose-200 text-rose-900 animate-pulse"
                        : "bg-zinc-100 text-zinc-900"
                    )}>
                      {new Date(project.deadline).getTime() - new Date().getTime() < 0 ? "OVERDUE" : "DEADLINE"}
                    </div>
                  )}

                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-9 h-9 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-black text-zinc-500 tracking-tight block">Client Identity</span>
                        <h3 className="text-sm font-black text-zinc-950 tracking-tight">{project.client_name}</h3>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[13px] font-black text-zinc-500 tracking-tight block">Current Phase</span>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-none border border-zinc-200 bg-emerald-500" />
                          <span className="text-[12px] font-black text-zinc-900 tracking-tight">{currentStage?.display_name}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[13px] font-black text-zinc-500 tracking-tight block">Assignee</span>
                        <span className="text-[12px] font-black text-zinc-900 tracking-tight">
                          {staff?.find(s => s.id === project.current_assignee_id)?.full_name || 'Unassigned'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[13px] font-black text-zinc-500 tracking-tight block">Timestamp</span>
                        <span className="text-[12px] font-black text-zinc-500 tracking-tight tabular-nums">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pl-8">
                    {isAssignedToMe && (
                      <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center animate-pulse">
                        <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-zinc-100 transition-all opacity-0 group-hover:opacity-100">
                        <ArrowRight className="w-4 h-4 text-zinc-900" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
            {filteredProjects.map((project) => {
              const template = Array.isArray(project.workflow_templates) ? project.workflow_templates[0] : project.workflow_templates
              const stages = template?.workflow_stages || []
              const currentStage = stages.find((s: any) => isStatusEquivalent(s.status_key, project.status)) || stages[0]

              return (
                <div
                  key={project.id}
                  onMouseDown={() => handleLongPress(project)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={() => handleLongPress(project)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={cn(
                    "group relative flex flex-col gap-4 py-6 border border-zinc-950 hover:bg-zinc-50/20 transition-all px-4 md:px-6 cursor-pointer rounded-none h-full",
                    (currentUserRole === 'Admin' || currentUserRole === 'Manager')
                      ? (dynamicPhases.find(p => isStatusEquivalent(p.status, project.status))?.bg || "bg-white")
                      : "bg-white"
                  )}
                >
                  {project.deadline && (
                    <div className={cn(
                      "absolute -top-[1px] right-4 px-3 py-0.5 border-x border-b border-zinc-950 text-[9px] font-black uppercase tracking-widest",
                      new Date(project.deadline).getTime() - new Date().getTime() < 172800000
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-zinc-900 text-white"
                    )}>
                      {new Date(project.deadline).getTime() - new Date().getTime() < 0 ? "OVERDUE" : "DEADLINE"}
                    </div>
                  )}
                  {/* Grid View Content */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-zinc-400 tracking-tight block uppercase leading-none">Mission ID: {project.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[15px] font-black text-zinc-900 tracking-tight leading-none">
                        Stage {stages.indexOf(currentStage) + 1} <span className="text-zinc-400">/ {stages.length}</span>
                      </span>
                      <div className="w-20 h-1 bg-zinc-200 border border-zinc-300 mt-2 relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-zinc-950 transition-all duration-1000"
                          style={{ width: `${((stages.indexOf(currentStage) + 1) / stages.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-black text-zinc-900 tracking-tighter uppercase leading-tight">{project.client_name}</h3>
                  </div>
                  <div className="pt-4 border-t border-zinc-950 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 border border-zinc-950", currentStage?.color || 'bg-zinc-950')} />
                        <span className="text-[12px] font-black text-zinc-900 uppercase tracking-widest leading-none">{currentStage?.display_name}</span>
                      </div>
                      <Link href={`/dashboard/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
                        <div className="w-8 h-8 border border-zinc-950 flex items-center justify-center hover:bg-zinc-950 hover:text-white transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    </div>
                    {(() => {
                      const latestComment = project.comments?.sort((a: any, b: any) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )[0];
                      if (!latestComment) return null;
                      return (
                        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-none">
                          <p className="text-[12px] font-bold text-zinc-900 line-clamp-2 leading-relaxed tracking-tight uppercase">
                            {latestComment.content}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>


      {/* Handoff Modal */}
      <Dialog open={!!activeProjectId} onOpenChange={(open) => !open && setActiveProjectId(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] bg-[#fafafa] border border-zinc-200 rounded-none p-0 overflow-hidden shadow-none flex flex-col h-auto max-h-[95vh] outline-none">
          {activeProjectId && handoffProjectData && (
            <HandoffTerminalContent
              project={handoffProjectData}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              staff={staff}
              handoffStatusOverrides={handoffStatusOverrides}
              setHandoffStatusOverrides={setHandoffStatusOverrides}
              setActiveProjectId={setActiveProjectId}
              allProjects={initialProjects}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Detail Modal */}
      <Dialog open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
        <DialogContent className="max-w-2xl bg-white border-zinc-200 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
          <DialogHeader className="mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-zinc-100 bg-zinc-50 flex items-center justify-center rounded-none shadow-sm">
                <History className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-zinc-400 tracking-[0.1em]">Operational Unit</span>
                <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-none mt-1">Developer Requirements</h3>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-0 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar border-t border-zinc-50">
            {selectedAudit?.data && Object.entries(selectedAudit.data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-zinc-50 items-center group/field">
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">{key.replace(/_/g, ' ')}</span>
                <div className="md:col-span-2">
                  <div className="bg-[#fafafa] border border-zinc-100 p-4 text-[13px] font-black uppercase tracking-widest text-zinc-900">
                    {String(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 flex justify-end">
            <Button
              onClick={() => setSelectedAudit(null)}
              className="h-12 px-10 rounded-none bg-zinc-950 text-white font-black uppercase tracking-[0.2em] hover:bg-black transition-all border border-zinc-200"
            >
              Close Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
