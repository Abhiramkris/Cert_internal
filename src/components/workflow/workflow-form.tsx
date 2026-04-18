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
  const [allStages, setAllStages] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchFields() {
      if (!workflowId) return
      setLoading(true)
      
      try {
        const { data: stages, error } = await supabase
          .from('workflow_stages')
          .select('*, workflow_fields(*)')
          .eq('template_id', workflowId)
          .order('created_at', { ascending: true })
        
        if (error) throw error

        setAllStages(stages || [])
        const allFields = stages?.flatMap(s => (s.workflow_fields || []).map((f: any) => ({
          ...f,
          role: f.role || s.acting_role,
          stage_id: s.id
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
    
    // 1. Add Static Fields (Global Strategic Registry)
    staticQuestions.forEach(q => {
      const role = q.role || 'Sales'
      if (!groups[role]) groups[role] = []
      groups[role].push({ ...q, isStatic: true })
    })
    
    // 2. Add Database Fields (regardless of ID)
    dbFields.forEach(f => {
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
          const uRole = userRole.toLowerCase()
          const fRole = role.toLowerCase()
          
          if (uRole === 'admin' || uRole === 'manager') return true
          if ((uRole === 'developer' || uRole === 'dev' || uRole === 'technical') && 
              (fRole === 'technical' || fRole === 'developer' || fRole === 'dev')) return true
          if (uRole === 'sales' && (fRole === 'marketing' || fRole === 'branding' || fRole === 'sales')) return true
          
          return fRole === uRole
        })
        .map(([role, roleFields]) => (
        <div key={role} className={cn(
          "bg-white border-b border-zinc-50 last:border-0 pb-6 mb-12",
        )}>
          <div className="flex items-center gap-4 mb-12 translate-x-1">
            <div className={cn(
               "w-12 h-12 border flex items-center justify-center rounded-xl shadow-sm",
               role.toLowerCase() === 'sales' ? 'bg-amber-50 border-amber-100 text-zinc-900' :
               role.toLowerCase() === 'seo' ? 'bg-emerald-50 border-emerald-100 text-zinc-900' :
               role.toLowerCase() === 'design' || role.toLowerCase() === 'designer' ? 'bg-blue-50 border-blue-100 text-zinc-900' :
               'bg-zinc-50 border-zinc-100 text-zinc-900'
            )}>
               {role.toLowerCase() === 'sales' ? <Sparkles className="w-6 h-6" /> :
                role.toLowerCase() === 'seo' ? <Globe className="w-6 h-6" /> :
                role.toLowerCase() === 'design' || role.toLowerCase() === 'designer' ? <Palette className="w-6 h-6" /> :
                <LayoutTemplate className="w-6 h-6" />}
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 italic">Unit // Protocol</span>
               <h3 className="text-xl font-black text-zinc-950 tracking-tight leading-none italic uppercase">{role} Architecture</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {roleFields.map((f: any) => {
                const fieldName = f.isStatic ? f.key : `${prefix}${f.name}`
                const fieldType = (f.isStatic ? f.type : f.field_type) || 'text'
                
                let displayLabel = f.label || f.name
                if (!f.isStatic && f.placeholder && !f.placeholder.startsWith('{')) {
                  displayLabel = f.placeholder
                }

                const isPastField = !f.isStatic && stageId && allStages.findIndex(s => s.id === stageId) > allStages.findIndex(s => s.id === f.stage_id)
                const isCurrentField = f.isStatic || f.stage_id === stageId
                const fieldReadOnly = readOnly || (!isCurrentField && !f.isStatic)

                return (
                   <div key={f.isStatic ? f.key : f.id} className={cn(
                     "flex flex-col gap-3 py-6 group/field transition-all",
                     fieldReadOnly && "opacity-60 grayscale-[0.5]",
                     fieldType === 'textarea' && "md:col-span-2"
                   )}>
                    <Label htmlFor={fieldName} className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 group-hover/field:text-zinc-950 transition-colors ml-1">
                      {displayLabel}
                    </Label>
                    <div className="w-full">
                       {fieldType === 'textarea' ? (
                         <Textarea 
                           id={fieldName} 
                           name={fieldName} 
                           placeholder={f.placeholder} 
                           key={`${fieldName}-${getDisplayValue(initialData[f.isStatic ? f.key : f.name])}`}
                           defaultValue={getDisplayValue(initialData[f.isStatic ? f.key : f.name])}
                           readOnly={fieldReadOnly}
                           className="min-h-[140px] w-full bg-white border border-zinc-200 p-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all outline-none resize-none placeholder:text-zinc-300 leading-relaxed rounded-none shadow-none" 
                         />
                       ) : fieldType === 'select' || (f.options && f.options.length > 0) ? (
                         <select 
                           id={fieldName} 
                           name={fieldName} 
                           key={`${fieldName}-${getDisplayValue(initialData[f.isStatic ? f.key : f.name])}`}
                           defaultValue={getDisplayValue(initialData[f.isStatic ? f.key : f.name])}
                           disabled={fieldReadOnly}
                           className="w-full h-14 bg-white border border-zinc-200 px-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all appearance-none cursor-pointer outline-none rounded-none shadow-none"
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
                           key={`${fieldName}-${getDisplayValue(initialData[f.isStatic ? f.key : f.name])}`}
                           defaultValue={getDisplayValue(initialData[f.isStatic ? f.key : f.name])}
                           readOnly={fieldReadOnly}
                           className="h-14 w-full bg-white border border-zinc-200 px-6 text-[14px] font-bold tracking-tight text-zinc-950 focus:ring-4 focus:ring-zinc-950/5 transition-all placeholder:text-zinc-300 rounded-none shadow-none" 
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
