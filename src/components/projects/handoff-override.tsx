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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Next Destination</p>
          <div className="h-12 w-full rounded-none border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-900 flex items-center opacity-60">
            {templateStages[currentStageIndex + 1]?.display_name || 'Project Finalization'}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Next Owner</p>
          <select 
            className="h-12 w-full rounded-none border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-900 outline-none appearance-none cursor-pointer"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Next Phase Override</label>
            {isStatusChanged && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">Direction Changed</span>}
          </div>
          <select 
            name="status" 
            className="h-12 w-full rounded-none border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all appearance-none cursor-pointer"
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
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Next Owner Override</label>
          <select 
            id="detail-handoff-assignee"
            name="current_assignee_id" 
            className="h-12 w-full rounded-none border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all appearance-none cursor-pointer"
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
            {staff?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-2">
         <div className="flex items-center justify-between">
           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Handoff Note / reason for change</label>
           {isStatusChanged && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">* Required for override</span>}
         </div>
         <textarea 
           name="handoff_note"
           required={isStatusChanged}
           minLength={isStatusChanged ? 5 : 0}
           className="w-full min-h-[80px] rounded-none border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none"
           placeholder={isStatusChanged ? "Managers must explain why the workflow direction was changed..." : "Add a handover note (optional)..."}
         />
      </div>
    </div>
  )
}
