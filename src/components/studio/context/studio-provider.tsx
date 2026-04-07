'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  saveWebsiteConfig, 
  generateProjectZip, 
  saveSeoConfig,
  generateAiContentForComponent,
  generateAiWebsiteContent 
} from '@/app/dashboard/projects/builder-actions'
import { toast } from 'sonner'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'

interface StudioContextType {
  projectId: string
  project: any
  pages: string[]
  flowMode: 'wizard' | 'builder'
  wizardStep: 'pages' | 'details' | 'colors' | 'typography' | 'cta' | 'complete'
  activeComponentId: string | null

  step: number
  activeModuleIndex: number
  activeTab: string
  isSaving: boolean
  isGenerating: boolean
  isAiGenerating: boolean
  isArchitectureVerified: boolean
  
  globalStyles: any
  currentPage: string
  selectedComponents: Record<string, string[]>
  componentSettings: Record<string, any>
  contentOverrides: any
  seo: any

  // Picker State
  isPickerOpen: boolean
  pickerCategory: string | null
  pickerSlotIndex: number | null

  // Setters
  setPages: (pages: string[]) => void
  setFlowMode: (mode: 'wizard' | 'builder') => void
  setWizardStep: (step: 'pages' | 'details' | 'colors' | 'typography' | 'cta' | 'complete') => void
  setActiveComponentId: (id: string | null) => void
  setStep: (step: number) => void
  setActiveModuleIndex: (index: number) => void
  setActiveTab: (tab: string) => void
  setIsArchitectureVerified: (verified: boolean) => void
  setGlobalStyles: (styles: any) => void
  setCurrentPage: (page: string) => void
  setSelectedComponents: (components: Record<string, string[]>) => void
  setComponentSettings: (settings: any) => void
  setContentOverrides: (overrides: any) => void
  setSeo: (seo: any) => void

  setIsPickerOpen: (open: boolean) => void
  setPickerCategory: (category: string | null) => void
  setPickerSlotIndex: (index: number | null) => void

  // Actions
  handleSave: () => Promise<void>
  handleAiGenerate: () => Promise<void>
  handleGlobalAiGenerate: () => Promise<void>
  handleEject: () => Promise<void>
}

const StudioContext = createContext<StudioContextType | undefined>(undefined)

export function StudioProvider({ 
  children, 
  projectId, 
  initialConfig, 
  project 
}: { 
  children: React.ReactNode
  projectId: string
  initialConfig?: any
  project?: any 
}) {
  const [pages, setPages] = useState<string[]>(
    initialConfig?.selected_components_map 
      ? Object.keys(initialConfig.selected_components_map) 
      : ['Home']
  )
  const [flowMode, setFlowMode] = useState<'wizard' | 'builder'>('wizard')
  const [wizardStep, setWizardStep] = useState<'pages' | 'details' | 'colors' | 'typography' | 'cta' | 'complete'>('pages')
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null)

  const [step, setStep] = useState(1)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [activeTab, setActiveTab] = useState(initialConfig?.selected_components?.length > 0 ? "brand" : "structure")
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [isArchitectureVerified, setIsArchitectureVerified] = useState(initialConfig?.selected_components?.length > 0)

  // Avoid race condition: only save AFTER loading at least once
  const persistenceLoaded = React.useRef(false)

  // 1. Global Styles (Enhanced for dual-vector fonts)
  const [globalStyles, setGlobalStyles] = useState(initialConfig?.global_styles || {
    primary_color: '#000000',
    accent_color: '#18181b',
    font_family_heading: 'Inter',
    font_family_body: 'Inter',
    font_weight_heading: '900',
    font_head_cdn_url: '', // New: Headline CDN
    font_body_cdn_url: '', // New: Sub-head/Body CDN
    custom_font_family_heading: '', // New: Heading family override
    custom_font_family_body: '', // New: Body family override
    button_radius: 'none',
    button_style: 'solid',
    button_icon_id: 'arrow',
    button_icon_pos: 'right',
    button_icon_alignment: 'inside', // New: 'inside' | 'outside'
    button_custom_svg: '', // New: Manual SVG path vector
    text_alignment: 'left'
  })

  // 2. Structural State (Page-Aware)
  const [currentPage, setCurrentPage] = useState<string>('Home')
  const [selectedComponents, setSelectedComponents] = useState<Record<string, string[]>>(
    initialConfig?.selected_components_map || { 'Home': initialConfig?.selected_components || [] }
  )
  const [componentSettings, setComponentSettings] = useState<Record<string, any>>(initialConfig?.component_settings || {})

  // 3. Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerCategory, setPickerCategory] = useState<string | null>(null)
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null)

  // 4. Content Overrides
  const [contentOverrides, setContentOverrides] = useState(initialConfig?.content_overrides || {
    h1: '',
    description: '',
    email: '',
    phone: ''
  })

  // 5. SEO
  const [seo, setSeo] = useState(project?.config?.seo || {
    website_title: '',
    meta_description: '',
    target_keywords: ''
  })

  // 5. LocalStorage Persistence Logic (Load First)
  useEffect(() => {
    const storageKey = `studio_project_${projectId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.pages) setPages(data.pages)
        if (data.currentPage) setCurrentPage(data.currentPage)
        if (data.flowMode) setFlowMode(data.flowMode)
        if (data.wizardStep) setWizardStep(data.wizardStep)
        if (data.globalStyles) setGlobalStyles(data.globalStyles)
        if (data.selectedComponents) setSelectedComponents(data.selectedComponents)
        if (data.componentSettings) setComponentSettings(data.componentSettings)
        if (data.contentOverrides) setContentOverrides(data.contentOverrides)
        if (data.seo) setSeo(data.seo)
      } catch (err) {
        console.error('Failed to parse localStorage data', err)
      }
    }
    persistenceLoaded.current = true
  }, [projectId])

  // Save changes (only if loaded)
  useEffect(() => {
    if (!persistenceLoaded.current) return

    const storageKey = `studio_project_${projectId}`
    const data = {
      pages,
      currentPage,
      flowMode,
      wizardStep,
      globalStyles,
      selectedComponents,
      componentSettings,
      contentOverrides,
      seo
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [projectId, pages, currentPage, flowMode, wizardStep, globalStyles, selectedComponents, componentSettings, contentOverrides, seo])

  // Dual-Vector Font Injection Effect
  useEffect(() => {
    // 1. Headline Injection
    if (globalStyles.font_head_cdn_url) {
      const existingLink = document.getElementById('custom-head-font')
      if (existingLink) existingLink.remove()
      const link = document.createElement('link')
      link.id = 'custom-head-font'
      link.rel = 'stylesheet'
      link.href = globalStyles.font_head_cdn_url
      document.head.appendChild(link)
    }

    // 2. Body Injection
    if (globalStyles.font_body_cdn_url) {
      const existingLink = document.getElementById('custom-body-font')
      if (existingLink) existingLink.remove()
      const link = document.createElement('link')
      link.id = 'custom-body-font'
      link.rel = 'stylesheet'
      link.href = globalStyles.font_body_cdn_url
      document.head.appendChild(link)
    }
  }, [globalStyles.font_head_cdn_url, globalStyles.font_body_cdn_url])

  // Sync effect for project data (Enhanced for 15+ metadata fields)
  useEffect(() => {
    if (project && !initialConfig) {
       setContentOverrides((prev: any) => ({
        ...prev,
        ...project.config?.builder?.content_overrides,
        h1: prev.h1 || project.client_name || '',
        description: prev.description || project.description || '',
        brand_name: prev.brand_name || project.client_name || '',
        email: prev.email || project.client_email || '',
        phone: prev.phone || project.client_phone || ''
      }));
      
      if (project.config?.seo) {
        setSeo((prev: any) => ({ ...prev, ...project.config.seo }));
      }
    }
  }, [project, initialConfig])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await Promise.all([
        saveWebsiteConfig(projectId, {
          global_styles: globalStyles,
          selected_components_map: selectedComponents,
          // For legacy compatibility in build ejection
          selected_components: selectedComponents[currentPage] || [], 
          component_settings: componentSettings,
          content_overrides: contentOverrides,
          pages: pages
        }),
        saveSeoConfig(projectId, seo)
      ])
      toast.success('Architecture Synced to Blueprint')
    } catch (error) {
      toast.error('Sync failure')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiGenerate = async () => {
    const pageStack = selectedComponents[currentPage] || []
    const activeKey = pageStack[activeModuleIndex]
    if (!activeKey) return

    setIsAiGenerating(true)
    const toastId = toast.loading(`Summoning AI for ${activeKey}...`)

    try {
      const result = await generateAiContentForComponent(projectId, activeKey)
      if (result.success && result.data) {
        const { content, settings } = result.data
        setContentOverrides((prev: any) => ({ ...prev, ...content }))
        setComponentSettings((prev: any) => ({
          ...prev,
          [activeKey]: { ...(prev[activeKey] || {}), ...settings }
        }))
        toast.success(result.message, { id: toastId })
      }
    } catch (error: any) {
      toast.error(error.message || 'AI Generation failed', { id: toastId })
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleGlobalAiGenerate = async () => {
    setIsAiGenerating(true)
    const toastId = toast.loading("Projecting AI intelligence for the entire site...")

    try {
      const result = await generateAiWebsiteContent(projectId, {
        selected_components: selectedComponents[currentPage] || [],
        global_styles: globalStyles
      })

      if (result.success && result.data) {
        const { content, settings } = result.data
        setContentOverrides((prev: any) => ({ ...prev, ...content }))
        setComponentSettings((prev: any) => ({ ...prev, ...settings }))
        toast.success(result.message, { id: toastId })
      }
    } catch (error: any) {
      toast.error(error.message || 'Global AI Generation failed', { id: toastId })
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleEject = async () => {
    setIsGenerating(true)
    try {
      await handleSave()
      const result = await generateProjectZip(projectId)
      if (result.success && result.data) {
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/zip' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.fileName || 'Production_Build.zip'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Production build ejected')
      }
    } catch (error) {
      toast.error('Eject failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <StudioContext.Provider value={{
      projectId, project, step, activeModuleIndex, activeTab,
      isSaving, isGenerating, isAiGenerating, isArchitectureVerified,
      globalStyles, selectedComponents, componentSettings, contentOverrides, seo,
      pages, flowMode, wizardStep, activeComponentId, currentPage,
      isPickerOpen, pickerCategory, pickerSlotIndex,
      setPages, setFlowMode, setWizardStep, setActiveComponentId, setCurrentPage,
      setStep, setActiveModuleIndex, setActiveTab, setIsArchitectureVerified,
      setGlobalStyles, setSelectedComponents, setComponentSettings, setContentOverrides, setSeo,
      setIsPickerOpen, setPickerCategory, setPickerSlotIndex,
      handleSave, handleAiGenerate, handleGlobalAiGenerate, handleEject
    }}>
      {children}
    </StudioContext.Provider>
  )
}

export function useStudio() {
  const context = useContext(StudioContext)
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return context
}
