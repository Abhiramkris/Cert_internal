import { getProjectDetail, getUserProfile, getStaff, getProjectsMinimal, getWorkflowConfig } from '@/utils/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Users, FileText, Code, CheckCircle, MessageSquare, Globe, Search, IndianRupee, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AssignmentForm } from './assignment-form'
import { PaymentForm } from './payment-form'
import { RealtimeComments } from './realtime-comments'
import { DeadlineEditor } from './deadline-editor'
import { DynamicStageForm } from '@/components/projects/dynamic-stage-form'
import { finalizeProject } from '../actions'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const user = await getUserProfile()
  const { data: project } = await getProjectDetail(id)
  const { data: staff } = await getStaff()

  if (!user || !project) return <div className="p-8 text-zinc-400">Project not found</div>

  const { data: workflowStages } = await getWorkflowConfig(project.status, project.workflow_template_id)
  const currentStage = workflowStages?.[0] || null
  const currentStageData = project.project_stage_data?.find((d: any) => d.stage_id === currentStage?.id)?.data || {}

  const isManager = user.profile.role === 'Manager'
  const isAdmin = user.profile.role === 'Admin'
  const isAssigned = user.id === project.current_assignee_id
  const isCorrectRole = user.profile.role === currentStage?.acting_role

  // Manager can always action. Others only if assigned or correctly role-matched without assignee.
  const canAction = isManager || isAssigned || (isCorrectRole && !project.current_assignee_id && !isAdmin)

  const stagesProgress = project.project_stage_data?.map((d: any) => d.workflow_stages?.status_key) || []
  const templateStages = project.workflow_templates?.workflow_stages || []
  const currentStageIndex = templateStages.findIndex((s: any) => s.status_key === project.status)
  const progressPercentage = templateStages.length > 0 ? ((currentStageIndex + 1) / templateStages.length) * 100 : 0

  const { data: allProjects } = await getProjectsMinimal()

  const canAssign = user.profile.role === 'Manager' || user.profile.role === 'HR' || user.profile.role === 'Admin'
  
  // Strict restrictions for managers
  const canManagePayments = user.profile.role === 'HR' || user.profile.role === 'Admin' || user.profile.role === 'Manager'

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
                "rounded-lg font-bold text-[10px] px-2 py-0.5 border-none uppercase tracking-tight",
                project.status === 'NEW_LEAD' ? "bg-orange-100 text-orange-700" :
                project.status === 'TEAM_ASSIGNED' ? "bg-blue-100 text-blue-700" :
                project.status === 'SEO_COMPLETED' ? "bg-purple-100 text-purple-700" :
                project.status === 'DEV_PREVIEW_READY' ? "bg-indigo-100 text-indigo-700" :
                project.status === 'MANAGER_APPROVED' ? "bg-emerald-100 text-emerald-700" :
                "bg-zinc-100 text-zinc-600"
              )}>
                {project.status.replace(/_/g, ' ')}
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
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                    Unassigned
                  </span>
                  {/* Quick Assign Stub */}
                  {(user.profile.role === 'Admin' || user.profile.role === 'Manager') && (
                    <form action={async () => {
                      'use server'
                      const { supabase } = await import('@/utils/supabase/server').then(m => ({ supabase: m.createClient() }))
                      const sb = await supabase
                      await sb.from('projects').update({ current_assignee_id: user.profile.id }).eq('id', project.id)
                      const { revalidatePath } = await import('next/cache')
                      revalidatePath(`/dashboard/projects/${project.id}`)
                    }}>
                        <PendingButton variant="ghost" className="text-[9px] bg-amber-200 text-amber-800 px-2 py-0.5 h-auto rounded ml-1 uppercase hover:bg-amber-300 transition">Self-Assign</PendingButton>
                    </form>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
              {project.client_email} <span className="mx-2 text-zinc-300">•</span> {project.client_phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 h-9 px-4 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </Button>
          <Link 
            href={`/review/${project.secure_token}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "bg-zinc-900 hover:bg-zinc-800 text-white h-9 px-6 text-xs font-bold uppercase tracking-wider shadow-sm transition-all")}
          >
            Live Preview
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-transparent border-b border-zinc-200 p-0 rounded-none h-auto mb-8 w-full justify-start gap-8 flex-wrap">
          {['overview', 'workflow', 'team', 'finances', 'comments'].map((tab) => {
            if (tab === 'finances' && !canManagePayments) return null
            return (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className="rounded-none bg-transparent px-0 py-3 text-sm font-bold border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 text-zinc-400 transition-all uppercase tracking-wider mb-2 lg:mb-0"
              >
                {tab}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
          {!canAction && project.status !== 'NEW_LEAD' && (
            <div className="absolute top-0 right-0 z-10 bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Wait for your phase to take action
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-zinc-100 bg-zinc-50/50">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Description</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-zinc-800 leading-relaxed text-lg font-medium">
                    {project.description || "No specific project details provided."}
                  </p>
                </CardContent>
              </Card>

                  <DynamicStageForm 
                    projectId={project.id} 
                    stage={currentStage} 
                    nextStage={templateStages[currentStageIndex + 1]}
                    staff={staff || []}
                    existingData={currentStageData}
                    userProfile={user.profile}
                    canAction={canAction}
                  />

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
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Stage</span>
                      <span className="font-bold text-sm text-zinc-900">{project.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Phase</span>
                      <span className="text-xl font-bold text-zinc-900">{currentStageIndex + 1}<span className="text-xs text-zinc-300 ml-1">/ {templateStages.length}</span></span>
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
                    <span className="font-bold text-zinc-900">₹{totalPaid.toLocaleString()} <span className="text-[10px] text-zinc-300 font-medium">/ ₹{project.budget.toLocaleString()}</span></span>
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
                      <span className="text-zinc-900">₹{balance.toLocaleString()}</span>
                    </div>
                  )}

                  {balance <= 0 && project.status !== 'CLIENT_APPROVED' && (isManager || isAdmin) && (
                    <form action={finalizeProject.bind(null, project.id)} className="mt-4">
                      <PendingButton 
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-[0.2em] h-11 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Fully Completed
                      </PendingButton>
                    </form>
                  )}
                </CardContent>
              </Card>

              {(isManager || isAdmin || (canAssign && project.status === 'NEW_LEAD')) && (
                <AssignmentForm 
                  projectId={project.id} 
                  team={project.project_team?.[0]} 
                  staff={staff || []}
                  currentStatus={project.status}
                  currentAssigneeId={project.current_assignee_id}
                  allStages={(templateStages as any[]).map(s => ({ status_key: s.status_key, display_name: s.display_name }))}
                  isManager={isManager || isAdmin}
                />
              )}

              {(isManager || isAdmin) && (
                <DeadlineEditor 
                  projectId={project.id}
                  deadlines={{
                    discovery_deadline: project.discovery_deadline,
                    seo_deadline: project.seo_deadline,
                    dev_deadline: project.dev_deadline,
                    qa_deadline: project.qa_deadline,
                    deadline: project.deadline
                  }}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl p-10 max-w-4xl mx-auto shadow-sm">
            <div className="space-y-10 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-[2px] before:bg-zinc-100">
              {project.workflow_template?.workflow_stages?.map((step: any, i: number) => {
                const isCompleted = stagesProgress.includes(step.status_key) || project.status === step.status_key
                const isActive = project.status === step.status_key
                const isPending = !isCompleted && !isActive

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
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">
                        {isActive ? `Currently being handled by ${step.acting_role}.` : 
                         isCompleted ? `Phase completed.` : `Awaiting previous stages.`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        {canManagePayments && (
          <TabsContent value="finances" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PaymentForm projectId={project.id} payments={project.payments || []} />
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

        <TabsContent value="team" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Account Manager', id: project.project_team?.[0]?.manager_id, label: 'AM' },
              { role: 'Creative Designer', id: project.project_team?.[0]?.designer_id, label: 'DSN' },
              { role: 'SEO Specialist', id: project.project_team?.[0]?.seo_id, label: 'SEO' },
              { role: 'Software Engineer', id: project.project_team?.[0]?.developer_id, label: 'SWE' },
            ].map((member, i) => {
              const staffMember = staff?.find(s => s.id === member.id)
              return (
                <Card key={i} className="bg-white border-zinc-200 p-8 flex flex-col items-center text-center shadow-sm group hover:border-zinc-300 transition-all duration-300">
                  <div className="w-20 h-20 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-900 mb-6 shadow-inner group-hover:bg-zinc-100 transition-colors">
                    {staffMember?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">{member.role}</div>
                  <h4 className="text-sm font-bold text-zinc-900 mb-5">{staffMember?.full_name || 'Unassigned'}</h4>
                  <div className="text-[9px] bg-zinc-50 text-zinc-500 px-4 py-1.5 rounded-lg border border-zinc-100 font-bold tracking-widest uppercase">
                    Ref // {member.label}
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
