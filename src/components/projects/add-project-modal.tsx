'use client'

import { createProject } from '@/app/dashboard/projects/actions'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
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
import { PlusCircle, ArrowRight, X, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { WorkflowForm } from '@/components/workflow/workflow-form'

interface AddProjectModalProps {
  staff?: any[]
}

export function AddProjectModal({ staff = [] }: AddProjectModalProps) {
  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isSubmittingRef = useRef(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [formDraft, setFormDraft] = useState<any>({})
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchTemplates()
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

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) return

    if (data && data.length > 0) {
      setTemplates(data)
      if (!selectedTemplateId || data.length === 1) {
        setSelectedTemplateId(data[0].id)
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button 
        onClick={() => setOpen(true)} 
        type="button" 
        style={{ fontFamily: mazzardFont }}
        className="h-11 bg-gradient-to-r from-[#67A708] to-[#B1F00B] text-black hover:opacity-90 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] px-8 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 border-none"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        New Project
      </button>

      <SheetContent side="right" className="!w-full sm:!min-w-[500px] md:!min-w-[600px] border-l border-zinc-200 p-0 overflow-hidden flex flex-col bg-[#fafafa]">
        {/* Header - Handoff Style */}
        <div className="px-6 md:px-8 py-4 md:py-6 border-b border-zinc-200 flex-shrink-0 flex items-center justify-between bg-[#fafafa]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="space-y-0">
              <SheetTitle style={{ fontFamily: mazzardFont }} className="text-lg md:text-xl font-semibold text-zinc-900 tracking-tighter italic leading-none">
                New Project Build
              </SheetTitle>
              <SheetDescription className="text-[12px] md:text-[14px] font-semibold text-[#67A708] tracking-[0.05em] mt-1">
                Initialization Protocol
              </SheetDescription>
            </div>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 md:py-6 custom-scrollbar bg-[#fafafa]">
          <form 
            autoComplete="off"
            id="add-project-form"
            className="max-w-4xl mx-auto space-y-8"
            action={async (formData) => {
              if (isSubmittingRef.current) return
              isSubmittingRef.current = true
              setIsPending(true)
              try {
                const result = await createProject(formData)
                if (result.success) {
                  localStorage.removeItem('add_project_form_draft')
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
          >
            {/* Blueprint Selection */}
            <div className="space-y-3">
              <Label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700">Workflow Blueprint</Label>
              <div className="relative group">
                <select 
                  name="workflow_template_id" 
                  value={selectedTemplateId || ''}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  required
                  className="w-full h-11 bg-white border border-zinc-950 px-4 text-[13px] font-semibold text-zinc-900 appearance-none focus:bg-white focus:border-zinc-950 outline-none transition-all rounded-none pr-12 shadow-sm"
                >
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-900">
                   <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Core Data */}
            <div className="space-y-6 border-t border-zinc-100/50 pt-6">
              <h3 style={{ fontFamily: mazzardFont }} className="text-xl font-black text-zinc-950 tracking-tight leading-none italic uppercase">Core Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group/field">
                  <Label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors">Client Name</Label>
                  <Input 
                    name="client_name" 
                    placeholder="ABC Corp" 
                    defaultValue={formDraft.client_name || ''} 
                    required 
                    className="w-full h-14 bg-white border border-zinc-200 px-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all placeholder:text-zinc-300 rounded-none shadow-none" 
                  />
                </div>
                <div className="space-y-2 group/field">
                  <Label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors">Client Email</Label>
                  <Input 
                    name="client_email" 
                    type="email" 
                    placeholder="contact@abc.com" 
                    defaultValue={formDraft.client_email || ''} 
                    required 
                    className="w-full h-14 bg-white border border-zinc-200 px-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all placeholder:text-zinc-300 rounded-none shadow-none" 
                  />
                </div>
              </div>
            </div>

            {/* Workflow Fields */}
            {selectedTemplateId && (
              <div className="border-t border-zinc-100/50 pt-6">
                <WorkflowForm 
                  workflowId={selectedTemplateId} 
                  prefix="dyn_" 
                  initialData={formDraft}
                  excludeKeys={['description', 'brand_voice', 'founding_year', 'target_keywords', 'opening_hours', 'appointment_type', 'maps_embed']}
                />
              </div>
            )}

            {/* Logistics */}
            <div className="space-y-6 border-t border-zinc-100/50 pt-6 pb-8">
              <h3 style={{ fontFamily: mazzardFont }} className="text-xl font-black text-zinc-950 tracking-tight leading-none italic uppercase">Project Logistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group/field">
                  <Label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors">Target Deadline</Label>
                  <Input name="deadline" type="date" defaultValue={formDraft.deadline || ''} className="w-full h-14 bg-white border border-zinc-200 px-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all rounded-none shadow-none" />
                </div>
                <div className="space-y-2 group/field">
                  <Label className="text-[13px] font-semibold tracking-[0.05em] text-zinc-700 group-hover/field:text-zinc-950 transition-colors">Total Budget (₹)</Label>
                  <Input name="budget" type="number" placeholder="50000" defaultValue={formDraft.budget || ''} className="w-full h-14 bg-white border border-zinc-200 px-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all placeholder:text-zinc-300 rounded-none shadow-none" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions - Handoff Style */}
        <div className="px-6 md:px-8 py-4 md:py-6 border-t border-zinc-200 flex flex-row items-center justify-between gap-3 flex-shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 md:h-12 px-4 md:px-6 border border-zinc-200 rounded-none text-zinc-900 font-semibold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all"
            >
              Cancel Protocol
            </Button>
          </div>
          <PendingButton
            loading={isPending}
            type="submit"
            form="add-project-form"
            className="h-10 md:h-12 px-6 md:px-10 bg-zinc-950 text-white rounded-none border border-zinc-950 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3"
          >
            Initialize Build <ArrowRight className="w-3.5 h-3.5" />
          </PendingButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
