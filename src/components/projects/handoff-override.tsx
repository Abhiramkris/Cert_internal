'use client'

import React from 'react'
import { saveHandoffPreset } from '@/app/dashboard/projects/actions'
import { cn } from '@/lib/utils'

interface HandoffOverrideProps {
  project: any
  templateStages: any[]
  currentStageIndex: number
  staff: any[]
  isManager: boolean
}

export function HandoffOverride({ 
  project, 
  templateStages, 
  currentStageIndex, 
  staff,
  isManager
}: HandoffOverrideProps) {
  const defaultNextStatus = templateStages[currentStageIndex + 1]?.status_key || project.status
  const [selectedStatus, setSelectedStatus] = React.useState(project.config?.handoff?.next_status_key || defaultNextStatus)
  const isStatusChanged = selectedStatus !== defaultNextStatus

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Next Destination Dropdown - Now editable for everyone */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-700 ml-1">Next Destination</label>
            {isStatusChanged && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Direction Overridden</span>}
          </div>
          <div className="relative group">
            <select 
              name="status" 
              className="h-14 w-full rounded-none border border-zinc-200 bg-white px-6 text-[14px] font-bold text-zinc-950 outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all appearance-none cursor-pointer shadow-sm"
              defaultValue={selectedStatus}
              onChange={async (e) => {
                const targetStatus = e.target.value
                setSelectedStatus(targetStatus)
                const targetStage = templateStages.find((s: any) => s.status_key === targetStatus)
                let targetAssigneeId = ''
                if (targetStage && project.project_team) {
                  const team = project.project_team[0] || {}
                  const roleToKey: any = { 'SEO': 'seo_id', 'Developer': 'developer_id', 'Manager': 'manager_id', 'Sales': 'sales_id', 'Designer': 'designer_id' }
                  const key = roleToKey[targetStage.acting_role]
                  targetAssigneeId = team[key] || ''
                  const assigneeSelect = document.getElementById(`detail-handoff-assignee`) as HTMLSelectElement
                  if (assigneeSelect && targetAssigneeId) {
                    assigneeSelect.value = targetAssigneeId
                  }
                }
                await saveHandoffPreset(project.id, targetStatus, targetAssigneeId)
              }}
            >
              {templateStages.map((s: any) => (
                <option key={s.status_key} value={s.status_key}>{s.display_name}</option>
              ))}
              {/* If project has no next stage in template, show finalization option */}
              {templateStages.length > 0 && !templateStages[currentStageIndex + 1] && (
                <option value="COMPLETED">Project Finalization</option>
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Next Owner Dropdown */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-700 ml-1">Next Owner</label>
          <div className="relative group">
            <select 
              id="detail-handoff-assignee"
              name="current_assignee_id" 
              className="h-14 w-full rounded-none border border-zinc-200 bg-white px-6 text-[14px] font-bold text-zinc-950 outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all appearance-none cursor-pointer shadow-sm"
              onChange={async (e) => {
                const status = (document.querySelector('select[name="status"]') as HTMLSelectElement).value
                await saveHandoffPreset(project.id, status, e.target.value)
              }}
              defaultValue={(() => {
                if (project.config?.handoff?.next_assignee_id) {
                    return project.config.handoff.next_assignee_id
                }
                const targetStage = templateStages.find((s: any) => s.status_key === selectedStatus)
                if (targetStage && project.project_team) {
                  const team = project.project_team[0] || {}
                  const roleToKey: any = { 'SEO': 'seo_id', 'Developer': 'developer_id', 'Manager': 'manager_id', 'Sales': 'sales_id', 'Designer': 'designer_id' }
                  const key = roleToKey[targetStage.acting_role]
                  if (key && team[key]) return team[key]
                }
                return project.current_assignee_id || ''
              })()}
            >
              <option value="">Auto-Assigned</option>
              {staff?.filter((s: any) => {
                  const targetStage = templateStages.find((st: any) => st.status_key === selectedStatus)
                  if (s.role === 'Manager' || s.role === 'Admin') return true
                  return s.role === targetStage?.acting_role
              }).map((s: any) => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Handoff Note / instructions - Mandatory for overrides */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-700 ml-1">Handoff Note / instructions</label>
          {isStatusChanged && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">* Required for flow override</span>}
        </div>
        <textarea 
          name="handoff_note"
          required={isStatusChanged}
          minLength={isStatusChanged ? 5 : 0}
          className="w-full min-h-[120px] rounded-none border border-zinc-200 bg-white px-6 py-6 text-[14px] font-bold text-zinc-950 outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all resize-none shadow-sm placeholder:text-zinc-400"
          placeholder={isStatusChanged ? "You are modifying the standard workflow. Explain why..." : "Add handover instructions for the next phase (optional)..."}
        />
      </div>
    </div>
  )
}
