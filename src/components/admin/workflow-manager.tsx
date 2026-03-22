'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  Layout, 
  ChevronRight, 
  Shield, 
  Eye,
  Type,
  List,
  CheckSquare,
  Hash,
  Calendar as CalendarIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
}

interface WorkflowStage {
  id: string
  template_id: string
  status_key: string
  display_name: string
  acting_role: string
  next_status_key: string | null
  is_initial: boolean
}

interface WorkflowField {
  id: string
  stage_id: string
  label: string
  name: string
  field_type: string
  is_required: boolean
  order_index: number
}

const ROLES = ['Sales', 'Manager', 'SEO', 'Developer', 'Designer', 'HR', 'Admin']
const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: List },
  { value: 'number', label: 'Amount/Number', icon: Hash },
  { value: 'select', label: 'Dropdown', icon: Settings },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'date', label: 'Date Picker', icon: CalendarIcon },
]

export function WorkflowManager() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [stages, setStages] = useState<WorkflowStage[]>([])
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [fields, setFields] = useState<WorkflowField[]>([])
  const [loading, setLoading] = useState(true)
  const [isActionPending, setIsActionPending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplateId) {
      fetchStages(selectedTemplateId)
    }
  }, [selectedTemplateId])

  useEffect(() => {
    if (selectedStageId) {
      fetchFields(selectedStageId)
    }
  }, [selectedStageId])

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      toast.error('Failed to fetch templates')
    } else {
      setTemplates(data || [])
      if (data && data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id)
      }
    }
    setLoading(false)
  }

  async function fetchStages(templateId: string) {
    const { data, error } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true })
    
    if (error) {
      toast.error('Failed to fetch stages')
    } else {
      setStages(data || [])
      if (data && data.length > 0) {
        setSelectedStageId(data[0].id)
      } else {
        setSelectedStageId(null)
      }
    }
  }

  async function fetchFields(stageId: string) {
    const { data, error } = await supabase
      .from('workflow_fields')
      .select('*')
      .eq('stage_id', stageId)
      .order('order_index', { ascending: true })
    
    if (error) {
      toast.error('Failed to fetch fields')
    } else {
      setFields(data || [])
    }
  }

  async function addStage() {
    if (!selectedTemplateId) return

    const newStage = {
      template_id: selectedTemplateId,
      status_key: `STAGE_${Date.now()}`,
      display_name: 'New Stage',
      acting_role: 'Sales',
      is_initial: stages.length === 0
    }

    const { data, error } = await supabase
      .from('workflow_stages')
      .insert(newStage)
      .select()
      .single()

    if (error) {
      toast.error('Failed to add stage')
    } else {
      setStages([...stages, data])
      setSelectedStageId(data.id)
      toast.success('Stage added to template')
    }
    setIsActionPending(false)
  }

  async function addField() {
    if (!selectedStageId || isActionPending) return
    setIsActionPending(true)

    const newField = {
      stage_id: selectedStageId,
      label: 'New Field',
      name: `field_${Date.now()}`,
      field_type: 'text',
      is_required: false,
      order_index: fields.length
    }

    const { data, error } = await supabase
      .from('workflow_fields')
      .insert(newField)
      .select()
      .single()

    if (error) {
      toast.error('Failed to add field')
    } else {
      setFields([...fields, data])
      toast.success('Field added')
    }
    setIsActionPending(false)
  }

  // Stage editing functions
  async function saveStageChanges() {
    if (!selectedStage) return
    
    setLoading(true)
    const { error } = await supabase
      .from('workflow_stages')
      .update({
        display_name: selectedStage.display_name,
        acting_role: selectedStage.acting_role,
        next_status_key: selectedStage.next_status_key,
        is_initial: selectedStage.is_initial
      })
      .eq('id', selectedStage.id)

    if (error) {
      toast.error('Failed to deploy stage changes')
    } else {
      setStages(stages.map(s => s.id === selectedStage.id ? selectedStage : s))
      toast.success('Stage configuration deployed')
    }
    setLoading(false)
  }

  function handleStageUpdate(updates: Partial<WorkflowStage>) {
    if (!selectedStage) return
    setStages(stages.map(s => s.id === selectedStage.id ? { ...s, ...updates } : s))
  }

  async function deleteField(id: string) {
    const { error } = await supabase
      .from('workflow_fields')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete field')
    } else {
      setFields(fields.filter(f => f.id !== id))
      toast.success('Field removed')
    }
  }

  function handleFieldLocalUpdate(id: string, updates: Partial<WorkflowField>) {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  async function updateField(id: string, updates: Partial<WorkflowField>) {
    const { error } = await supabase
      .from('workflow_fields')
      .update(updates)
      .eq('id', id)

    if (error) {
      toast.error('Failed to sync field to database')
    }
  }

  if (loading) return <div className="p-8 text-center text-zinc-400">Syncing Workflow Engine...</div>

  const selectedStage = stages.find(s => s.id === selectedStageId)
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Workflow Templates</h2>
            <p className="text-zinc-400 text-sm font-medium">Select a pipeline blueprint to configure its stages and rules.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedTemplateId || ''}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="bg-zinc-50 border border-zinc-100 rounded-2xl font-bold px-6 py-3 text-sm outline-none w-72"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <PendingButton variant="outline" loading={isActionPending} className="rounded-2xl border-zinc-200 font-bold text-xs uppercase px-6 h-12 hover:bg-zinc-50 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </PendingButton>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stages List (Left) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Stages in {selectedTemplate?.name || 'Workflow'}</h2>
            <Button onClick={addStage} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {stages.map((stage) => (
              <div 
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={cn(
                  "p-4 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between",
                  selectedStageId === stage.id 
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]" 
                    : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-200"
                )}
              >
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mb-1",
                    selectedStageId === stage.id ? "text-zinc-400" : "text-zinc-400"
                  )}>
                    {stage.acting_role} Action
                  </span>
                  <span className="text-sm font-black tracking-tight">{stage.display_name}</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform group-hover:translate-x-1",
                  selectedStageId === stage.id ? "text-white" : "text-zinc-300"
                )} />
              </div>
            ))}
            {stages.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No stages defined</p>
              </div>
            )}
          </div>
        </div>

        {/* Stage Editor (Right) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStage ? (
          <>
            <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardHeader className="p-8 pb-4 border-b border-zinc-50">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">
                    Active Configuration
                  </Badge>
                  <PendingButton loading={isActionPending} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-tighter">
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete Stage
                  </PendingButton>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Stage Name</label>
                    <Input 
                      value={selectedStage.display_name} 
                      onChange={(e) => handleStageUpdate({ display_name: e.target.value })}
                      className="rounded-2xl border-zinc-100 font-bold text-lg h-12 focus:ring-4 focus:ring-zinc-900/5"
                    />
                  </div>
                  <div className="w-48 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Acting Role</label>
                    <select 
                      value={selectedStage.acting_role}
                      onChange={(e) => handleStageUpdate({ acting_role: e.target.value })}
                      className="w-full rounded-2xl border border-zinc-100 font-bold text-sm h-12 px-4 focus:ring-4 focus:ring-zinc-900/5 bg-white outline-none"
                    >
                      {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="w-32 flex flex-col gap-1.5 px-4 h-12 justify-center border border-zinc-100 rounded-2xl bg-zinc-50/30 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-zinc-400">Entry</span>
                      <input 
                        type="checkbox" 
                        checked={selectedStage.is_initial}
                        onChange={(e) => handleStageUpdate({ is_initial: e.target.checked })}
                        className="w-4 h-4 accent-zinc-900 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">Custom Form Fields</h3>
                    <p className="text-xs text-zinc-400 font-medium">Fields to be filled by the {selectedStage.acting_role} during this phase.</p>
                  </div>
                  <PendingButton onClick={addField} loading={isActionPending} variant="outline" className="rounded-2xl border-zinc-200 font-bold text-xs uppercase px-6 h-10 hover:bg-zinc-50 transition-all border-none shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </PendingButton>
                </div>

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 group hover:bg-white hover:shadow-xl transition-all">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm">
                        {React.createElement(FIELD_TYPES.find(t => t.value === field.field_type)?.icon || Type, { className: "w-5 h-5 text-zinc-400" })}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <Input 
                          placeholder="Field Label"
                          value={field.label}
                          onChange={(e) => handleFieldLocalUpdate(field.id, { label: e.target.value })}
                          onBlur={(e) => updateField(field.id, { label: e.target.value })}
                          className="bg-transparent border-none font-bold text-sm focus:ring-0 px-0 h-auto"
                        />
                        <select 
                          value={field.field_type}
                          onChange={(e) => {
                            handleFieldLocalUpdate(field.id, { field_type: e.target.value })
                            updateField(field.id, { field_type: e.target.value })
                          }}
                          className="bg-transparent border-none font-bold text-[10px] uppercase tracking-wider text-zinc-400 h-auto outline-none"
                        >
                          {FIELD_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("w-8 h-8 rounded-full", field.is_required ? "text-emerald-500 bg-emerald-50" : "text-zinc-300")}
                          onClick={() => updateField(field.id, { is_required: !field.is_required })}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <div className="py-12 text-center bg-zinc-50/30 rounded-[2rem] border border-dashed border-zinc-200">
                      <Layout className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No custom fields defined</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none bg-zinc-900 p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Handoff Chain</p>
                    <h3 className="text-xl font-black tracking-tight">Next Destination</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      value={selectedStage.next_status_key || ''}
                      onChange={(e) => handleStageUpdate({ next_status_key: e.target.value || null })}
                      className="bg-white/10 border border-white/10 rounded-2xl font-bold px-6 py-3 text-sm outline-none w-64"
                    >
                      <option value="">End of Pipeline</option>
                      {stages.filter(s => s.id !== selectedStageId).map(s => (
                        <option key={s.status_key} value={s.status_key}>{s.display_name}</option>
                      ))}
                    </select>
                    <PendingButton 
                      onClick={saveStageChanges}
                      loading={isActionPending || loading}
                      className="bg-white text-zinc-900 hover:bg-zinc-200 font-bold rounded-2xl px-8 h-12"
                    >
                      Deploy Changes
                    </PendingButton>
                  </div>
               </div>
            </Card>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-20 bg-white rounded-[3rem] border border-dashed border-zinc-200">
             <div className="text-center">
                <Settings className="w-16 h-16 text-zinc-100 mx-auto mb-4 animate-spin-slow" />
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Select a stage to begin configuring</p>
             </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}
