'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings2, 
  Layers, 
  Type, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Palette, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  ChevronRight,
  ChevronDown,
  GripVertical,
  Trash2,
  Monitor,
  Smartphone,
  Check
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { saveWebsiteConfig, generateProjectZip, saveSeoConfig } from '@/app/dashboard/projects/builder-actions'
import { toast } from 'sonner'
import { Globe } from 'lucide-react'
import { PendingButton } from '@/components/ui/pending-button'

interface WebsiteBuilderConfiguratorProps {
  projectId: string
  initialConfig?: any
  project?: any
}

export function WebsiteBuilderConfigurator({ projectId, initialConfig, project }: WebsiteBuilderConfiguratorProps) {
  const [step, setStep] = useState(1)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [viewportSize, setViewportSize] = useState<'desktop' | 'mobile'>('desktop')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewingComponent, setPreviewingComponent] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<any>(null)
  const [activeTab, setActiveTab] = useState(initialConfig ? "content" : "selection")

  // Sync tab when step moves to configuration
  useEffect(() => {
    if (step === 2) setActiveTab("content")
  }, [step])

  // 1. Global Styles State - High Contrast Defaults
  const [globalStyles, setGlobalStyles] = useState(initialConfig?.global_styles || initialConfig?.globalStyles || {
    primary_color: '#000000',
    accent_color: '#18181b',
    font_family_heading: 'Inter',
    font_family_body: 'Inter',
    font_weight_heading: '900',
    button_style: 'solid', 
    button_shadow: 'none',
    button_animation: 'scale',
    button_padding: 'standard',
    show_secondary_cta: true,
    text_alignment: 'left',
    font_size_h1: '48',
    font_size_h2: '32',
    font_size_body: '16'
  })

  // 2. Selected Components State
  const [selectedComponents, setSelectedComponents] = useState<string[]>(initialConfig?.selected_components || initialConfig?.selectedComponents || [])

  // 3. Component Settings State
  const [componentSettings, setComponentSettings] = useState<Record<string, any>>(initialConfig?.component_settings || initialConfig?.componentSettings || {})

  // 4. Global Content Overrides
  const [contentOverrides, setContentOverrides] = useState(initialConfig?.content_overrides || initialConfig?.contentOverrides || {
    h1: '',
    description: '',
    email: '',
    phone: ''
  })

  // 5. SEO Configuration State
  const [seo, setSeo] = useState({
    website_title: '',
    meta_description: '',
    target_keywords: ''
  })
  // Smart Pre-fill Effect
  useEffect(() => {
    if (project) {
      setContentOverrides((prev: any) => ({
        ...prev,
        h1: prev.h1 || project.client_name || '',
        description: prev.description || project.description || '',
        email: prev.email || project.client_email || '',
        phone: prev.phone || project.client_phone || ''
      }))

      // Initialize SEO state
      if (project.config?.seo) {
        const s = project.config.seo
        setSeo({
          website_title: s.website_title || '',
          meta_description: s.meta_description || '',
          target_keywords: s.target_keywords || ''
        })
      }
    }
  }, [project])

  const toggleComponent = (key: string) => {
    setSelectedComponents(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const setComponentInGroup = (prefix: string, key: string) => {
    setSelectedComponents(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key)
      }
      const filtered = prev.filter(k => !k.startsWith(prefix))
      return [...filtered, key]
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Save Website Builder Config
      const p1 = saveWebsiteConfig(projectId, {
        global_styles: globalStyles,
        selected_components: selectedComponents,
        component_settings: componentSettings,
        content_overrides: contentOverrides
      })

      // 2. Save SEO Config
      const p2 = saveSeoConfig(projectId, seo)

      await Promise.all([p1, p2])
      
      toast.success('Architecture & SEO Synced')
    } catch (error) {
      toast.error('Failed to sync state')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // 1. Sync latest state first
      await handleSave()
      
      // 2. Generate Ejected Bundle
      const result = await generateProjectZip(projectId)
      
      if (result.success && result.data) {
        // 3. Trigger Browser Download
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
        a.download = result.fileName || 'Project_Build.zip'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success('Production build ejected successfully')
      } else {
        toast.error('Build generation failed')
      }
    } catch (error) {
      console.error('Eject Error:', error)
      toast.error('Failed to eject production build')
    } finally {
      setIsGenerating(false)
    }
  }

  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex overflow-hidden select-none" style={{ fontFamily: mazzardFont }}>
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white border border-zinc-200 p-8 flex items-center gap-4 shadow-2xl">
               <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent animate-spin rounded-full" />
               <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Synchronizing Blueprint...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ARCHITECTURAL SIDEBAR */}
      <aside className="w-[380px] bg-[#fcfcfc] border-r border-zinc-200 flex flex-col shrink-0 z-20">
        <div className="p-8 border-b border-zinc-100">
           <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
                    <Settings2 className="w-4 h-4 text-zinc-400" />
                 </div>
                 <div>
                   <h1 className="text-sm font-black tracking-tight text-zinc-900">Studio</h1>
                   <p className="text-[11px] font-bold text-zinc-400 tracking-tight mt-0.5">Architect v2.1</p>
                 </div>
              </div>

              {/* Minimalist Progress (Inspired by User Image) */}
              <div className="relative px-2">
                 <div className="absolute top-[7px] left-0 right-0 h-[1px] bg-zinc-100" />
                 <div className="relative flex items-center justify-between">
                    {[1, 2, 3].map((s) => {
                       const isActive = step === s;
                       const isCompleted = step > s;
                       return (
                          <div key={s} className="flex flex-col items-center gap-2 relative z-10 w-full">
                             <div className={cn(
                               "w-3.5 h-3.5 rounded-full border-2 transition-all duration-500",
                               isCompleted ? "bg-emerald-500 border-emerald-500" : isActive ? "bg-white border-zinc-900" : "bg-white border-zinc-100"
                             )}>
                                {isCompleted && <Check className="w-2 h-2 text-white stroke-[4] mx-auto" />}
                             </div>
                             <span className={cn(
                                "text-[11px] font-black tracking-tight transition-colors",
                                isActive ? "text-zinc-900" : "text-zinc-400"
                             )}>
                                {s === 1 ? 'Design' : s === 2 ? 'Logic' : 'Eject'}
                             </span>
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
           <div className="px-8 pt-6">
              <TabsList className="w-full h-auto bg-transparent border-none p-0 flex justify-start gap-6">
                   {step === 1 && (
                    <TabsTrigger value="selection" className="p-0 h-auto bg-transparent border-none shadow-none text-[12px] font-black tracking-[0.05em] data-[state=active]:text-zinc-950 text-zinc-400 transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[2px] after:bg-zinc-950 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform">
                      Architecture
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="content" className="p-0 h-auto bg-transparent border-none shadow-none text-[12px] font-black tracking-[0.05em] data-[state=active]:text-zinc-950 text-zinc-400 transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[2px] after:bg-zinc-950 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform">
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="p-0 h-auto bg-transparent border-none shadow-none text-[12px] font-black tracking-[0.05em] data-[state=active]:text-zinc-950 text-zinc-400 transition-all relative after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[2px] after:bg-zinc-950 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform">
                    SEO
                  </TabsTrigger>
              </TabsList>
           </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-12 text-left">
                {step === 1 && (
                  <TabsContent value="selection" className="mt-0 space-y-12 outline-none">
                      {/* Global Brand Identity */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Palette className="w-3.5 h-3.5 text-zinc-400" />
                          <Label className="text-[12px] font-black text-zinc-900 tracking-tight">Brand Identity</Label>
                        </div>
                        
                        <div className="space-y-6 border-t border-zinc-100 pt-6">
                          {/* Colors */}
                          <div className="grid grid-cols-1 gap-4">
                           <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                              <Label className="text-[11px] font-bold text-zinc-400 tracking-tight italic">Primary Color</Label>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-zinc-900 tracking-tight tabular-nums">{globalStyles.primary_color}</span>
                                <input 
                                  type="color" 
                                  value={globalStyles.primary_color}
                                  onChange={(e) => setGlobalStyles({...globalStyles, primary_color: e.target.value})}
                                  className="w-8 h-8 rounded-none cursor-pointer bg-white border border-zinc-200 p-1"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                              <Label className="text-[11px] font-bold text-zinc-400 tracking-tight italic">Accent Color</Label>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-zinc-900 tracking-tight tabular-nums">{globalStyles.accent_color}</span>
                                <input 
                                  type="color" 
                                  value={globalStyles.accent_color}
                                  onChange={(e) => setGlobalStyles({...globalStyles, accent_color: e.target.value})}
                                  className="w-8 h-8 rounded-none cursor-pointer bg-white border border-zinc-200 p-1"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Typography */}
                          <div className="space-y-4">
                              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                 <Label className="text-[11px] font-bold text-zinc-400 tracking-tight italic">Heading Font</Label>
                                 <select 
                                   value={globalStyles.font_family_heading} 
                                   onChange={(e) => setGlobalStyles({...globalStyles, font_family_heading: e.target.value})}
                                   className="bg-transparent border-none text-[12px] font-black tracking-tight outline-none appearance-none cursor-pointer text-right text-zinc-900"
                                 >
                                   <option value="Inter">Inter</option>
                                   <option value="Outfit">Outfit</option>
                                   <option value="Cal Sans">Cal Sans</option>
                                 </select>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                 <Label className="text-[11px] font-bold text-zinc-400 tracking-tight italic">Body Font</Label>
                                 <select 
                                   value={globalStyles.font_family_body} 
                                   onChange={(e) => setGlobalStyles({...globalStyles, font_family_body: e.target.value})}
                                   className="bg-transparent border-none text-[12px] font-black tracking-tight outline-none appearance-none cursor-pointer text-right text-zinc-900"
                                 >
                                   <option value="Inter">Inter</option>
                                   <option value="Outfit">Outfit</option>
                                   <option value="Helvetica">Helvetica</option>
                                 </select>
                              </div>

                               <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-bold text-zinc-400 tracking-tight ml-1">H1</Label>
                                   <Input type="number" value={globalStyles.font_size_h1} onChange={(e) => setGlobalStyles({...globalStyles, font_size_h1: e.target.value})} className="h-8 bg-white border border-zinc-200 px-2 text-[12px] font-black text-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-none w-full" />
                                </div>
                                <div className="space-y-1">
                                   <Label className="text-[10px] font-bold text-zinc-400 tracking-tight ml-1">H2</Label>
                                   <Input type="number" value={globalStyles.font_size_h2} onChange={(e) => setGlobalStyles({...globalStyles, font_size_h2: e.target.value})} className="h-8 bg-white border border-zinc-200 px-2 text-[12px] font-black text-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-none w-full" />
                                </div>
                                <div className="space-y-1 text-right">
                                   <Label className="text-[10px] font-bold text-zinc-400 tracking-tight mr-1">Body</Label>
                                   <Input type="number" value={globalStyles.font_size_body} onChange={(e) => setGlobalStyles({...globalStyles, font_size_body: e.target.value})} className="h-8 bg-white border border-zinc-200 px-2 text-[12px] font-black text-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-none text-right w-full" />
                                </div>
                              </div>
                          </div>

                          {/* Button Style */}
                          <div className="space-y-4 pt-4">
                             <Label className="text-[11px] font-black text-zinc-400 tracking-tight">Button Foundation</Label>
                             <div className="flex gap-4">
                                {['solid', 'outline', 'glass'].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => setGlobalStyles({...globalStyles, button_style: s})}
                                    className={cn(
                                      "text-[12px] font-black tracking-[0.05em] transition-all",
                                      globalStyles.button_style === s ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                  >
                                    {s}
                                  </button>
                                ))}
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-zinc-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-zinc-400" />
                            <Label className="text-[12px] font-black text-zinc-900 tracking-tight">Structure</Label>
                          </div>
                          {selectedComponents.length > 0 && (
                            <span className="text-[10px] font-black text-zinc-400 tracking-tight">
                              {selectedComponents.length} Modules
                            </span>
                          )}
                        </div>
                        
                        {selectedComponents.length === 0 ? (
                          <p className="text-[10px] font-bold text-zinc-400 tracking-tight leading-relaxed py-4 italic">
                             Begin by selecting modules on the canvas
                          </p>
                        ) : (
                          <Reorder.Group axis="y" values={selectedComponents} onReorder={setSelectedComponents} className="space-y-1">
                             {selectedComponents.map((key) => (
                               <Reorder.Item 
                                 key={key} 
                                 value={key}
                                 className="py-2 flex items-center justify-between group/item border-b border-zinc-100 last:border-0"
                               >
                                  <div className="flex items-center gap-3">
                                     <GripVertical className="w-3 h-3 text-zinc-400 cursor-grab active:cursor-grabbing" />
                                     <span className="text-[12px] font-black text-zinc-900 tracking-tight">{(COMPONENT_TEMPLATES as any)[key]?.name}</span>
                                  </div>
                                  <button 
                                    onClick={() => toggleComponent(key)}
                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                  >
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </Reorder.Item>
                             ))}
                          </Reorder.Group>
                        )}
                      </div>
                  </TabsContent>
                )}


               <TabsContent value="content" className="mt-0 space-y-10 outline-none">
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <Label className="text-[11px] font-black text-zinc-400 tracking-tight ml-1">Main Headline</Label>
                         <Input 
                           value={contentOverrides.h1 || ''}
                           onChange={(e) => setContentOverrides({...contentOverrides, h1: e.target.value})}
                           placeholder="Core Objective"
                           className="h-11 bg-[#fafafa] border border-zinc-100 px-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all placeholder:text-zinc-200 rounded-none shadow-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[11px] font-black text-zinc-400 tracking-tight ml-1">Email Contact</Label>
                         <Input 
                           value={contentOverrides.email || ''}
                           onChange={(e) => setContentOverrides({...contentOverrides, email: e.target.value})}
                           placeholder="mail@production.io"
                           className="h-11 bg-[#fafafa] border border-zinc-100 px-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all placeholder:text-zinc-200 rounded-none shadow-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[11px] font-black text-zinc-400 tracking-tight ml-1">Description</Label>
                         <textarea 
                           value={contentOverrides.description || ''}
                           onChange={(e) => setContentOverrides({...contentOverrides, description: e.target.value})}
                           placeholder="Technical synopsis..."
                           className="min-h-[100px] w-full bg-[#fafafa] border border-zinc-100 p-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all outline-none resize-none placeholder:text-zinc-200 rounded-none shadow-none leading-relaxed"
                        />
                     </div>
                  </div>
               </TabsContent>

                <TabsContent value="seo" className="mt-0 space-y-10 outline-none">
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <Label className="text-[11px] font-black text-zinc-400 tracking-tight ml-1">Meta Title</Label>
                        <Input 
                           value={seo.website_title}
                           onChange={(e) => setSeo({...seo, website_title: e.target.value})}
                           placeholder="SEO Primary Vector"
                           className="h-11 bg-[#fafafa] border border-zinc-100 px-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all placeholder:text-zinc-200 rounded-none shadow-none"
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <Label className="text-[11px] font-black text-zinc-400 tracking-tight ml-1">Meta Description</Label>
                        <textarea 
                           value={seo.meta_description}
                           onChange={(e) => setSeo({...seo, meta_description: e.target.value})}
                           placeholder="Abstract synopsis for crawlers..."
                           className="min-h-[120px] w-full bg-[#fafafa] border border-zinc-100 p-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all outline-none resize-none placeholder:text-zinc-200 rounded-none shadow-none leading-relaxed"
                        />
                     </div>
 
                     <div className="space-y-2">
                        <Label className="text-[11px] font-black text-zinc-400 tracking-tight ml-1">Keywords</Label>
                        <Input 
                           value={seo.target_keywords}
                           onChange={(e) => setSeo({...seo, target_keywords: e.target.value})}
                           placeholder="Vector_1, Vector_2, Vector_3"
                           className="h-11 bg-[#fafafa] border border-zinc-100 px-4 text-[12px] font-black tracking-tight text-zinc-900 focus:bg-white focus:border-zinc-950 transition-all placeholder:text-zinc-200 rounded-none shadow-none"
                        />
                     </div>
                  </div>
                </TabsContent>
            </div>
            
            <div className="p-8 bg-white border-t border-zinc-100 space-y-4">
               <PendingButton 
                 loading={isSaving} 
                 onClick={handleSave} 
                 className="w-full h-11 bg-zinc-950 text-white border border-zinc-200 rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all"
               >
                  Sync Architecture
               </PendingButton>
               
               {step === 1 && (
                 <Button 
                   disabled={selectedComponents.length === 0}
                   onClick={() => setStep(2)}
                   className="w-full h-11 bg-zinc-950 text-white rounded-none border border-zinc-200 text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                 >
                    Configure Logic <ChevronRight className="w-4 h-4" />
                  </Button>
               )}
            </div>
        </Tabs>
      </aside>

      {/* 2. CONFIGURATION CANVAS */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa] relative scroll-smooth custom-scrollbar">
         {step === 1 && (
            <div className="relative z-10 px-20 py-24 pb-40">
               {/* Canvas Grid Overlay */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
               
               <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {/* 2.1 Refined Header */}
               <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3 text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">
                     <Layers className="w-3.5 h-3.5" />
                     Blueprint System
                  </div>
                  <h2 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic">Select Modules</h2>
                  <p className="text-zinc-400 font-black text-[11px] uppercase tracking-widest max-w-xl leading-relaxed">Assemble your technical blueprint by selecting the architectural units for your application.</p>
               </div>

               {/* 2.1.2 Minimalist Selection Progress (Inspired by Reference) */}
               <div className="py-12 border-y border-zinc-200">
                  <div className="relative flex items-center justify-between px-12">
                     <div className="absolute top-[7px] left-0 right-0 h-[1px] bg-zinc-200" />
                     {['NAV_', 'HERO_', 'FEATURES_', 'CONTACT_', 'FOOTER_'].map((prefix, i) => {
                        const isSelected = selectedComponents.some(k => k.startsWith(prefix));
                        const label = prefix === 'NAV_' ? 'Navigation' : prefix === 'HERO_' ? 'Hero' : prefix === 'FEATURES_' ? 'Features' : prefix === 'CONTACT_' ? 'Interaction' : 'Footer';
                        
                        return (
                           <div key={prefix} className="flex flex-col items-center gap-4 relative z-10 w-full">
                              <div className={cn(
                                 "w-3.5 h-3.5 rounded-full border-2 transition-all duration-700",
                                 isSelected ? "bg-emerald-500 border-emerald-500" : "bg-white border-zinc-200"
                              )}>
                                 {isSelected && <Check className="w-2 h-2 text-white stroke-[4] mx-auto" />}
                              </div>
                              <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest transition-colors duration-500",
                                 isSelected ? "text-zinc-900" : "text-zinc-400"
                              )}>
                                 {label}
                              </span>
                           </div>
                        )
                     })}
                  </div>
               </div>

                {/* 2.2 Minimalist Module Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-16 relative pb-20">
                  {[
                    { title: 'Navigation', prefix: 'NAV_', multiple: false },
                    { title: 'Hero Section', prefix: 'HERO_', multiple: false },
                    { title: 'Feature Modules', prefix: 'FEATURES_', multiple: true },
                    { title: 'Interaction', prefix: 'CONTACT_', multiple: true },
                    { title: 'Footer', prefix: 'FOOTER_', multiple: false },
                  ].map((group) => (
                    <div key={group.title} className="text-left flex flex-col group/card bg-white border border-zinc-200 p-8 shadow-sm transition-all hover:bg-zinc-50/10">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
                           <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">
                             {group.title}
                           </h3>
                           {group.multiple && <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Multi-Select</span>}
                        </div>
                       <div className="space-y-4">
                          {Object.entries(COMPONENT_TEMPLATES as Record<string, any>)
                            .filter(([key]) => key.startsWith(group.prefix))
                            .map(([key, template]) => (
                              <button 
                                 key={key}
                                 onMouseDown={() => {
                                   const timer = setTimeout(() => setPreviewingComponent(key), 500)
                                   setLongPressTimer(timer)
                                 }}
                                 onMouseUp={() => {
                                   if (longPressTimer) clearTimeout(longPressTimer)
                                 }}
                                 onMouseLeave={() => {
                                   if (longPressTimer) clearTimeout(longPressTimer)
                                 }}
                                 onClick={() => group.multiple ? toggleComponent(key) : setComponentInGroup(group.prefix, key)}
                                 className={cn(
                                   "w-full flex items-center justify-between py-3 px-4 border transition-all text-left group/btn",
                                   selectedComponents.includes(key) 
                                     ? "border-zinc-200 bg-zinc-950 text-white" 
                                     : "border-zinc-200 text-zinc-500 hover:bg-zinc-100"
                                 )}
                               >
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-black tracking-tight leading-none uppercase">{template.name}</span>
                                    {!selectedComponents.includes(key) && (
                                       <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                          Hold to inspect
                                       </span>
                                    )}
                                  </div>
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all",
                                    selectedComponents.includes(key) ? "bg-emerald-400" : "bg-zinc-200"
                                  )} />
                               </button>
                            ))}
                       </div>
                    </div>
                  ))}

                  {/* Minimalist Preview Overlay */}
                  <AnimatePresence>
                    {previewingComponent && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewingComponent(null)}
                        className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-8 lg:p-24"
                      >
                         <motion.div 
                           initial={{ scale: 0.98 }}
                           animate={{ scale: 1 }}
                           exit={{ scale: 0.98 }}
                           className="w-full max-w-7xl bg-white border border-zinc-200 overflow-hidden shadow-none relative flex flex-col h-full rounded-none"
                           onClick={(e) => e.stopPropagation()}
                         >
                             {/* Preview Header */}
                             <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                                <div className="space-y-1">
                                   <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Blueprint Inspection</h4>
                                   <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{(COMPONENT_TEMPLATES as any)[previewingComponent]?.name}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-zinc-50" onClick={() => setPreviewingComponent(null)}>
                                   <Trash2 className="w-4 h-4 text-zinc-900" />
                                </Button>
                             </div>

                             <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-zinc-50/10">
                               {(() => {
                                 const template = (COMPONENT_TEMPLATES as any)[previewingComponent];
                                 if (!template) return null;
                                 return template.preview(globalStyles, contentOverrides, componentSettings[previewingComponent] || {});
                               })()}
                            </div>

                             <div className="p-6 border-t border-zinc-50 flex items-center justify-between bg-white">
                                <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest italic flex items-center gap-2">
                                   <Sparkles className="w-3 h-3" /> Technical Module Specification
                                </p>
                                <Button 
                                  className="h-12 px-8 bg-zinc-950 text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3"
                                  onClick={() => {
                                    const prefix = previewingComponent.split('_')[0] + '_'
                                    const isMultiple = ['FEATURES_', 'CONTACT_'].includes(prefix)
                                    if (isMultiple) toggleComponent(previewingComponent)
                                    else setComponentInGroup(prefix, previewingComponent)
                                    setPreviewingComponent(null)
                                  }}
                                >
                                   Deploy Module
                                </Button>
                             </div>
                         </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </div>
          </div>
        )}

        {step === 2 && (
           <div className="flex-1 flex flex-col min-h-0 bg-white text-left">
              {/* Minimalist Horizontal Step Navigator */}
              <div className="h-12 bg-white border-b border-zinc-50 flex items-center px-10 gap-8 overflow-x-auto no-scrollbar z-10">
                 {selectedComponents.map((key, idx) => {
                   const template = (COMPONENT_TEMPLATES as any)[key]
                   return (
                     <button
                       key={key}
                       onClick={() => setActiveModuleIndex(idx)}
                       className={cn(
                         "flex items-center gap-3 whitespace-nowrap transition-all relative h-full",
                         activeModuleIndex === idx ? "opacity-100" : "opacity-30 hover:opacity-100"
                       )}
                     >
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors",
                          activeModuleIndex === idx ? "text-zinc-900" : "text-zinc-400"
                        )}>
                           {template?.name || key}
                        </span>
                        {activeModuleIndex === idx && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900" />
                        )}
                     </button>
                   )
                 })}
              </div>
              {/* Split Configuration Engine */}
              <div className="flex-1 flex overflow-hidden">
                 {/* 2A. Module Inspector */}
                 <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-r border-zinc-200 bg-white flex flex-col p-8 overflow-y-auto z-10 text-left">
                     <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-none shadow-xl">
                              <Sparkles className="w-5 h-5 text-emerald-400" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Unit Architecture</span>
                              <h3 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic">
                                {(COMPONENT_TEMPLATES as any)[selectedComponents[activeModuleIndex]]?.name}
                              </h3>
                           </div>
                        </div>
                     </div>

                    <div className="space-y-12">
                       {/* 1. Layout Unit */}
                        <div className="space-y-6 text-left">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-none">
                                 <Layers className="w-4 h-4 text-zinc-400" />
                              </div>
                              <Label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Structural Layout</Label>
                           </div>
                          <div className="grid grid-cols-1 gap-2.5">
                             {[
                                { id: 'standard', name: 'Standard Layout' },
                                { id: 'split-reversed', name: 'Mirrored Design' },
                                { id: 'contained', name: 'Contained View' },
                                { id: 'full-height', name: 'Fullscreen Stage' }
                             ].map(v => (
                                <button
                                  key={v.id}
                                  onClick={() => setComponentSettings(prev => ({
                                    ...prev, 
                                    [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], layout_variant: v.id }
                                  }))}
                                  className={cn(
                                     "w-full h-12 px-6 flex items-center justify-between transition-all border rounded-none text-left",
                                     (componentSettings[selectedComponents[activeModuleIndex]]?.layout_variant || 'standard') === v.id
                                       ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                                       : "bg-[#fafafa] text-zinc-400 border-zinc-100 hover:border-zinc-200 hover:bg-zinc-100/50"
                                   )}
                                 >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{v.name}</span>
                                    <div className={cn("w-1.5 h-1.5 rounded-none", (componentSettings[selectedComponents[activeModuleIndex]]?.layout_variant || 'standard') === v.id ? "bg-emerald-400" : "bg-zinc-200")} />
                                 </button>
                             ))}
                          </div>
                       </div>

                       {/* 2. Weight Scale */}
                       <div className="space-y-6 text-left">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-none">
                                 <Type className="w-4 h-4 text-zinc-400" />
                              </div>
                              <Label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Typography Hierarchy</Label>
                           </div>
                          <div className="flex bg-zinc-100/50 p-1 border border-zinc-200/50 rounded-none gap-1">
                              {[
                                { id: 'h1', label: 'Primary' },
                                { id: 'h2', label: 'Secondary' },
                                { id: 'h3', label: 'Tertiary' }
                              ].map(h => (
                                <button
                                  key={h.id}
                                  onClick={() => setComponentSettings(prev => ({
                                    ...prev, 
                                    [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], hierarchy: h.id }
                                  }))}
                                  className={cn(
                                    "flex-1 h-9 rounded-none text-[11px] font-black transition-all",
                                    (componentSettings[selectedComponents[activeModuleIndex]]?.hierarchy || 'h1') === h.id
                                      ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                                      : "text-zinc-400 hover:text-zinc-600"
                                  )}
                                >
                                   {h.label}
                                </button>
                              ))}
                          </div>
                       </div>

                       {/* 3. Component Style (Contextual) */}
                       {['FEATURES_', 'TESTIMONIALS_', 'SERVICES_'].some(p => selectedComponents[activeModuleIndex]?.startsWith(p)) && (
                           <div className="space-y-6 text-left">
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-none">
                                    <Settings2 className="w-4 h-4 text-zinc-400" />
                                 </div>
                                 <Label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Module Aesthetics</Label>
                              </div>
                             <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'standard', label: 'Classic' },
                                  { id: 'glass', label: 'Glass' },
                                  { id: 'minimal', label: 'Flat' }
                                ].map(s => (
                                   <button
                                     key={s.id}
                                     onClick={() => setComponentSettings(prev => ({
                                       ...prev, 
                                       [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], card_style: s.id }
                                     }))}
                                     className={cn(
                                       "h-10 border rounded-none flex items-center justify-center text-[10px] font-black tracking-tight transition-all",
                                       (componentSettings[selectedComponents[activeModuleIndex]]?.card_style || 'standard') === s.id
                                         ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                         : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                     )}
                                   >
                                      {s.label}
                                   </button>
                                ))}
                             </div>
                          </div>
                       )}

                        {/* 4. CTA Configuration (Contextual) */}
                         {['HERO_', 'FEATURES_', 'CONTACT_'].some(p => selectedComponents[activeModuleIndex]?.startsWith(p)) && (
                            <div className="space-y-8 pt-12 border-t border-zinc-100/50">
                               <div className="flex items-center gap-3 mb-6">
                                  <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-none">
                                     <Sparkles className="w-4 h-4 text-zinc-300" />
                                  </div>
                                  <Label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Conversion Units</Label>
                               </div>
                              <div className="space-y-6">
                                  <div className="flex items-center justify-between py-6 border-b border-zinc-50 group/field">
                                     <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">Primary Action Text</Label>
                                     <div className="w-48 shrink-0">
                                        <Input 
                                           value={componentSettings[selectedComponents[activeModuleIndex]]?.cta_primary || ''}
                                           onChange={(e) => setComponentSettings(prev => ({
                                             ...prev, 
                                             [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], cta_primary: e.target.value }
                                           }))}
                                           placeholder="e.g., Get Started"
                                           className="h-11 bg-[#fafafa] border border-zinc-100 rounded-none px-4 text-[11px] font-black uppercase tracking-widest text-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-200"
                                        />
                                     </div>
                                  </div>
                                  <div className="flex items-center justify-between py-6 border-b border-zinc-50 group/field">
                                     <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">Enable Secondary CTA</Label>
                                     <button 
                                        onClick={() => setComponentSettings(prev => ({
                                          ...prev, 
                                          [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], cta_count: (componentSettings[selectedComponents[activeModuleIndex]]?.cta_count === 2 ? 1 : 2) }
                                        }))}
                                        className={cn(
                                           "w-12 h-6 rounded-none transition-all relative border p-1",
                                           componentSettings[selectedComponents[activeModuleIndex]]?.cta_count === 2 ? "bg-emerald-500 border-emerald-600" : "bg-zinc-100 border-zinc-200"
                                        )}
                                     >
                                        <div className={cn(
                                           "w-3.5 h-3.5 rounded-none transition-all shadow-sm",
                                           componentSettings[selectedComponents[activeModuleIndex]]?.cta_count === 2 ? "ml-auto bg-white" : "ml-0 bg-white"
                                        )} />
                                     </button>
                                  </div>
                                 {componentSettings[selectedComponents[activeModuleIndex]]?.cta_count === 2 && (
                                    <div className="flex items-center justify-between py-6 border-b border-zinc-50 group/field animate-in fade-in slide-in-from-top-2">
                                       <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">Secondary Action Text</Label>
                                       <div className="w-48 shrink-0">
                                          <Input 
                                             value={componentSettings[selectedComponents[activeModuleIndex]]?.cta_secondary || ''}
                                             onChange={(e) => setComponentSettings(prev => ({
                                               ...prev, 
                                               [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], cta_secondary: e.target.value }
                                             }))}
                                             placeholder="e.g., Learn More"
                                             className="h-11 bg-[#fafafa] border border-zinc-100 rounded-none px-4 text-[11px] font-black uppercase tracking-widest text-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-200"
                                          />
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}

                        {/* 5. Cosmetic Layer */}
                        <div className="space-y-8 pt-12 border-t border-zinc-100/50">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-none">
                                 <Palette className="w-4 h-4 text-zinc-300" />
                              </div>
                              <Label className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Surface Cosmetics</Label>
                           </div>
                           <div className="space-y-8">
                               <div className="flex items-center justify-between py-6 border-b border-zinc-50 group/field">
                                  <div className="flex flex-col">
                                     <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">Background Unit</Label>
                                     <span className="text-[8px] font-black text-zinc-300 uppercase mt-1">{componentSettings[selectedComponents[activeModuleIndex]]?.bg_color || '#FFFFFF'}</span>
                                  </div>
                                  <div className="w-12 h-12 border border-zinc-100 p-1 bg-white flex items-center justify-center">
                                     <input 
                                       type="color" 
                                       value={componentSettings[selectedComponents[activeModuleIndex]]?.bg_color || '#ffffff'}
                                       onChange={(e) => setComponentSettings(prev => ({
                                         ...prev, 
                                         [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], bg_color: e.target.value, bg_gradient: '' }
                                       }))}
                                       className="w-full h-full rounded-none cursor-pointer bg-transparent border-none p-0"
                                     />
                                  </div>
                               </div>
                               <div className="flex flex-col py-6 border-b border-zinc-50 group/field">
                                  <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors mb-4">Texture Presets</Label>
                                  <div className="grid grid-cols-5 gap-3">
                                     {[
                                       'linear-gradient(to right, #000000, #434343)',
                                       'linear-gradient(to right, #ee9ca7, #ffdde1)',
                                       'linear-gradient(to right, #2193b0, #6dd5ed)',
                                       'linear-gradient(to right, #cc2b5e, #753a88)',
                                       'none'
                                     ].map((grad, i) => (
                                        <button 
                                          key={i}
                                          onClick={() => setComponentSettings(prev => ({
                                            ...prev, 
                                            [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], bg_gradient: grad === 'none' ? '' : grad }
                                          }))}
                                          className={cn(
                                            "w-full aspect-square rounded-none transition-all border",
                                            (componentSettings[selectedComponents[activeModuleIndex]]?.bg_gradient || 'none') === grad ? "border-zinc-950 shadow-md scale-105" : "border-zinc-100"
                                          )}
                                          style={{ backgroundImage: grad !== 'none' ? grad : 'none', backgroundColor: grad === 'none' ? '#fafafa' : 'transparent' }}
                                        />
                                     ))}
                                  </div>
                               </div>
                           </div>
                        </div>

                        {/* 6. Dynamics */}
                        <div className="flex items-center justify-between py-6 group/field">
                           <Label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover/field:text-zinc-950 transition-colors">Motion Engine</Label>
                           <div className="w-40 shrink-0">
                               <select 
                                 value={componentSettings[selectedComponents[activeModuleIndex]]?.animation || 'fade'} 
                                 onChange={(e) => setComponentSettings(prev => ({
                                   ...prev, 
                                   [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], animation: e.target.value }
                                 }))}
                                 className="w-full bg-[#fafafa] border border-zinc-100 h-10 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all appearance-none cursor-pointer rounded-none"
                               >
                                 <option value="none">Disabled</option>
                                 <option value="fade">Gentle Fade</option>
                                 <option value="slide-up">Slide Entrance</option>
                                 <option value="zoom">Scale Reveal</option>
                               </select>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 2B. Large Scale Sandbox */}
                  <div className="flex-1 bg-[#f8f8f8] flex flex-col h-full overflow-hidden p-6 lg:p-10">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                           <button 
                             onClick={() => setViewportSize('desktop')}
                             className={cn(
                               "text-[10px] font-black uppercase tracking-widest transition-all",
                               viewportSize === 'desktop' ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-300 hover:text-zinc-400"
                             )}
                           >
                             Desktop View
                           </button>
                           <button 
                             onClick={() => setViewportSize('mobile')}
                             className={cn(
                               "text-[10px] font-black uppercase tracking-widest transition-all",
                               viewportSize === 'mobile' ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-300 hover:text-zinc-400"
                             )}
                           >
                             Mobile View
                           </button>
                        </div>

                        <div className="flex items-center gap-6">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Scale</span>
                           <div className="flex items-center gap-4">
                              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="text-zinc-300 hover:text-zinc-900 transition-colors font-black">-</button>
                              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest tabular-nums w-8 text-center">{zoomLevel}%</span>
                              <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="text-zinc-300 hover:text-zinc-900 transition-colors font-black">+</button>
                           </div>
                        </div>
                     </div>
                     
                      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-zinc-50/50">
                         <div 
                            className={cn(
                               "bg-white border border-zinc-200 shadow-[24px_24px_60px_-15px_rgba(0,0,0,0.1)] rounded-none overflow-hidden transition-all duration-700 relative",
                               viewportSize === 'mobile' ? "w-[390px] h-[80%] my-auto" : "w-full h-full"
                            )}
                            style={{ 
                               transform: `scale(${zoomLevel / 100})`, 
                               transformOrigin: viewportSize === 'mobile' ? 'top center' : 'center center',
                               minHeight: viewportSize === 'mobile' ? '844px' : '100%',
                               width: viewportSize === 'mobile' ? '390px' : '100%'
                            }}
                         >
                            <div className="absolute inset-0 overflow-auto no-scrollbar scroll-smooth p-0 bg-white">
                                 <div className="origin-top transition-all duration-700 min-h-full">
                                   {(() => {
                                     const key = selectedComponents[activeModuleIndex];
                                     const template = (COMPONENT_TEMPLATES as any)[key];
                                     if (!template) {
                                       return (
                                         <div className="h-full flex items-center justify-center p-20 text-center bg-white">
                                           <div className="space-y-4">
                                             <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-none mx-auto flex items-center justify-center">
                                                <Layers className="w-6 h-6 text-zinc-300" />
                                             </div>
                                             <p className="text-sm font-black text-zinc-900 uppercase tracking-widest">No Active Blueprint</p>
                                             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select a module to begin configuration</p>
                                           </div>
                                         </div>
                                       );
                                     }
                                     try {
                                       const preview = template.preview(globalStyles, contentOverrides, componentSettings[key] || {});
                                       if (!preview) return <div className="p-20 text-zinc-300 font-black uppercase text-[10px] tracking-widest">Preview Component Empty</div>;
                                       return preview;
                                     } catch (err) {
                                       console.error('Preview error:', err);
                                       return (
                                         <div className="p-20 text-center space-y-4 bg-white">
                                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-none mx-auto flex items-center justify-center">
                                               <Sparkles className="w-6 h-6 text-rose-300" />
                                            </div>
                                            <p className="text-rose-500 font-black uppercase text-[10px] tracking-widest">Compilation Error</p>
                                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest max-w-[200px] mx-auto">The architectural unit encountered a rendering fault during preview generation.</p>
                                         </div>
                                       );
                                     }
                                   })()}
                                </div>
                            </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>
          )}

        {step === 3 && (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-16 animate-in zoom-in-95 duration-1000 bg-white">
             <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-none flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
             </div>
             <div className="space-y-4">
                <h2 className="text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-[0.9]">Ready to<br/>Eject</h2>
                <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.3em]">Architectural Compilation Successful</p>
             </div>

             <div className="flex gap-12 w-full max-w-2xl justify-center text-left">
                <div className="space-y-2 border-l border-zinc-100 pl-8">
                   <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Module Manifest</p>
                   <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{selectedComponents.length} Units Compiled</p>
                </div>
                <div className="space-y-2 border-l border-zinc-100 pl-8">
                   <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Theme Context</p>
                   <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Active Style Tokens Integrated</p>
                </div>
             </div>

             <PendingButton 
               loading={isGenerating} 
               onClick={handleGenerate} 
               className="h-16 px-16 bg-zinc-950 text-white rounded-none text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-4"
             >
                <Download className="w-5 h-5 text-emerald-400" />
                Initialize Ejection
             </PendingButton>
          </div>
        )}

        {/* Action Infrastructure Footer */}
        <footer className="h-24 border-t border-zinc-50 bg-white flex items-center justify-between px-12 z-30">
           <Button
             variant="ghost"
             onClick={() => {
                if (step === 2) {
                   if (activeModuleIndex > 0) setActiveModuleIndex(activeModuleIndex - 1)
                   else setStep(1)
                } else if (step === 3) setStep(2)
                else window.location.reload()
             }}
             className="h-10 px-6 text-[10px] font-black text-zinc-300 hover:text-zinc-900 transition-colors uppercase tracking-widest"
           >
              {step === 1 ? "Discard" : "Previous"}
           </Button>
           
           <div className="flex items-center gap-8">
              {step === 1 ? (
                <Button
                  disabled={selectedComponents.length === 0}
                  onClick={() => setStep(2)}
                  className="h-12 px-12 bg-zinc-950 text-white font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all rounded-none border border-zinc-200"
                >
                   Configure Engine
                </Button>
              ) : step === 2 ? (
                <Button
                  onClick={() => {
                    if (activeModuleIndex < selectedComponents.length - 1) {
                       setActiveModuleIndex(activeModuleIndex + 1)
                    } else {
                       handleSave()
                       setStep(3)
                    }
                  }}
                  className="h-12 px-12 bg-zinc-950 text-white font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 rounded-none border border-zinc-200"
                >
                   {activeModuleIndex < selectedComponents.length - 1 ? (
                     <>Next Module <ChevronRight className="w-4 h-4 opacity-30" /></>
                   ) : (
                     <>Finalize Build</>
                   )}
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(1)}
                  className="h-12 px-12 bg-white border border-zinc-100 text-zinc-900 font-black text-[11px] uppercase tracking-widest hover:bg-zinc-50 transition-all rounded-none"
                >
                   Reset Studio
                </Button>
              )}
           </div>
         </footer>
      </main>
    </div>
  )
}
