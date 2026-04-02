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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-8">
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
          {['overview', 'workflow', 'finances', 'comments'].map((tab) => {
            if (tab === 'finances' && !canManagePayments) return null
            return (
              <TabsTrigger key={tab} value={tab} className="rounded-none bg-transparent px-0 py-3 text-sm font-bold border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 text-zinc-400 transition-all uppercase tracking-wider mb-2 lg:mb-0">
                {tab}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-zinc-200 shadow-sm rounded-[2rem] overflow-hidden">
              
                    <CardContent className="p-8">
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
                  }} className="space-y-4">
                    {canAction && ( 
                      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-100 shadow-inner">
                        
                        <HandoffOverride 
                          project={project}
                          templateStages={templateStages}
                          currentStageIndex={currentStageIndex}
                          staff={staff || []}
                          isManager={isManager}
                        />
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

                    {user.profile.role === 'Developer' && (
                      <ProjectGeneratorActions 
                        project={project}
                        websiteConfig={websiteConfig}
                      />
                    )}

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

              <hr className="border-zinc-200 my-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl shadow-sm">
                  <CardHeader className="py-4 px-6 border-b border-zinc-100">
                    <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Budget</span>
                      <span className="font-bold text-lg text-zinc-900">₹{project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-zinc-50">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Domain Scope</span>
                      <span className="font-bold text-zinc-700 text-xs tracking-tight">{project.domain_required ? "Full Fulfillment" : "Proxy/Client Link"}</span>
                    </div>
                    {project.existing_domain && (
                      <div className="flex flex-col gap-1.5 pt-3 border-t border-zinc-50">
                        <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest">Target Domain</span>
                        <span className="text-zinc-900 font-bold text-xs break-all">{project.existing_domain}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl shadow-sm">
                  <CardHeader className="py-4 px-6 border-b border-zinc-100">
                    <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aesthetic Direction</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Client Brief</span>
                      <p className="text-xs font-bold text-zinc-800 leading-snug tracking-tight">{project.design_preferences || "No specific brief provided."}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Primary Tone</span>
                      <Badge variant="outline" className="border-none text-blue-700 font-bold px-3 py-1 rounded-lg text-[10px] bg-blue-50 uppercase tracking-tight">
                        {project.color_scheme || "Neutral"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
                <CardHeader className="py-4 px-6 bg-zinc-50/50 border-b border-zinc-100">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Lifecycle Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Current Status</span>
                      <span className="font-bold text-lg text-zinc-900 block">{currentStage?.display_name || project.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 transition-all duration-700 ease-in-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                    {currentStage?.display_name ? `Currently in ${currentStage.display_name} phase. Assigned to ${currentStage.acting_role}.` : "Project status pending."}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
                <CardHeader className="py-4 px-6 bg-zinc-50/50 border-b border-zinc-100">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-zinc-400 font-bold uppercase tracking-tighter">Settled Amount</span>
                    <span className="font-bold text-zinc-900">₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-zinc-300 font-medium">/ ₹{project.budget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${(totalPaid / project.budget) * 100}%` }}
                    />
                  </div>
                  {balance > 0 && (
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 uppercase tracking-tight">
                      <span>Outstanding</span>
                      <span className="text-zinc-900">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}


                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl p-10 max-w-4xl mx-auto shadow-sm">
            <div className="space-y-10 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-[2px] before:bg-zinc-100">
              {project.workflow_template?.workflow_stages?.map((step: any, i: number) => {
                const isCompleted = (project.stage_data && project.stage_data[step.id]) || project.status === step.status_key
                const isActive = project.status === step.status_key
                const isPending = !isCompleted && !isActive
                
                const audit = project.stage_data?.[step.id]
                const submitter = staff?.find(s => s.id === audit?.submitted_by)

                return (
                  <div key={i} className="relative flex items-start group">
                    <div className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full border shrink-0 transition-all duration-300 z-10",
                      isActive ? "bg-zinc-900 border-zinc-900 text-white shadow-lg scale-110" :
                        isCompleted ? "bg-white border-zinc-200 text-zinc-900 shadow-sm" :
                          "bg-white border-zinc-100 text-zinc-300"
                    )}>
                      {isCompleted && !isActive ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Settings className="w-6 h-6" />}
                    </div>
                    <div className="ml-10 pt-2 flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className={cn("text-sm font-bold tracking-tight transition-colors", isPending ? "text-zinc-400" : "text-zinc-900")}>{step.display_name}</h4>
                        <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded-lg border tracking-widest uppercase",
                          isCompleted && !isActive ? "bg-zinc-50 border-zinc-100 text-zinc-500" :
                            isActive ? "bg-zinc-900 border-zinc-900 text-white" : "bg-transparent border-zinc-100 text-zinc-300"
                        )}>{step.acting_role}</span>
                      </div>
                      
                      {isCompleted && audit && (
                        <div className="space-y-4 mt-3">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 w-fit px-3 py-1.5 rounded-lg border border-zinc-100">
                             <User className="w-3 h-3 text-zinc-400" />
                             <span className="text-zinc-600 font-bold">{submitter?.full_name || 'System'}</span>
                             <span className="mx-1 opacity-20">•</span>
                             <Clock className="w-3 h-3 text-zinc-400" />
                             <span className="font-bold">{new Date(audit.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {audit.data && Object.keys(audit.data).length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-zinc-100 shadow-sm relative overflow-hidden group/data">
                              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/data:opacity-30 transition-opacity">
                                <FileText className="w-8 h-8 text-zinc-900" />
                              </div>
                              {Object.entries(audit.data).map(([key, value]) => (
                                <div key={key} className="space-y-1 relative z-10">
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-tighter truncate">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-xs text-zinc-900 font-bold break-words">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">
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
