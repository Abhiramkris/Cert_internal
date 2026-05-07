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
            <DialogTitle className="text-lg md:text-xl font-semibold text-zinc-900 tracking-tighter italic leading-none">{project.client_name}</DialogTitle>
            <p className="text-[12px] md:text-[14px] font-semibold text-[#67A708] tracking-[0.05em] mt-1">Handoff Protocol</p>
          </div>
        </div>

        <Badge variant="outline" className="h-7 md:h-8 px-3 md:px-4 rounded-none border-zinc-200 bg-zinc-100 text-zinc-900 font-semibold uppercase tracking-widest text-[11px] md:text-[12px]">
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
                  <label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors">Destination Phase</label>
                  <div className="w-full h-11 bg-zinc-50 border border-zinc-950 px-4 text-[13px] font-semibold text-zinc-900 flex items-center rounded-none opacity-60">
                    {nextStageObj?.display_name || 'Project Finalization'}
                  </div>
                </div>

                <div className="space-y-2 group/field">
                  <label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors">Successor Unit</label>
                  <select
                    id={`handoff-assignee-${project.id}`}
                    className="w-full h-11 bg-white border border-zinc-950 px-4 text-[13px] font-semibold text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all appearance-none cursor-pointer outline-none rounded-none shadow-sm"
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
                  <label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors pt-1">Strategic Note</label>
                  <div className="md:col-span-2">
                    <textarea
                      id={`handoff-note-${project.id}`}
                      className="w-full min-h-[120px] bg-white border border-zinc-950 p-4 text-[13px] font-semibold tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all outline-none resize-none placeholder:text-zinc-500 leading-relaxed rounded-none shadow-sm"
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
            className="h-10 md:h-12 px-4 md:px-6 border border-zinc-200 rounded-none text-zinc-900 font-semibold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all"
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
          className="h-10 md:h-12 px-6 md:px-10 bg-zinc-950 text-white rounded-none border border-zinc-950 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3"
        >
          Handoff <ArrowRight className="w-3.5 h-3.5" />
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

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }
  }, [])

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
      { color: 'bg-[#67A708]', text: 'text-white', bg: 'bg-[#67A708]/10' },
      { color: 'bg-[#B1F00B]', text: 'text-[#67A708]', bg: 'bg-[#B1F00B]/10' },
      { color: 'bg-[#67A708]/80', text: 'text-white', bg: 'bg-[#67A708]/5' },
      { color: 'bg-[#B1F00B]/80', text: 'text-[#67A708]', bg: 'bg-[#B1F00B]/5' },
      { color: 'bg-[#67A708]/60', text: 'text-white', bg: 'bg-[#67A708]/2' },
      { color: 'bg-[#B1F00B]/60', text: 'text-[#67A708]', bg: 'bg-[#B1F00B]/2' },
      { color: 'bg-zinc-200', text: 'text-zinc-900', bg: 'bg-zinc-50' }
    ]

    return phases.map((s, i) => ({
      ...s,
      ...styles[i % styles.length]
    }))
  }, [initialProjects])

  const handleLongPress = (project: Project) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
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
      const matchesSearch = (p.client_name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
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
    <div className="bg-[#fafafa] space-y-6">
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
                  ? `${phase.bg} border-[#67A708] text-zinc-900 shadow-[inset_0_0_0_1px_#67A708]`
                  : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[9px] font-semibold uppercase tracking-[0.2em] leading-none",
                  selectedPhase === phase.status ? "text-[#67A708]" : "text-zinc-600"
                )}>
                  {phase.label}
                </span>
                <div className={cn(
                  "w-2 h-2 rounded-none border border-zinc-200",
                  phase.color
                )} />
              </div>
              <span className="text-2xl font-semibold tabular-nums leading-none mt-1 text-zinc-900">
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
          <div className="w-full overflow-x-auto bg-white border border-zinc-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Client Mission</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Current Phase</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Assignee</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Timeline</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600 text-right">Strategic Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProjects.map((project) => {
                  const template = Array.isArray(project.workflow_templates) ? project.workflow_templates[0] : project.workflow_templates
                  const stages = template?.workflow_stages || []
                  const currentStage = stages.find((s: any) => isStatusEquivalent(s.status_key, project.status)) || stages[0]
                  const isAssignedToMe = project.current_assignee_id === currentUserId
                  const isUnassigned = !project.current_assignee_id

                  return (
                    <tr 
                      key={project.id}
                      className="group hover:bg-[#67A708]/5 transition-colors cursor-default"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900 tracking-tight uppercase leading-none mb-1">{project.client_name}</span>
                            <span className="text-[10px] font-semibold text-zinc-600 tabular-nums uppercase tracking-widest opacity-60">ID: {project.id.slice(0,8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full border border-zinc-200", currentStage?.color || 'bg-[#67A708]')} />
                          <span className="text-[11px] font-semibold text-zinc-900 uppercase tracking-[0.15em]">
                            {currentStage?.display_name?.replace('DEVELOPEMENT', 'DEVELOPMENT') || 'Initiation'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 text-[10px] font-semibold border border-zinc-200">
                              {staff?.find(s => s.id === project.current_assignee_id)?.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-semibold text-zinc-900 leading-none mb-1">
                                {staff?.find(s => s.id === project.current_assignee_id)?.full_name || 'Unassigned'}
                              </span>
                              <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest leading-none">
                                {staff?.find(s => s.id === project.current_assignee_id)?.role || 'System'}
                              </span>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-zinc-600 tabular-nums">
                            CREATED: {new Date(project.created_at).getDate().toString().padStart(2, '0')}/{(new Date(project.created_at).getMonth() + 1).toString().padStart(2, '0')}/{new Date(project.created_at).getFullYear()}
                          </span>
                          {project.deadline && (
                            <span className={cn(
                              "text-[9px] font-semibold px-2 py-0.5 w-fit border rounded-none uppercase tracking-widest",
                              new Date(project.deadline).getTime() - new Date().getTime() < 172800000
                                ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                                : "bg-[#67A708]/10 text-[#67A708] border-[#67A708]/20"
                            )}>
                                {new Date(project.deadline).getTime() - new Date().getTime() < 0 
                                  ? "OVERDUE" 
                                  : `DUE: ${new Date(project.deadline).getDate().toString().padStart(2, '0')}/{(new Date(project.deadline).getMonth() + 1).toString().padStart(2, '0')}/{new Date(project.deadline).getFullYear()}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnassigned ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                const res = await selfAssignProject(project.id)
                                if (res.success) toast.success("Mission Assigned")
                              }}
                              className="h-8 rounded-none border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white font-semibold text-[9px] uppercase tracking-widest px-4 transition-all"
                            >
                              Claim
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveProjectId(project.id)}
                              className="h-8 rounded-none border-[#67A708] bg-white text-[#67A708] hover:bg-[#67A708] hover:text-white font-semibold text-[9px] uppercase tracking-widest px-4 transition-all"
                            >
                              Handoff
                            </Button>
                          )}
                          
                          <Link 
                            href={`/dashboard/projects/${project.id}`}
                            className="h-8 rounded-none bg-zinc-950 text-white font-semibold text-[9px] uppercase tracking-widest px-4 hover:bg-black transition-all flex items-center gap-2"
                          >
                            Details <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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
                      "absolute -top-[1px] right-4 px-3 py-0.5 border-x border-b border-zinc-950 text-[9px] font-semibold uppercase tracking-widest",
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
                        <span className="text-[13px] font-semibold text-zinc-600 tracking-tight block uppercase leading-none">Mission ID: {project.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[15px] font-semibold text-zinc-900 tracking-tight leading-none">
                        Stage {stages.indexOf(currentStage) + 1} <span className="text-zinc-600">/ {stages.length}</span>
                      </span>
                      <div className="w-20 h-1 bg-zinc-200 border border-zinc-300 mt-2 relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#67A708] to-[#B1F00B] transition-all duration-1000"
                          style={{ width: `${((stages.indexOf(currentStage) + 1) / stages.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-zinc-900 tracking-tighter uppercase leading-tight">{project.client_name}</h3>
                  </div>
                  <div className="pt-4 border-t border-zinc-950 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 border border-zinc-950", currentStage?.color || 'bg-zinc-950')} />
                        <span className="text-[12px] font-semibold text-zinc-900 uppercase tracking-widest leading-none">{currentStage?.display_name}</span>
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
                          <p className="text-[12px] font-semibold text-zinc-900 line-clamp-2 leading-relaxed tracking-tight uppercase">
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


      {/* Native Mobile/Desktop Modal */}
      {activeProjectId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => setActiveProjectId(null)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl bg-white shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            {!handoffProjectData ? (
              <div className="p-12 text-center bg-white">
                <p className="text-zinc-500 font-bold uppercase tracking-widest">Protocol Data Missing</p>
                <p className="text-xs text-zinc-400 mt-2">Active ID: {activeProjectId}</p>
                <Button onClick={() => setActiveProjectId(null)} className="mt-4">Close</Button>
              </div>
            ) : (
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
          </div>
        </div>
      )}

      {/* Audit Detail Modal */}
      <Dialog open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
        <DialogContent className="max-w-2xl bg-white border-zinc-200 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
          <DialogHeader className="mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-zinc-100 bg-zinc-50 flex items-center justify-center rounded-none shadow-sm">
                <History className="w-5 h-5 text-zinc-600" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold text-zinc-600 tracking-[0.1em]">Operational Unit</span>
                <h3 className="text-lg font-semibold text-zinc-900 tracking-tight leading-none mt-1">Developer Requirements</h3>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-0 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar border-t border-zinc-50">
            {selectedAudit?.data && Object.entries(selectedAudit.data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-zinc-50 items-center group/field">
                <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">{key.replace(/_/g, ' ')}</span>
                <div className="md:col-span-2">
                  <div className="bg-[#fafafa] border border-zinc-100 p-4 text-[13px] font-semibold uppercase tracking-widest text-zinc-900">
                    {String(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 flex justify-end">
            <Button
              onClick={() => setSelectedAudit(null)}
              className="h-12 px-10 rounded-none bg-zinc-950 text-white font-semibold uppercase tracking-[0.2em] hover:bg-black transition-all border border-zinc-200"
            >
              Close Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
