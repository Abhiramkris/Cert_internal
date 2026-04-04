'use client'

import React from 'react'
import { saveHandoffPreset } from '@/app/dashboard/projects/actions'

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
  if (!isManager) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Next Destination</p>
          <div className="h-12 w-full rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-[13px] font-bold text-zinc-900 flex items-center opacity-60">
            {templateStages[currentStageIndex + 1]?.display_name || 'Project Finalization'}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Next Owner</p>
          <select 
            className="h-12 w-full rounded-xl border border-zinc-100 bg-[#fafafa] px-4 py-2 text-[13px] font-bold text-zinc-900 outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all shadow-sm"
            onChange={async (e) => {
              const status = templateStages[currentStageIndex + 1]?.status_key || project.status
              await saveHandoffPreset(project.id, status, e.target.value)
            }}
            defaultValue={(() => {
              if (project.config?.handoff?.next_assignee_id) {
                return project.config.handoff.next_assignee_id
              }
              const targetStatus = templateStages[currentStageIndex + 1]?.status_key || project.status
              const targetStage = templateStages.find((s: any) => s.status_key === targetStatus)
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
            {staff?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Next Destination</label>
            {isStatusChanged && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Direction Changed</span>}
          </div>
          <select 
            name="status" 
            className="h-14 w-full rounded-none border-[1px] border-zinc-200 bg-white px-6 text-[14px] font-bold text-zinc-950 outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all appearance-none cursor-pointer shadow-sm"
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
          </select>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Next Owner</label>
          <select 
            id="detail-handoff-assignee"
            name="current_assignee_id" 
            className="h-14 w-full rounded-none border-[1px] border-zinc-200 bg-white px-6 text-[14px] font-bold text-zinc-950 outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all appearance-none cursor-pointer shadow-sm"
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
                // Always show Managers/Admins as they are global owners
                if (s.role === 'Manager' || s.role === 'Admin') return true
                // Otherwise role-match
                return s.role === targetStage?.acting_role
            }).map((s: any) => (
              <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
         <div className="flex items-center justify-between">
           <label className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 ml-1">Handoff Note / reason for change</label>
           {isStatusChanged && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">* Required for override</span>}
         </div>
         <textarea 
           name="handoff_note"
           required={isStatusChanged}
           minLength={isStatusChanged ? 5 : 0}
           className="w-full min-h-[140px] rounded-none border-[1px] border-zinc-200 bg-white px-6 py-6 text-[14px] font-bold text-zinc-950 outline-none focus:ring-4 focus:ring-zinc-950/5 transition-all resize-none shadow-sm"
           placeholder={isStatusChanged ? "Managers must explain why the workflow direction was changed..." : "Add a handover note (optional)..."}
         />
      </div>
    </div>
  )
}
