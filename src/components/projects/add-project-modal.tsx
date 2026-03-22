'use client'

import { createProject } from '@/app/dashboard/projects/actions'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Card,
  CardContent,
  CardHeader as CardUiHeader,
  CardTitle as CardUiTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Briefcase, PlusCircle, UserCircle, LayoutTemplate, Workflow, Link as LinkIcon, Loader2, Clock } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

interface AddProjectModalProps {
  staff?: any[]
}

export function AddProjectModal({ staff = [] }: AddProjectModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isSubmittingRef = useRef(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [dynamicFields, setDynamicFields] = useState<any[]>([])
  const [stages, setStages] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchTemplates()
      
      // Restore from localStorage
      const draft = localStorage.getItem('add_project_form_draft')
      const dynamicDraft = localStorage.getItem(`add_project_dyn_draft_${selectedTemplateId}`)
      
      if (draft || dynamicDraft) {
        try {
          const data = draft ? JSON.parse(draft) : {}
          const dynData = dynamicDraft ? JSON.parse(dynamicDraft) : {}
          const combined = { ...data, ...dynData }

          setTimeout(() => {
            const form = document.getElementById('add-project-form') as HTMLFormElement
            if (form) {
              Object.entries(combined).forEach(([key, value]) => {
                const element = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                if (element && value) {
                  element.value = value as string
                }
              })
            }
          }, 200)
        } catch (e) {
          console.error('Failed to restore draft', e)
        }
      }
    }
  }, [open, selectedTemplateId])

  useEffect(() => {
    if (selectedTemplateId) {
      fetchWorkflowConfig(selectedTemplateId)
    }
  }, [selectedTemplateId])

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Workflow templates not found, check if table exists')
      return
    }

    if (data && data.length > 0) {
      setTemplates(data)
      if (!selectedTemplateId) {
        setSelectedTemplateId(data[0].id)
      }
    }
  }

  async function fetchWorkflowConfig(templateId: string) {
    const { data: stagesData } = await supabase
      .from('workflow_stages')
      .select('*, workflow_fields(*)')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true })
    
    if (stagesData) {
      setStages(stagesData)
      const initialStage = stagesData.find(s => s.is_initial) || stagesData[0]
      if (initialStage) {
        setDynamicFields(initialStage.workflow_fields || [])
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)} type="button" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold gap-2 px-6 py-4 transition-all flex items-center text-[13px] shadow-sm mt-3 md:mt-0">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add project
      </button>
      <SheetContent side="right" className="w-[90vw] sm:max-w-3xl overflow-hidden flex flex-col p-0 border-l border-zinc-200">
        <SheetHeader className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            New Client Project
          </SheetTitle>
          <SheetDescription className="text-zinc-500 font-medium">
            Fill in the details below to initiate a new project workflow and assign the initial team.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-zinc-50/30 p-8">
          <form 
            autoComplete="off"
            id="add-project-form"
            onChange={(e) => {
              const formData = new FormData(e.currentTarget)
              const data: any = {}
              const dynData: any = {}
              formData.forEach((value, key) => {
                if (key.startsWith('dyn_')) {
                  dynData[key] = value
                } else {
                  data[key] = value
                }
              })
              localStorage.setItem('add_project_form_draft', JSON.stringify(data))
              if (selectedTemplateId) {
                localStorage.setItem(`add_project_dyn_draft_${selectedTemplateId}`, JSON.stringify(dynData))
              }
            }}
            action={async (formData) => {
              if (isSubmittingRef.current) return
              isSubmittingRef.current = true
              setIsPending(true)
              try {
                const result = await createProject(formData)
                if (result.success) {
                  localStorage.removeItem('add_project_form_draft')
                  localStorage.removeItem('add_project_draft')
                  localStorage.removeItem('project_draft')
                  if (selectedTemplateId) {
                    localStorage.removeItem(`add_project_dyn_draft_${selectedTemplateId}`)
                  }
                  setOpen(false)
                  router.push(`/dashboard/projects/${result.id}`)
                }
              } catch (error) {
                console.error(error)
              } finally {
                setIsPending(false)
                isSubmittingRef.current = false
              }
            }} 
            className="space-y-6 pb-20"
          >
            {/* Client Section */}
            <Card className="bg-white border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
              <CardUiHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center gap-2">
                <UserCircle className="w-4 h-4 text-zinc-400" />
                <CardUiTitle className="text-sm font-bold text-zinc-900 tracking-tight">Client Contact</CardUiTitle>
              </CardUiHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="client_name" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Client Name</Label>
                  <Input id="client_name" name="client_name" placeholder="ABC Corp" required className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-bold text-zinc-900 focus:ring-zinc-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Client Email</Label>
                  <Input id="client_email" name="client_email" type="email" placeholder="contact@abc.com" required className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium text-zinc-900 focus:ring-zinc-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Phone</Label>
                  <Input id="client_phone" name="client_phone" placeholder="+91 00000 00000" className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium text-zinc-900 focus:ring-zinc-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_type" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Client Type</Label>
                  <select id="client_type" name="client_type" className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-200 appearance-none shadow-sm cursor-pointer">
                    <option value="owner">Owner</option>
                    <option value="employee">Employee</option>
                    <option value="referral">Referral</option>
                    <option value="external">External</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_comm_channel" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Comm Channel</Label>
                  <Input id="preferred_comm_channel" name="preferred_comm_channel" placeholder="Email / WhatsApp / Telegram" className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium text-zinc-900 focus:ring-zinc-200" />
                </div>
              </CardContent>
            </Card>

            {/* Scope & Budget */}
            <Card className="bg-white border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
              <CardUiHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-zinc-400" />
                <CardUiTitle className="text-sm font-bold text-zinc-900 tracking-tight">Scope & Budget</CardUiTitle>
              </CardUiHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Project Brief</Label>
                  <Textarea id="description" name="description" placeholder="Summarize the core goals..." className="min-h-[100px] bg-zinc-50 border-zinc-200 rounded-xl text-sm p-4 font-medium text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Budget (₹)</Label>
                  <Input id="budget" name="budget" type="number" step="1" placeholder="50000" className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-bold text-zinc-900 text-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Deadlines per State */}
            <Card className="bg-white border-zinc-200 shadow-sm rounded-2xl overflow-hidden border-blue-100 bg-blue-50/10">
              <CardUiHeader className="bg-blue-50/50 border-b border-blue-100 py-4 px-6 flex flex-row items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <CardUiTitle className="text-sm font-bold text-zinc-900 tracking-tight">Phase Deadlines</CardUiTitle>
              </CardUiHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="discovery_deadline" className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Discovery Baseline</Label>
                  <Input id="discovery_deadline" name="discovery_deadline" type="date" className="h-11 bg-white border-zinc-200 rounded-xl font-medium text-zinc-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_deadline" className="text-[11px] font-bold uppercase tracking-wider text-purple-400">SEO Strategy Target</Label>
                  <Input id="seo_deadline" name="seo_deadline" type="date" className="h-11 bg-white border-zinc-200 rounded-xl font-medium text-zinc-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dev_deadline" className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Dev Prototype Ready</Label>
                  <Input id="dev_deadline" name="dev_deadline" type="date" className="h-11 bg-white border-zinc-200 rounded-xl font-medium text-zinc-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qa_deadline" className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Internal Review (QA)</Label>
                  <Input id="qa_deadline" name="qa_deadline" type="date" className="h-11 bg-white border-zinc-200 rounded-xl font-medium text-zinc-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Final Client Delivery</Label>
                  <Input id="deadline" name="deadline" type="date" className="h-11 bg-white border-zinc-200 rounded-xl font-medium text-zinc-900" />
                </div>
              </CardContent>
            </Card>

            {/* Workflow Control */}
            <Card className="bg-white border-zinc-200 shadow-sm rounded-2xl overflow-hidden relative overflow-visible">
              <CardUiHeader className="bg-rose-50/50 border-b border-rose-100 py-4 px-6 flex flex-row items-center gap-2">
                <Workflow className="w-4 h-4 text-rose-400" />
                <CardUiTitle className="text-sm font-bold text-zinc-900 tracking-tight">Workflow Strategy</CardUiTitle>
              </CardUiHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-5 z-10 relative">
                <div className="space-y-2">
                  <Label htmlFor="workflow_template_id" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Workflow Blueprint</Label>
                  <select 
                    id="workflow_template_id" 
                    name="workflow_template_id" 
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-900 appearance-none shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  >
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Initial Phase</Label>
                  <input type="hidden" name="status" value={stages.find(s => s.is_initial)?.status_key || (stages[0]?.status_key || '')} />
                  <select 
                    id="status_display" 
                    name="status_display" 
                    value={stages.find((s: any) => s.is_initial)?.status_key || (stages[0]?.status_key || '')} 
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm font-bold text-zinc-400 appearance-none shadow-sm cursor-not-allowed outline-none"
                    disabled
                  >
                    {stages.length > 0 ? (
                      stages.map((s: any) => (
                        <option key={s.status_key} value={s.status_key}>{s.display_name}</option>
                      ))
                    ) : (
                      <option value="NEW_LEAD">Lead Discovery</option>
                    )}
                  </select>
                </div>
                
                {/* Dynamic Fields for Initial Stage */}
                {dynamicFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`dyn_${field.name}`} className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      {field.label} {field.is_required && <span className="text-red-500">*</span>}
                    </Label>
                    {field.field_type === 'textarea' ? (
                      <Textarea id={`dyn_${field.name}`} name={`dyn_${field.name}`} required={field.is_required} placeholder={field.placeholder} className="min-h-[80px] bg-zinc-50 border-zinc-200 rounded-xl text-sm p-4 font-medium" />
                    ) : field.field_type === 'select' ? (
                      <select id={`dyn_${field.name}`} name={`dyn_${field.name}`} required={field.is_required} className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium">
                        {(field.options as string[] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <Input id={`dyn_${field.name}`} name={`dyn_${field.name}`} type={field.field_type} required={field.is_required} placeholder={field.placeholder} className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium" />
                    )}
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="current_assignee_id" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Initial Owner</Label>
                  <select id="current_assignee_id" name="current_assignee_id" defaultValue="" className="flex h-11 w-full rounded-xl border border-rose-200 bg-rose-50/30 px-3 py-2 text-sm font-bold text-rose-900 appearance-none shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-rose-200 transition-all">
                    <option value="">Unassigned</option>
                    {staff.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* URL/DNS Configuration */}
            <Card className="bg-white border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
              <CardUiHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center gap-2">
                <LinkIcon className="w-4 h-4 text-zinc-400" />
                <CardUiTitle className="text-sm font-bold text-zinc-900 tracking-tight">Connections</CardUiTitle>
              </CardUiHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center space-x-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <Checkbox id="domain_required" name="domain_required" className="h-5 w-5 rounded border-zinc-300 data-[state=checked]:bg-zinc-900 shadow-sm transition-all" />
                  <Label htmlFor="domain_required" className="cursor-pointer text-sm font-bold text-zinc-700 tracking-tight">Requires Top-Level Domain (TLD) procurement?</Label>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="existing_domain" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Current Domain</Label>
                    <Input id="existing_domain" name="existing_domain" placeholder="example.com" className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium text-zinc-900" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference_websites" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Reference Links (Commma Separated)</Label>
                    <Input id="reference_websites" name="reference_websites" placeholder="url1.com, url2.com" className="h-11 bg-zinc-50 border-zinc-200 rounded-xl font-medium text-zinc-900" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Actions Pin */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-6 flex justify-end gap-3 z-20">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-12 px-6 font-bold shadow-sm border-zinc-200">
                Cancel
              </Button>
              <PendingButton loading={isPending} type="submit" className="rounded-xl h-12 px-8 font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 flex items-center gap-2">
                Initialize Project Database
              </PendingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
