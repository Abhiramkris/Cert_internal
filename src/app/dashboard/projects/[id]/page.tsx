import { getProjectDetail, getUserProfile, getStaff, getProjectsMinimal, getWorkflowConfig, getWebsiteConfig } from '@/utils/supabase/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, ArrowRight, User, Clock, FileText, CheckCircle, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PaymentForm } from './payment-form'
import { RealtimeComments } from './realtime-comments'
import { WebsiteBuilderConfigurator } from '@/components/projects/website-builder-configurator'
import { WorkflowForm } from '@/components/workflow/workflow-form'
import { HandoffOverride } from '@/components/projects/handoff-override'
import { ProjectGeneratorActions } from '@/components/projects/project-generator-actions'
import { selfAssignProject, submitStageData, saveStageData } from '../actions'
import staticQuestions from '@/utils/builder/static-questions.json'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const user = await getUserProfile()
  const { data: project } = await getProjectDetail(id)
  const { data: staff } = await getStaff()
  const { data: websiteConfig } = await getWebsiteConfig(id)

  if (!user || !project) return <div className="p-12 text-zinc-600 font-bold uppercase tracking-widest text-center">Project not found</div>

  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'

  // Resilient status matching
  const isStatusEquivalent = (s1: string, s2: string) => {
    if (!s1 || !s2) return false
    const normalize = (s: string) => s.toLowerCase().replace(/_/g, '').replace('assigned', 'assignment')
    return normalize(s1) === normalize(s2)
  }

  // Fetch ALL stages
  const { data: templateStagesData } = await getWorkflowConfig(undefined, project.workflow_template_id)
  const templateStages = templateStagesData || []
  
  const currentStage = project.current_stage_id 
    ? templateStages.find((s: any) => s.id === project.current_stage_id)
    : templateStages.find((s: any) => isStatusEquivalent(s.status_key, project.status)) || templateStages[0] || null
    
  const currentStageIndex = templateStages.findIndex((s: any) => s.id === currentStage?.id)
  const currentStageData = project.stage_data?.[currentStage?.id]?.data || {}
  
  const isManager = user.profile.role === 'Manager'
  const isAdmin = user.profile.role === 'Admin'
  const isAssigned = user.id === project.current_assignee_id
  const isCorrectRole = user.profile.role === currentStage?.acting_role

  const currentAssigneeRole = staff?.find(s => s.id === project.current_assignee_id)?.role
  const isHeldByManager = currentAssigneeRole === 'Manager' || currentAssigneeRole === 'Admin'

  const canAction = isManager || isAdmin || isAssigned || (isCorrectRole && (!project.current_assignee_id || isHeldByManager))

  const { data: allProjects } = await getProjectsMinimal()
  const canManagePayments = user.profile.role === 'Admin' || user.profile.role === 'Manager'

  const totalPaid = project.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const balance = project.budget - totalPaid

  return (
    <div className="space-y-0 pb-20 bg-[#fafafa] min-h-screen">
      
      {/* Studio Header */}
      <div className="px-6 md:px-12 py-8 border-b border-zinc-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <Link
              href="/dashboard"
              className="flex items-center justify-center bg-zinc-50 hover:bg-zinc-950 text-zinc-900 hover:text-white rounded-none h-14 w-14 transition-all border border-zinc-200 shadow-sm shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="space-y-2">
              <h1 style={{ fontFamily: mazzardFont }} className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tighter italic uppercase leading-none">
                {project.client_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="rounded-none font-bold text-[10px] px-3 py-1 border-zinc-950 uppercase tracking-[0.2em] bg-zinc-950 text-white">
                  {currentStage?.display_name || project.status.replace(/_/g, ' ')}
                </Badge>
                
                {project.current_assignee_id ? (
                  <div className="flex items-center gap-2 border border-zinc-200 rounded-none px-3 py-1 bg-white">
                    <div className="w-2 h-2 bg-[#67A708] animate-pulse rounded-none" />
                    <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                      {staff?.find(s => s.id === project.current_assignee_id)?.full_name || 'Active'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border border-rose-200 rounded-none px-3 py-1 bg-rose-50">
                    <div className="w-2 h-2 bg-rose-500 animate-pulse rounded-none" />
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Unassigned</span>
                    {(isAdmin || isManager || isCorrectRole) && (
                      <form action={selfAssignProject.bind(null, project.id)} className="ml-2">
                        <PendingButton type="submit" variant="outline" className="h-6 px-3 text-[9px] font-bold uppercase tracking-widest border-rose-200 text-rose-700 bg-white hover:bg-rose-100 rounded-none transition-all">
                          Claim Action
                        </PendingButton>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        <Tabs defaultValue="overview" className="w-full">
          {/* Architectural Tabs */}
          <TabsList className="bg-transparent border-b border-zinc-200 p-0 rounded-none h-auto mb-12 w-full justify-start gap-0 md:gap-2 flex-wrap">
            {['overview', 'details', 'workflow', 'finances', 'comments'].map((tab) => {
              if (tab === 'finances' && !canManagePayments) return null
              return (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  style={{ fontFamily: mazzardFont }}
                  className="rounded-none bg-transparent px-6 py-4 text-[12px] md:text-[14px] font-bold border-b-2 border-transparent data-[state=active]:bg-zinc-950 data-[state=active]:border-zinc-950 data-[state=active]:text-white hover:bg-zinc-100 text-zinc-500 transition-all uppercase tracking-[0.2em] mb-2 lg:mb-0"
                >
                  {tab === 'generator' ? 'Studio Architect' : tab}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-5xl">
              <form action={async (fd) => {
                'use server'
                const rawData = Object.fromEntries(fd.entries())
                const stageData: Record<string, any> = {}
                const dynPrefix = 'dyn_'
                
                Object.keys(rawData).forEach(key => {
                  const isStatic = staticQuestions.some(q => q.key === key)
                  if (key.startsWith(dynPrefix)) {
                    stageData[key.replace(dynPrefix, '')] = rawData[key]
                  } else if (isStatic) {
                    stageData[key] = rawData[key]
                  }
                })

                const action = fd.get('action') as string
                const nextStatus = fd.get('status') as string
                const nextAssignee = fd.get('current_assignee_id') as string
                const note = fd.get('handoff_note') as string

                if (action === 'save') {
                  await saveStageData(project.id, currentStage.id, stageData)
                } else {
                  await submitStageData(project.id, currentStage.id, stageData, nextStatus, nextAssignee, note)
                }
              }} className="space-y-12">
                
                {canAction && ( 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Workflow Logistics Block */}
                    <div className="w-full bg-white border border-zinc-200 p-8 shadow-sm rounded-none">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
                         <h3 style={{ fontFamily: mazzardFont }} className="text-lg font-black uppercase tracking-tighter italic text-zinc-950">Workflow Logistics</h3>
                         <Badge variant="outline" className="bg-zinc-100 text-zinc-900 border-none font-bold px-3 py-1 rounded-none text-[9px] uppercase tracking-widest">
                            {currentStage?.display_name || project.status}
                         </Badge>
                      </div>
                      <HandoffOverride 
                        project={project}
                        templateStages={templateStages}
                        currentStageIndex={currentStageIndex}
                        staff={staff || []}
                        isManager={isManager}
                      />
                    </div>

                    {/* Production Hub Block */}
                    <div className="w-full bg-zinc-950 border border-zinc-950 p-8 shadow-xl rounded-none relative flex flex-col group/hub">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                         <div className="w-2 h-2 bg-[#67A708] rounded-none animate-pulse" />
                         <h3 style={{ fontFamily: mazzardFont }} className="text-lg font-black uppercase tracking-tighter italic text-white leading-none mt-1">Production Hub</h3>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        {user.profile.role?.toLowerCase() === 'developer' || isManager || isAdmin ? (
                          <ProjectGeneratorActions 
                            project={project}
                            websiteConfig={websiteConfig}
                          />
                        ) : (
                          <div className="py-8 text-center border border-dashed border-zinc-800 bg-black/50 p-6">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">Architect clearance required.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-zinc-200 shadow-sm rounded-none p-0 overflow-hidden flex flex-col">
                   <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <WorkflowForm 
                        key={`${project.id}-active-${currentStage?.id || 'none'}`}
                        workflowId={project.workflow_template_id} 
                        stageId={currentStage?.id}
                        initialData={{
                          ...(currentStageData || {}),
                          ...(project.config?.builder?.content_overrides || {}),
                          ...(project.config?.builder?.global_styles || {}),
                          ...(project.config?.seo || {})
                        }}
                        financials={{ totalPaid, balance }}
                        userRole={user.profile.role}
                        readOnly={!canAction}
                        prefix="dyn_"
                      />
                   </div>

                   {canAction && (
                      <div className="flex flex-col md:flex-row justify-end gap-0 border-t border-zinc-200 bg-[#fafafa]">
                        <PendingButton 
                          type="submit" 
                          name="action" 
                          value="save"
                          variant="ghost"
                          style={{ fontFamily: mazzardFont }}
                          className="w-full md:w-auto h-16 px-10 rounded-none text-zinc-600 font-bold uppercase tracking-widest hover:bg-zinc-200 hover:text-zinc-950 transition-all text-[12px]"
                        >
                          Save State
                        </PendingButton>
                        <PendingButton 
                          type="submit" 
                          name="action" 
                          value="handover"
                          style={{ fontFamily: mazzardFont }}
                          className="w-full md:w-auto h-16 px-12 rounded-none bg-zinc-950 text-white font-bold uppercase tracking-[0.2em] hover:bg-black transition-all text-[13px] flex items-center justify-center gap-4 group"
                        >
                          Protocol Handover <ArrowRight className="w-5 h-5 text-[#67A708] group-hover:translate-x-2 transition-transform" />
                        </PendingButton>
                      </div>
                   )}
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-5xl bg-white border border-zinc-200 shadow-sm p-8 md:p-12">
              <h3 style={{ fontFamily: mazzardFont }} className="text-xl font-black uppercase tracking-tighter italic text-zinc-950 mb-8 pb-4 border-b border-zinc-100">Compiled Mission Intelligence</h3>
              {project.stage_data && Object.keys(project.stage_data).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {Object.entries(project.stage_data).map(([key, value]) => {
                    const formatKey = (k: string) => {
                      if (k === 'custom_code') return 'Custom Development Code'
                      return k.replace(/_/g, ' ')
                    }
                    
                    const renderValue = (v: any) => {
                      if (typeof v === 'boolean') return v ? 'Yes' : 'No'
                      if (Array.isArray(v)) return v.join(', ')
                      if (typeof v === 'object' && v !== null) return JSON.stringify(v)
                      if (!v || v === '') return 'N/A'
                      return String(v)
                    }

                    return (
                      <div key={key} className="flex flex-col gap-1 border-b border-zinc-50 pb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                          {formatKey(key)}
                        </span>
                        <span className="text-[13px] font-semibold text-zinc-900 leading-relaxed break-words">
                          {renderValue(value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 font-semibold text-sm uppercase tracking-widest border border-dashed border-zinc-200 bg-zinc-50/50">
                  No recorded intelligence found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl space-y-16">
              {/* Timeline Block */}
              <div className="bg-white border border-zinc-200 p-8 md:p-16 shadow-sm rounded-none">
                <h3 style={{ fontFamily: mazzardFont }} className="text-2xl font-black uppercase tracking-tighter italic text-zinc-950 mb-12 border-b border-zinc-100 pb-6">Lifecycle Record</h3>
                
                <div className="space-y-16 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-[2px] before:bg-zinc-100">
                  {project.workflow_template?.workflow_stages?.map((step: any, i: number) => {
                    const isCompleted = (project.stage_data && project.stage_data[step.id]) || project.status === step.status_key
                    const isActive = project.status === step.status_key
                    const isPending = !isCompleted && !isActive
                    
                    const audit = project.stage_data?.[step.id]
                    const submitter = staff?.find(s => s.id === audit?.submitted_by)

                    return (
                       <div key={i} className="relative flex items-start group">
                        <div className={cn(
                          "flex items-center justify-center w-14 h-14 border-2 shrink-0 transition-all duration-500 z-10 rounded-none",
                          isActive ? "bg-zinc-950 border-zinc-950 text-white shadow-xl rotate-45" :
                            isCompleted ? "bg-zinc-100 border-zinc-200 text-zinc-950 rotate-45" :
                              "bg-white border-zinc-200 text-zinc-300"
                        )}>
                           <div className={cn("transition-transform duration-500", (isActive || isCompleted) && "-rotate-45")}>
                              {isCompleted && !isActive ? <CheckCircle className="w-5 h-5" /> : <div className="w-2 h-2 bg-current" />}
                           </div>
                        </div>
                        <div className="ml-10 pt-1 flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                            <h4 style={{ fontFamily: mazzardFont }} className={cn("text-lg font-black uppercase tracking-tight italic transition-colors", isPending ? "text-zinc-400" : "text-zinc-950")}>
                              {step.display_name}
                            </h4>
                            <span className={cn("text-[9px] font-bold px-3 py-1 rounded-none border uppercase tracking-[0.2em]",
                              isCompleted && !isActive ? "bg-zinc-50 border-zinc-200 text-zinc-600" :
                                isActive ? "bg-zinc-950 border-zinc-950 text-[#67A708]" : "bg-transparent border-zinc-200 text-zinc-400"
                            )}>{step.acting_role}</span>
                          </div>
                          
                          {isCompleted && audit && (
                            <div className="space-y-6 mt-6">
                              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 w-fit px-4 py-3 rounded-none border border-zinc-200">
                                 <User className="w-3.5 h-3.5" />
                                 <span className="text-zinc-900">{submitter?.full_name || 'System'}</span>
                                 <span className="opacity-30">|</span>
                                 <Clock className="w-3.5 h-3.5" />
                                 <span>{new Date(audit.submitted_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              {audit.data && Object.keys(audit.data).length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-none border border-zinc-200">
                                  {Object.entries(audit.data).map(([key, value]) => (
                                    <div key={key} className="p-4 bg-white space-y-2">
                                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] truncate block">{key.replace(/_/g, ' ')}</span>
                                      <span className="text-[12px] text-zinc-950 font-bold leading-tight line-clamp-3">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Logs Block */}
              {project.comments?.filter((c: any) => c.content.includes('Handoff Note:') || c.content.includes('Workflow Changed:')).length > 0 && (
                <div className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-none">
                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-zinc-100">
                    <div className="w-12 h-12 rounded-none bg-zinc-950 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: mazzardFont }} className="text-xl font-black uppercase tracking-tighter italic text-zinc-950 leading-none mb-1">System Logs</h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol Amendments</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {project.comments
                      .filter((c: any) => c.content.includes('Handoff Note:') || c.content.includes('Workflow Changed:'))
                      .reverse()
                      .map((comment: any) => (
                        <div key={comment.id} className="p-6 bg-zinc-50 border border-zinc-200 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white transition-colors">
                           <div className="flex-1">
                             <p className="text-[13px] font-bold text-zinc-900 leading-relaxed">
                               {comment.content.replace('Handoff Note: ', '').replace('Workflow Changed: ', '')}
                             </p>
                           </div>
                           <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="outline" className="bg-white border-zinc-200 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] rounded-none px-3 py-1">
                                System Event
                              </Badge>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                                {new Date(comment.created_at).toLocaleDateString('en-GB')} <br/>
                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {canManagePayments && (
            <TabsContent value="finances" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PaymentForm projectId={project.id} payments={project.payments || []} />
            </TabsContent>
          )}



          <TabsContent value="comments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RealtimeComments
              projectId={project.id}
              initialComments={project.comments || []}
              userId={user.profile.id}
              projects={allProjects || []}
              staff={staff || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
