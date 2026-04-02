'use client'

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import staticQuestions from '@/utils/builder/static-questions.json'

interface ProjectContextType {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  userProfile: any
  setUserProfile: (profile: any) => void
  projects: any[]
  setProjects: (projects: any[]) => void
  activeProject: any | null
  missingFields: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  showArchived: boolean
  setShowArchived: (show: boolean) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId])

  const missingFields = useMemo(() => {
    if (!activeProject) return []
    
    // Suprabase relationship parsing
    const template = (Array.isArray(activeProject.workflow_templates) 
      ? activeProject.workflow_templates[0] 
      : (activeProject.workflow_templates || (activeProject as any).workflow_template)) || null

    if (!template) return []
    
    const currentStage = (template.workflow_stages || []).find(
      (s: any) => s.status_key?.toLowerCase() === activeProject.status?.toLowerCase()
    )
    
    // 1. Standard Fields (Calculated only if stage matches status_key)
    let missing: any[] = []
    if (currentStage) {
      const stageData = activeProject.stage_data?.[currentStage.id]?.data || {}
      missing = (currentStage.workflow_fields || []).filter((f: any) => !stageData[f.name]).map((f: any) => ({
        name: f.name,
        label: f.label,
        type: f.type,
        options: f.options
      }))
    }

    // 2. Static Specialized Fields (SEO/Design/Sales etc)
    const missingStatic = staticQuestions.filter((q: any) => {
      const config = activeProject.config || {}
      if (q.category === 'seo_metadata') {
         const seo = config.seo || {}
         return !seo[q.key] || seo[q.key]?.trim() === ''
      }
      if (q.category === 'content_overrides' || q.category === 'global_styles') {
         const builder = config.builder || {}
         const values = builder[q.category] || {}
         return !values[q.key] || values[q.key]?.trim() === ''
      }
      return false
    }).map((q: any) => ({
      name: q.key,
      label: q.label,
      type: q.type,
      options: (q as any).options
    }))
    
    return [...missing, ...missingStatic]
  }, [activeProject])

  return (
    <ProjectContext.Provider value={{ 
      activeProjectId, 
      setActiveProjectId, 
      userProfile, 
      setUserProfile,
      projects,
      setProjects,
      activeProject,
      missingFields,
      searchQuery,
      setSearchQuery,
      showArchived,
      setShowArchived,
      viewMode,
      setViewMode
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
