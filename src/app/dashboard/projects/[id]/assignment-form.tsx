'use client'

import { assignTeam } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Users, Loader2, ShieldCheck, Zap } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AssignmentFormProps {
  projectId: string
  team?: {
    seo_id: string | null
    developer_id: string | null
    manager_id: string | null
    hr_id: string | null
    designer_id: string | null
  }
  staff: {
    id: string
    full_name: string | null
    role: string | null
  }[]
  currentStatus?: string
  currentAssigneeId?: string
  allStages?: { status_key: string; display_name: string }[]
  isManager?: boolean
}

export function AssignmentForm({ projectId, team, staff, currentStatus, currentAssigneeId, allStages = [], isManager = false }: AssignmentFormProps) {
  const [isPending, setIsPending] = useState(false)
  const seos = staff.filter(s => s.role === 'SEO' || s.role === 'Admin')
  const developers = staff.filter(s => s.role === 'Developer' || s.role === 'Admin')
  const managers = staff.filter(s => s.role === 'Manager' || s.role === 'Admin')
  const hrs = staff.filter(s => s.role === 'HR' || s.role === 'Admin')
  const designers = staff.filter(s => s.role === 'Designer' || s.role === 'Admin')

  return (
    <Card className="bg-white border-zinc-200 text-zinc-900 rounded-xl overflow-hidden shadow-sm">
      <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4 px-6">
        <CardTitle className="flex items-center gap-2.5 text-sm font-bold text-zinc-900">
          <Users className="w-4 h-4 text-zinc-400" />
          General Assignment
        </CardTitle>
        <CardDescription className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Resource Allocation</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form 
          action={async (formData) => {
            setIsPending(true)
            try {
              await assignTeam(projectId, formData)
              toast.success('Project configuration updated')
            } catch (error) {
              toast.error('Failed to update project')
            } finally {
              setIsPending(false)
            }
          }} 
          className="space-y-5"
        >
          {isManager && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-4 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Administrative Override</span>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 ml-1 italic">Go Off Flow: Jump to Stage</Label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue={currentStatus || ''}
                  className="flex h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-amber-500/10 appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Keep Current Stage</option>
                  {allStages.map(s => <option key={s.status_key} value={s.status_key}>{s.display_name.replace(/_/g, ' ')}</option>)}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current_assignee_id" className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 ml-1 italic">Manual Owner Override</Label>
                <select 
                  id="current_assignee_id" 
                  name="current_assignee_id" 
                  defaultValue={currentAssigneeId || ''}
                  className="flex h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-amber-500/10 appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Keep Current Owner</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="manager_id" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Account Manager</Label>
            <select 
              id="manager_id" 
              name="manager_id" 
              defaultValue={team?.manager_id || ''}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">Select Manager</option>
              {managers.map(s => <option key={s.id} value={s.id} className="bg-white">{s.full_name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seo_id" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">SEO Specialist</Label>
            <select 
              id="seo_id" 
              name="seo_id" 
              defaultValue={team?.seo_id || ''}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">Select Specialist</option>
              {seos.map(s => <option key={s.id} value={s.id} className="bg-white">{s.full_name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="developer_id" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Assigned Engineer</Label>
            <select 
              id="developer_id" 
              name="developer_id" 
              defaultValue={team?.developer_id || ''}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">Select Developer</option>
              {developers.map(s => <option key={s.id} value={s.id} className="bg-white">{s.full_name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hr_id" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Financial Liaison</Label>
            <select 
              id="hr_id" 
              name="hr_id" 
              defaultValue={team?.hr_id || ''}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">Select HR</option>
              {hrs.map(s => <option key={s.id} value={s.id} className="bg-white">{s.full_name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="designer_id" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">Creative Designer</Label>
            <select 
              id="designer_id" 
              name="designer_id" 
              defaultValue={team?.designer_id || ''}
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="bg-white">Select Designer</option>
              {designers.map(s => <option key={s.id} value={s.id} className="bg-white">{s.full_name}</option>)}
            </select>
          </div>

          <PendingButton loading={isPending} type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider shadow-sm transition-all mt-4">
            Update Team
          </PendingButton>
        </form>
      </CardContent>
    </Card>
  )
}
