'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Sparkles, 
  Globe, 
  Palette, 
  LayoutTemplate, 
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import staticQuestions from '@/utils/builder/static-questions.json'

interface WorkflowFormProps {
  workflowId: string
  stageId?: string
  initialData?: Record<string, any>
  onChange?: (data: Record<string, any>) => void
  readOnly?: boolean
  prefix?: string // e.g. "dyn_" or "static_"
  userRole?: string // for visibility filtering
  financials?: { totalPaid: number, balance: number }
}

const getDisplayValue = (val: any) => {
  if (!val) return ''
  if (typeof val === 'object') return val.text || JSON.stringify(val)
  if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
    try {
      const parsed = JSON.parse(val)
      return parsed.text || val
    } catch {
      return val
    }
  }
  return val
}

const FLAGSHIP_WEB_DEV_ID = 'f24af6ff-52b0-43cc-bf56-33d9e5963f06'

export function WorkflowForm({
  workflowId,
  stageId,
  initialData = {},
  onChange,
  readOnly = false,
  prefix = '',
  userRole = 'Sales',
  financials
}: WorkflowFormProps) {
  const [dbFields, setDbFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFields() {
      if (!workflowId) return
      setLoading(true)
      
      try {
        let query = supabase
          .from('workflow_stages')
          .select('*, workflow_fields(*)')
          .eq('template_id', workflowId)
        
        if (stageId) {
          query = query.eq('id', stageId)
        }
        
        const { data: stages, error } = await query
        if (error) throw error

        const allFields = stages?.flatMap(s => (s.workflow_fields || []).map((f: any) => ({
          ...f,
          role: s.acting_role // Inherit role from stage if not set
        }))) || []

        setDbFields(allFields)
      } catch (err) {
        console.error('Error fetching fields:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFields()
  }, [workflowId, stageId, supabase])

  // Combine and Group by Role
  const groupedByRole = useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    // 1. Add Static Fields (if flagship)
    if (workflowId === FLAGSHIP_WEB_DEV_ID) {
      staticQuestions.forEach(q => {
        const role = q.role || 'Sales'
        if (!groups[role]) groups[role] = []
        groups[role].push({ ...q, isStatic: true })
      })
    }
    
    // 2. Add Database Fields (regardless of ID)
    dbFields.forEach(f => {
      // For dynamic fields, we use acting_role of their stage or default to Sales
      const role = f.role || 'Sales'
      if (!groups[role]) groups[role] = []
      groups[role].push({ ...f, isStatic: false })
    })
    
    return groups
  }, [workflowId, dbFields])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Layers className="w-6 h-6 text-zinc-200 animate-pulse" />
      </div>
    )
  }

  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'

  return (
    <div className="space-y-0 py-1" style={{ fontFamily: mazzardFont }}>
      {Object.entries(groupedByRole)
        .filter(([role]) => {
          if (!userRole) return true
          if (userRole === 'Admin' || userRole === 'Manager') return true
          return role.toLowerCase() === userRole.toLowerCase()
        })
        .map(([role, roleFields]) => (
        <div key={role} className={cn(
          "bg-white border-b border-zinc-200 last:border-0 pb-2 mb-2",
          readOnly && "opacity-60"
        )}>
          <div className="flex items-center gap-3 mb-8">
            <div className={cn(
               "w-10 h-10 border flex items-center justify-center rounded-none shadow-sm",
               role.toLowerCase() === 'sales' ? 'bg-amber-50 border-amber-100 text-amber-600' :
               role.toLowerCase() === 'seo' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
               role.toLowerCase() === 'design' || role.toLowerCase() === 'designer' ? 'bg-blue-50 border-blue-100 text-blue-600' :
               'bg-zinc-50 border-zinc-100 text-zinc-600'
            )}>
               {role.toLowerCase() === 'sales' ? <Sparkles className="w-5 h-5" /> :
                role.toLowerCase() === 'seo' ? <Globe className="w-5 h-5" /> :
                role.toLowerCase() === 'design' || role.toLowerCase() === 'designer' ? <Palette className="w-5 h-5" /> :
                <LayoutTemplate className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
               <span className="text-[11px] font-bold text-zinc-400 tracking-tight">Operational Unit</span>
               <h3 className="text-base font-black text-zinc-900 tracking-tight">{role} Requirements</h3>
            </div>
          </div>

          <div className="space-y-4">
             {financials && role.toLowerCase() === 'manager' && (
               <div className="grid grid-cols-2 gap-8 mb-8 py-8 border-y border-zinc-50">
                 <div className="space-y-1">
                   <p className="text-[11px] font-black tracking-tight text-zinc-400">Total Capitalized</p>
                   <p className="text-2xl font-black text-zinc-900 tracking-tighter italic">₹{financials.totalPaid.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="space-y-1 text-right border-l border-zinc-50 pl-8">
                   <p className="text-[11px] font-black tracking-tight text-zinc-400">Outstanding Liability</p>
                   <p className="text-2xl font-black text-rose-500 tracking-tighter italic">₹{financials.balance.toLocaleString('en-IN')}</p>
                 </div>
               </div>
             )}
            
            <div className="space-y-1">
              {roleFields.map((f: any) => {
                const fieldName = f.isStatic ? f.key : `${prefix}${f.name}`
                const fieldType = (f.isStatic ? f.type : f.field_type) || 'text'
                
                let displayLabel = f.label || f.name
                if (!f.isStatic && f.placeholder && !f.placeholder.startsWith('{')) {
                  displayLabel = f.placeholder
                }

                return (
                   <div key={f.isStatic ? f.key : f.id} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-zinc-50 last:border-0 items-center group/field">
                    <Label htmlFor={fieldName} className="text-[11px] font-black tracking-tight text-zinc-500 group-hover/field:text-zinc-900 transition-colors">
                      {displayLabel}
                    </Label>
                                        <div className="md:col-span-2">
                      {fieldType === 'textarea' ? (
                        <Textarea 
                          id={fieldName} 
                          name={fieldName} 
                          placeholder={f.placeholder} 
                          defaultValue={getDisplayValue(initialData[f.isStatic ? f.key : f.name])}
                          readOnly={readOnly}
                          className="min-h-[120px] w-full bg-[#fafafa] border border-zinc-100 p-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-900 transition-all outline-none resize-none placeholder:text-zinc-200 leading-relaxed rounded-none" 
                        />
                      ) : fieldType === 'select' || (f.options && f.options.length > 0) ? (
                        <select 
                          id={fieldName} 
                          name={fieldName} 
                          defaultValue={getDisplayValue(initialData[f.isStatic ? f.key : f.name])}
                          disabled={readOnly}
                          className="w-full h-11 bg-[#fafafa] border border-zinc-100 px-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-900 transition-all appearance-none cursor-pointer outline-none rounded-none"
                        >
                          <option value="">Select option</option>
                          {f.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <Input 
                          id={fieldName} 
                          name={fieldName} 
                          type={fieldType} 
                          placeholder={f.placeholder || "Enter details..."} 
                          defaultValue={getDisplayValue(initialData[f.isStatic ? f.key : f.name])}
                          readOnly={readOnly}
                          className="h-11 w-full bg-[#fafafa] border border-zinc-100 px-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-900 transition-all placeholder:text-zinc-200 rounded-none" 
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
