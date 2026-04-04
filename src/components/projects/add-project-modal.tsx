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
import { Briefcase, PlusCircle, UserCircle, LayoutTemplate, Workflow, Link as LinkIcon, Loader2, Globe, Palette, Sparkles, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { Separator } from '@/components/ui/separator'
import { WorkflowForm } from '@/components/workflow/workflow-form'
import staticQuestions from '@/utils/builder/static-questions.json'

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
  const [formDraft, setFormDraft] = useState<any>({})
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchTemplates()
      
      // Restore from localStorage
      const draft = localStorage.getItem('add_project_form_draft')
      if (draft) {
        try {
          const data = JSON.parse(draft)
          setFormDraft(data)
        } catch (e) {
          console.error('Failed to restore draft', e)
        }
      }
    }
  }, [open])

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
      if (!selectedTemplateId || data.length === 1) {
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
      <SheetContent side="right" className="!w-full sm:!min-w-[60vw] lg:!min-w-[50vw] overflow-hidden flex flex-col p-0 border-l border-zinc-200">
        <SheetHeader className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            New Client Project
          </SheetTitle>
          <SheetDescription className="text-zinc-500 font-medium">
            Select a workflow and fill in the required details to initialize the project.
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
            className="space-y-6 pb-24"
          >
            {/* Workflow Selection - Always Top */}
            <div className="space-y-2 px-1">
              <Label htmlFor="workflow_template_id" className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Workflow Blueprint</Label>
              <select 
                id="workflow_template_id" 
                name="workflow_template_id" 
                value={selectedTemplateId || ''}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                required
                className="flex h-14 w-full rounded-none border border-zinc-200 bg-white px-6 py-2 text-base font-black text-zinc-900 appearance-none shadow-sm cursor-pointer outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all"
              >
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {selectedTemplateId && (() => {
              return (
                <div className="space-y-6">
                  {/* Common Client Information - Always Top */}
                  <Card className="bg-white border-zinc-100 shadow-sm rounded-[2.5rem] overflow-hidden border">
                    <CardUiHeader className="bg-zinc-50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-zinc-900" />
                        <CardUiTitle className="text-sm font-black text-zinc-900 tracking-tight uppercase">Client Core Data</CardUiTitle>
                      </div>
                      <span className="text-[10px] font-black bg-zinc-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">Global</span>
                    </CardUiHeader>
                    <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="client_name" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Client Name</Label>
                        <Input id="client_name" name="client_name" placeholder="ABC Corp" defaultValue={formDraft.client_name || ''} required className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="client_email" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Client Email</Label>
                        <Input id="client_email" name="client_email" type="email" placeholder="contact@abc.com" defaultValue={formDraft.client_email || ''} required className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="client_phone" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Phone Number</Label>
                        <Input id="client_phone" name="client_phone" placeholder="+91..." defaultValue={formDraft.client_phone || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="client_type" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Client Category</Label>
                        <select id="client_type" name="client_type" defaultValue={formDraft.client_type || 'owner'} className="flex h-14 w-full rounded-none border border-zinc-200 bg-white px-6 text-[14px] font-bold appearance-none shadow-none cursor-pointer outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all">
                          <option value="owner">Owner</option>
                          <option value="employee">Employee</option>
                          <option value="referral">Referral</option>
                          <option value="external">External</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* New: Business Profile & Marketing Assets */}
                  <Card className="bg-white border-zinc-100 shadow-sm rounded-[2.5rem] overflow-hidden border">
                    <CardUiHeader className="bg-zinc-50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-zinc-900" />
                        <CardUiTitle className="text-sm font-black text-zinc-900 tracking-tight uppercase">Business Profile & Strategy</CardUiTitle>
                      </div>
                    </CardUiHeader>
                    <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="brand_voice" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Brand Voice</Label>
                        <select id="brand_voice" name="brand_voice" defaultValue={formDraft.brand_voice || 'Formal'} className="flex h-14 w-full rounded-none border border-zinc-200 bg-white px-6 text-[14px] font-bold appearance-none shadow-none cursor-pointer outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all">
                          <option value="Formal">Formal</option>
                          <option value="Playful">Playful</option>
                          <option value="Techy">Techy</option>
                          <option value="Luxurious">Luxurious</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="founding_year" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Founding Year</Label>
                        <Input id="founding_year" name="founding_year" type="number" placeholder="2010" defaultValue={formDraft.founding_year || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="primary_cta_text" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Primary CTA Text</Label>
                        <Input id="primary_cta_text" name="primary_cta_text" placeholder="Book Appointment" defaultValue={formDraft.primary_cta_text || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="primary_cta_link" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Primary CTA Link</Label>
                        <Input id="primary_cta_link" name="primary_cta_link" placeholder="/contact" defaultValue={formDraft.primary_cta_link || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="primary_color" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Primary Brand Color</Label>
                        <div className="flex gap-2">
                          <Input id="primary_color" name="primary_color" type="text" placeholder="#000000" defaultValue={formDraft.primary_color || '#000000'} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                          <div className="w-14 h-14 rounded-none border border-zinc-200 shrink-0 shadow-inner" style={{ backgroundColor: formDraft.primary_color || '#000000' }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="accent_color" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Accent Brand Color</Label>
                        <div className="flex gap-2">
                          <Input id="accent_color" name="accent_color" type="text" placeholder="#3b82f6" defaultValue={formDraft.accent_color || '#3b82f6'} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                          <div className="w-14 h-14 rounded-none border border-zinc-200 shrink-0 shadow-inner" style={{ backgroundColor: formDraft.accent_color || '#3b82f6' }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 md:col-span-2">
                        <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Detailed Business Mission</Label>
                        <Textarea id="description" name="description" placeholder="A brief description of the primary service offering..." defaultValue={formDraft.description || ''} className="min-h-[140px] bg-white border border-zinc-200 rounded-none p-6 font-medium text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all outline-none resize-none shadow-none" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* New: Brand & Technical Readiness */}
                  <Card className="bg-white border-zinc-100 shadow-sm rounded-[2.5rem] overflow-hidden border">
                    <CardUiHeader className="bg-zinc-50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-zinc-900" />
                        <CardUiTitle className="text-sm font-black text-zinc-900 tracking-tight uppercase">Identity & Compliance</CardUiTitle>
                      </div>
                    </CardUiHeader>
                    <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="logo_main" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Main Logo URL</Label>
                        <Input id="logo_main" name="logo_main" placeholder="/logo.png" defaultValue={formDraft.logo_main || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="github_link" className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-500 ml-1">GitHub Repository URL</Label>
                        <Input id="github_link" name="github_link" placeholder="https://github.com/..." defaultValue={formDraft.github_link || ''} className="h-14 bg-blue-50/30 border border-blue-200 rounded-none px-6 font-bold text-blue-900 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="target_keywords" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Primary Target Keywords</Label>
                        <Input id="target_keywords" name="target_keywords" placeholder="physiotherapist near me, ..." defaultValue={formDraft.target_keywords || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="meta_description" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">SEO Meta Description</Label>
                        <Input id="meta_description" name="meta_description" placeholder="Optimized description..." defaultValue={formDraft.meta_description || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="google_analytics_id" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Google Analytics ID</Label>
                        <Input id="google_analytics_id" name="google_analytics_id" placeholder="G-XXXXXXXX" defaultValue={formDraft.google_analytics_id || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="privacy_policy_url" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Privacy Policy URL</Label>
                        <Input id="privacy_policy_url" name="privacy_policy_url" placeholder="/privacy" defaultValue={formDraft.privacy_policy_url || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3 md:col-span-2">
                        <Label htmlFor="footer_copy" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Footer Copyright</Label>
                        <Input id="footer_copy" name="footer_copy" placeholder="© 2026 InterCert Inc." defaultValue={formDraft.footer_copy || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* New: Operations & Networking */}
                  <Card className="bg-white border-zinc-100 shadow-sm rounded-[2.5rem] overflow-hidden border">
                    <CardUiHeader className="bg-zinc-50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-zinc-900" />
                        <CardUiTitle className="text-sm font-black text-zinc-900 tracking-tight uppercase">Operations & Network</CardUiTitle>
                      </div>
                    </CardUiHeader>
                    <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="opening_hours" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Opening Hours (JSON)</Label>
                        <Input id="opening_hours" name="opening_hours" placeholder='{ "Mon-Fri": "9am-6pm" }' defaultValue={formDraft.opening_hours || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="appointment_type" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Appt Protocol</Label>
                        <select id="appointment_type" name="appointment_type" defaultValue={formDraft.appointment_type || 'Calendly'} className="flex h-14 w-full rounded-none border border-zinc-200 bg-white px-6 text-[14px] font-bold appearance-none shadow-none cursor-pointer outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all">
                          <option value="Calendly">Calendly</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Custom Form">Custom Form</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-3 md:col-span-2">
                        <Label htmlFor="social_links" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Social Links (JSON)</Label>
                        <Input id="social_links" name="social_links" placeholder='{ "instagram": "...", "facebook": "..." }' defaultValue={formDraft.social_links || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3 md:col-span-2">
                        <Label htmlFor="maps_embed" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Google Maps Embed code</Label>
                        <Textarea id="maps_embed" name="maps_embed" placeholder="<iframe ...></iframe>" defaultValue={formDraft.maps_embed || ''} className="min-h-[140px] bg-white border border-zinc-200 rounded-none p-6 font-medium text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all outline-none resize-none shadow-none" />
                      </div>
                    </CardContent>
                  </Card>

                  <WorkflowForm 
                    workflowId={selectedTemplateId} 
                    prefix="dyn_"
                    initialData={(() => {
                      const draft = localStorage.getItem('add_project_form_draft')
                      const dynamicDraft = localStorage.getItem(`add_project_dyn_draft_${selectedTemplateId}`)
                      try {
                        const data = draft ? JSON.parse(draft) : {}
                        const dynData = dynamicDraft ? JSON.parse(dynamicDraft) : {}
                        const normalizedDyn: Record<string, any> = {}
                        Object.entries(dynData).forEach(([k, v]) => {
                          normalizedDyn[k.replace('dyn_', '')] = v
                        })
                        return { ...data, ...normalizedDyn }
                      } catch(e) { return {} }
                    })()}
                  />

                  {/* Financials & Handoff - Always Content Bottom */}
                  <Card className="bg-white border-zinc-100 shadow-sm rounded-[2.5rem] overflow-hidden border-dashed border">
                    <CardUiHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4 px-6 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                        <CardUiTitle className="text-sm font-black text-zinc-900 tracking-tight uppercase">Project Handoff</CardUiTitle>
                      </div>
                      <span className="text-[10px] font-black bg-zinc-100 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-widest">Final Step</span>
                    </CardUiHeader>
                    <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="deadline" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Target Deadline</Label>
                        <Input id="deadline" name="deadline" type="date" defaultValue={formDraft.deadline || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="budget" className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Total Budget (₹)</Label>
                        <Input id="budget" name="budget" type="number" placeholder="50000" defaultValue={formDraft.budget || ''} className="h-14 bg-white border border-zinc-200 rounded-none px-6 font-black text-zinc-900 focus:ring-4 focus:ring-zinc-950/5 transition-all shadow-none" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            {/* Floating Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-zinc-200 p-6 flex justify-end gap-5 z-20">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl h-12 px-6 font-bold text-zinc-500 hover:text-zinc-900 transition-all">
                Cancel
              </Button>
              <PendingButton loading={isPending} type="submit" className="rounded-2xl h-12 px-10 font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-2xl shadow-zinc-900/20 flex items-center gap-2 transition-all scale-105 active:scale-95">
                Initialize Project Build
              </PendingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
