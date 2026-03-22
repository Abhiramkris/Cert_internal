'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Zap, CheckCircle2, ShieldAlert, User } from 'lucide-react'
import { submitStageData } from '@/app/dashboard/projects/actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DynamicStageFormProps {
  projectId: string
  stage: any // current workflow_stage
  nextStage?: any // next workflow_stage
  staff?: any[]
  existingData?: any
  userProfile: any
  canAction: boolean
}

export function DynamicStageForm({ 
  projectId, 
  stage, 
  nextStage,
  staff = [],
  existingData = {}, 
  userProfile,
  canAction 
}: DynamicStageFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const isSubmittingRef = useRef(false)

  React.useEffect(() => {
    if (!stage) return
    const draftKey = `dyn_stage_draft_${projectId}_${stage.id}`
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      try {
        const data = JSON.parse(draft)
        const form = document.getElementById(`dyn-stage-form-${stage.id}`) as HTMLFormElement
        if (form) {
          Object.entries(data).forEach(([key, value]) => {
            const element = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            if (element && value) {
              element.value = value as string
            }
          })
        }
      } catch (e) {
        console.error('Failed to restore stage draft', e)
      }
    }
  }, [projectId, stage?.id])

  if (!stage) return null
  const fields = stage.workflow_fields || []

  return (
    <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <CardHeader className="p-8 pb-4 border-b border-zinc-50 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Phase</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight">
            {stage.display_name}
          </CardTitle>
        </div>
        
        {!canAction && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">View Only: Role Restricted</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-8">
        <form 
          autoComplete="off"
          id={`dyn-stage-form-${stage.id}`}
          onChange={(e) => {
            const formData = new FormData(e.currentTarget)
            const data: any = {}
            formData.forEach((value, key) => {
              data[key] = value
            })
            localStorage.setItem(`dyn_stage_draft_${projectId}_${stage.id}`, JSON.stringify(data))
          }}
          action={async (formData) => {
            if (isSubmittingRef.current || clickCount >= 2) return
            isSubmittingRef.current = true
            setIsPending(true)
            setClickCount(prev => prev + 1)
            try {
              await submitStageData(projectId, stage.id, formData)
              localStorage.removeItem(`dyn_stage_draft_${projectId}_${stage.id}`)
              toast.success('Stage data submitted successfully!')
            } catch (error: any) {
              toast.error(error.message || 'Submission failed')
            } finally {
              isSubmittingRef.current = false
              setIsPending(false)
            }
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field: any) => (
              <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                <div className="space-y-2">
                  <Label 
                    htmlFor={`dyn_${field.name}`}
                    className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 ml-1"
                  >
                    {field.label} {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.field_type === 'textarea' ? (
                    <Textarea 
                      id={`dyn_${field.name}`} 
                      name={`dyn_${field.name}`}
                      disabled={!canAction}
                      required={field.is_required}
                      defaultValue={existingData[field.name]}
                      placeholder={field.placeholder}
                      className="min-h-[120px] rounded-2xl bg-zinc-50 border-zinc-100 font-medium text-sm p-4 focus:ring-4 focus:ring-zinc-900/5 transition-all"
                    />
                  ) : field.field_type === 'select' ? (
                    <select
                      id={`dyn_${field.name}`}
                      name={`dyn_${field.name}`}
                      disabled={!canAction}
                      required={field.is_required}
                      defaultValue={existingData[field.name]}
                      className="w-full h-12 rounded-2xl bg-zinc-50 border border-zinc-100 px-4 font-bold text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none appearance-none"
                    >
                      <option value="">Select Option</option>
                      {(field.options || []).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      {field.field_type === 'number' && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">₹</div>
                      )}
                      <Input 
                        id={`dyn_${field.name}`} 
                        name={`dyn_${field.name}`}
                        type={field.field_type}
                        disabled={!canAction}
                        required={field.is_required}
                        defaultValue={existingData[field.name]}
                        placeholder={field.placeholder}
                        className={cn(
                          "h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold text-sm focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none",
                          field.field_type === 'number' ? "pl-8" : "px-4"
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Assignment during Transition */}
          {canAction && nextStage && (
            <div className="mt-8 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Next Phase Assignee</h4>
                  <p className="text-xs font-bold text-zinc-900">Assign a {nextStage.acting_role} to handle the next stage</p>
                </div>
              </div>

              <div className="space-y-2">
                <select
                  name="next_assignee_id"
                  required
                  className="w-full h-12 rounded-2xl bg-white border border-zinc-200 px-4 font-bold text-sm focus:ring-4 focus:ring-zinc-900/5 outline-none appearance-none cursor-pointer hover:border-zinc-300 transition-all"
                >
                  <option value="">Select {nextStage.acting_role}</option>
                  {staff
                    .filter(s => s.role === nextStage.acting_role)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))
                  }
                  {/* Fallback to all staff if role mismatch or empty */}
                  {staff.filter(s => s.role === nextStage.acting_role).length === 0 && staff.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 font-medium ml-1">
                  The selected member will see this project on their dashboard immediately after you submit.
                </p>
              </div>
            </div>
          )}

          {fields.length === 0 && (
            <div className="py-12 text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
               <CheckCircle2 className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Standard progression - No custom fields required</p>
            </div>
          )}

          {canAction && (
            <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Next Action</span>
                <span className="text-sm font-black text-zinc-900">
                  {nextStage ? `Advance to ${nextStage.display_name}` : stage.next_status_key ? `Advance to ${stage.next_status_key.replace(/_/g, ' ')}` : 'Complete Project'}
                </span>
              </div>
              <Button 
                disabled={isPending || clickCount >= 2}
                type="submit" 
                className={cn(
                  "rounded-2xl px-8 h-12 font-bold shadow-lg flex items-center gap-2 transition-all",
                  clickCount >= 2 
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none" 
                    : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/10"
                )}
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {clickCount >= 2 ? "Submission Locked" : "Submit & Advance Stage"}
              </Button>
            </div>
          )}

          {clickCount >= 2 && (
            <p className="text-[10px] text-zinc-400 font-bold text-right uppercase tracking-widest animate-pulse mt-2 pr-2">
              Maximum attempts reached. Please refresh page if stuck.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
