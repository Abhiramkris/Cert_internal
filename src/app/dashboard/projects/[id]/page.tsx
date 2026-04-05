import { getProjectDetail, getUserProfile, getStaff, getProjectsMinimal, getWorkflowConfig, getWebsiteConfig } from '@/utils/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Users, FileText, Code, Code2, CheckCircle, MessageSquare, Globe, Search, Settings, Sparkles, TrendingUp, Clock, User, ArrowRight, Archive, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PaymentForm } from './payment-form'
import { RealtimeComments } from './realtime-comments'
import { WebsiteBuilderConfigurator } from '@/components/projects/website-builder-configurator'
import { WorkflowForm } from '@/components/workflow/workflow-form'
import { HandoffOverride } from '@/components/projects/handoff-override'
import { ProjectGeneratorActions } from '@/components/projects/project-generator-actions'
import { finalizeProject, selfAssignProject, submitStageData, saveHandoffPreset, closeProject } from '../actions'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const user = await getUserProfile()
  const { data: project } = await getProjectDetail(id)
  const { data: staff } = await getStaff()
  const { data: websiteConfig } = await getWebsiteConfig(id)

  if (!user || !project) return <div className="p-8 text-zinc-400">Project not found</div>

  // Resilient status matching for legacy data (TEAM_ASSIGNED vs TEAM_ASSIGNMENT)
  const isStatusEquivalent = (s1: string, s2: string) => {
    if (!s1 || !s2) return false
    const normalize = (s: string) => s.toLowerCase().replace(/_/g, '').replace('assigned', 'assignment')
    return normalize(s1) === normalize(s2)
  }

  // Fetch ALL stages for this template to determine index mapping
  const { data: templateStagesData } = await getWorkflowConfig(undefined, project.workflow_template_id)
  const templateStages = templateStagesData || []
  
  const currentStage = project.current_stage_id 
    ? templateStages.find((s: any) => s.id === project.current_stage_id)
    : templateStages.find((s: any) => isStatusEquivalent(s.status_key, project.status)) || templateStages[0] || null
    
  const currentStageIndex = templateStages.findIndex((s: any) => s.id === currentStage?.id)
  const currentStageData = project.stage_data?.[currentStage?.id]?.data || {}
  
  const stagesProgress = project.stage_data ? Object.keys(project.stage_data) : []
  const progressPercentage = templateStages.length > 0 ? (Math.max(0, currentStageIndex + 1) / templateStages.length) * 100 : 0

  const isManager = user.profile.role === 'Manager'
  const isAdmin = user.profile.role === 'Admin'
  const isAssigned = user.id === project.current_assignee_id
  const isCorrectRole = user.profile.role === currentStage?.acting_role

  // Manager/Admin can always action. Others only if assigned or correctly role-matched if project is held by a manager or unassigned.
  const currentAssigneeRole = staff?.find(s => s.id === project.current_assignee_id)?.role
  const isHeldByManager = currentAssigneeRole === 'Manager' || currentAssigneeRole === 'Admin'

  const canAction = isManager || isAdmin || isAssigned || (isCorrectRole && (!project.current_assignee_id || isHeldByManager))

  const { data: allProjects } = await getProjectsMinimal()

  const canAssign = user.profile.role === 'Manager' || user.profile.role === 'Admin'
  // Strict restrictions for managers/admin
  const canManagePayments = user.profile.role === 'Admin' || user.profile.role === 'Manager'

  const totalPaid = project.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const balance = project.budget - totalPaid

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 pb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl h-12 w-12 transition-all border border-zinc-100 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                {project.client_name}
              </h1>
              <Badge variant="outline" className={cn(
                "rounded-lg font-bold text-[10px] px-2 py-0.5 border-none uppercase tracking-tight bg-zinc-100 text-zinc-600"
              )}>
                {currentStage?.display_name || project.status.replace(/_/g, ' ')}
              </Badge>
              {project.current_assignee_id ? (
                <div className="flex items-center gap-1.5 ml-2 border border-zinc-200 rounded-lg px-2 py-0.5 bg-white shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Owner: {staff?.find(s => s.id === project.current_assignee_id)?.full_name || 'Active'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-2 border border-amber-200 rounded-lg px-2 py-0.5 bg-amber-50 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Unassigned</span>
                  {(isAdmin || isManager || isCorrectRole) && (
                    <form action={selfAssignProject.bind(null, project.id)} className="ml-2">
                      <PendingButton type="submit" variant="outline" className="h-7 px-3 text-[9px] font-black uppercase tracking-tighter border-amber-200 text-amber-700 bg-white hover:bg-amber-100 rounded-lg transition-all">
                        Self-Assign
                      </PendingButton>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border-b border-zinc-200 p-0 rounded-none h-auto mb-8 w-full justify-start gap-8 flex-wrap">
          {['overview', 'workflow', 'generator', 'finances', 'comments'].map((tab) => {
            if (tab === 'finances' && !canManagePayments) return null
            return (
              <TabsTrigger key={tab} value={tab} className="rounded-none bg-transparent px-0 py-3 text-sm font-bold border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 text-zinc-400 transition-all uppercase tracking-wider mb-2 lg:mb-0">
                {tab === 'generator' ? 'Studio' : tab}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col gap-8 max-w-5xl">
            <div className="space-y-8">
              <Card className="border border-zinc-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-10">
                  <form action={async (fd) => {
                    'use server'
                    const rawData = Object.fromEntries(fd.entries())
                    const stageData: Record<string, any> = {}
                    const dynPrefix = 'dyn_'
                    
                    Object.keys(rawData).forEach(key => {
                      if (key.startsWith(dynPrefix)) {
                        stageData[key.replace(dynPrefix, '')] = rawData[key]
                      }
                    })

                    const nextStatus = fd.get('status') as string
                    const nextAssignee = fd.get('current_assignee_id') as string
                    const note = fd.get('handoff_note') as string

                    await submitStageData(project.id, currentStage.id, stageData, nextStatus, nextAssignee, note)
                  }} className="space-y-6">
                    {canAction && ( 
                      <div className="flex flex-col gap-8 mb-10 overflow-hidden">
                        {/* Section 1: Workflow Logistics */}
                        <div className="w-full space-y-6 bg-white rounded-[2rem] p-10 border border-zinc-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-sm">
                                   <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Workflow Logistics</h3>
                             </div>
                             <Badge variant="outline" className="bg-zinc-950 text-white border-zinc-950 font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
                                Active: {currentStage?.display_name || project.status}
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

                        {/* Section 2: Studio & Production Tools */}
                        <div className="w-full space-y-6 bg-white border border-zinc-100 rounded-[2rem] p-10 shadow-sm relative flex flex-col justify-center overflow-hidden group/hub">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
                          <div className="flex items-center gap-3 mb-2 relative z-10">
                             <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                                <Sparkles className="w-5 h-5" />
                             </div>
                             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 leading-none relative top-0.5">Production Hub</h3>
                          </div>
                          <div className="p-1.5 border border-dashed border-zinc-100 rounded-2xl bg-zinc-50/30 relative z-10">
                            {user.profile.role?.toLowerCase() === 'developer' || isManager || isAdmin ? (
                              <ProjectGeneratorActions 
                                project={project}
                                websiteConfig={websiteConfig}
                              />
                            ) : (
                              <div className="py-8 text-center">
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] leading-relaxed px-4">Architect clearance required.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

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

                    {canAction && (
                        <div className="flex justify-end pt-6 border-t border-zinc-100">
                          <PendingButton type="submit" className="w-full md:w-auto h-10 md:h-12 px-6 md:px-8 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest hover:bg-zinc-800 shadow-xl transition-all active:scale-95 text-[10px] md:text-sm">
                            Approve & Handover
                          </PendingButton>
                        </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              
            </div>

  
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="bg-white border-2 border-zinc-950 text-zinc-900 rounded-2xl p-10 max-w-4xl mx-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-[2px] before:bg-zinc-100">
              {project.workflow_template?.workflow_stages?.map((step: any, i: number) => {
                const isCompleted = (project.stage_data && project.stage_data[step.id]) || project.status === step.status_key
                const isActive = project.status === step.status_key
                const isPending = !isCompleted && !isActive
                
                const audit = project.stage_data?.[step.id]
                const submitter = staff?.find(s => s.id === audit?.submitted_by)

                return (
                   <div key={i} className="relative flex items-start group">
                    <div className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full border-2 shrink-0 transition-all duration-300 z-10",
                      isActive ? "bg-zinc-950 border-zinc-950 text-white shadow-lg scale-110" :
                        isCompleted ? "bg-white border-zinc-950 text-zinc-950 shadow-sm" :
                          "bg-white border-zinc-100 text-zinc-300"
                    )}>
                      {isCompleted && !isActive ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Settings className="w-6 h-6" />}
                    </div>
                    <div className="ml-10 pt-2 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={cn("text-sm font-black uppercase tracking-widest transition-colors", isPending ? "text-zinc-400" : "text-zinc-950")}>{step.display_name}</h4>
                        <span className={cn("text-[9px] font-black px-3 py-1 rounded-xl border-2 tracking-widest uppercase",
                          isCompleted && !isActive ? "bg-zinc-50 border-zinc-100 text-zinc-400" :
                            isActive ? "bg-zinc-950 border-zinc-950 text-white" : "bg-transparent border-zinc-100 text-zinc-300"
                        )}>{step.acting_role}</span>
                      </div>
                      
                      {isCompleted && audit && (
                        <div className="space-y-6 mt-4">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 w-fit px-4 py-2 rounded-xl border-2 border-zinc-950/5">
                             <User className="w-3 h-3 text-zinc-400" />
                             <span className="text-zinc-600 font-black">{submitter?.full_name || 'System'}</span>
                             <span className="mx-2 opacity-20">•</span>
                             <Clock className="w-3 h-3 text-zinc-400" />
                             <span className="font-black text-zinc-500">{new Date(audit.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {audit.data && Object.keys(audit.data).length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group/data">
                              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/data:opacity-30 transition-opacity">
                                <FileText className="w-10 h-10 text-zinc-950" />
                              </div>
                              {Object.entries(audit.data).map(([key, value]) => (
                                <div key={key} className="space-y-2 relative z-10">
                                  <span className="text-[9px] text-zinc-400 font-black uppercase block tracking-widest truncate">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-xs text-zinc-950 font-black break-words leading-tight">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] text-zinc-500 font-bold leading-relaxed max-w-xl mt-3 tracking-tight">
                        {isActive ? `Currently being handled by ${step.acting_role}.` :
                          isCompleted ? `Phase verified and handoff completed.` : `Awaiting previous stages.`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Workflow History / Handoff Notes */}
            {project.comments?.filter((c: any) => c.content.includes('Handoff Note:') || c.content.includes('Workflow Changed:')).length > 0 && (
              <div className="mt-16 pt-10 border-t border-zinc-100">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 leading-none mb-1">Directional Logs</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recorded workflow changes</p>
                  </div>
                </div>
                
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2 before:w-[1px] before:bg-zinc-100">
                  {project.comments
                    .filter((c: any) => {
                      const isSystem = c.content.includes('Handoff Note:') || c.content.includes('Workflow Changed:')
                      if (!isSystem) return false
                      const content = c.content.replace('Handoff Note: ', '').replace('Workflow Changed: ', '').trim()
                      // Filter out legacy "Project X is ready for Y" dummy messages
                      const isDummy = content.includes('is ready for') && content.split(' ').length < 15
                      return content.length > 0 && !isDummy
                    })
                    .reverse()
                    .map((comment: any) => (
                      <div key={comment.id} className="relative pl-10 group">
                        <div className="absolute left-0 top-2.5 w-4 h-4 bg-white border-2 border-zinc-100 rounded-full z-10 group-hover:border-zinc-900 transition-colors duration-300" />
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {new Date(comment.created_at).toLocaleDateString('en-GB')}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <Badge variant="outline" className="bg-zinc-50/50 border-zinc-100 text-[8px] font-black text-zinc-400 uppercase tracking-widest rounded-lg py-0.5 px-2 h-5">
                            System Event
                          </Badge>
                        </div>
                        <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                          <p className="text-xs font-bold text-zinc-800 leading-relaxed tracking-tight">
                            {comment.content.replace('Handoff Note: ', '').replace('Workflow Changed: ', '')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {canManagePayments && (
          <TabsContent value="finances" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PaymentForm projectId={project.id} payments={project.payments || []} />
          </TabsContent>
        )}

        {(isManager || isAdmin || user.profile.role === 'Developer') && (
          <TabsContent value="generator" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <WebsiteBuilderConfigurator
              projectId={project.id}
              initialConfig={websiteConfig}
              project={project}
            />
          </TabsContent>
        )}

        <TabsContent value="comments" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
  )
}
