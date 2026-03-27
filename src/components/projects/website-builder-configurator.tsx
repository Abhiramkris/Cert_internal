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
  Image as ImageIcon,
  ChevronRight,
  ChevronDown
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
import { motion, AnimatePresence } from 'framer-motion'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { saveWebsiteConfig, generateProjectZip } from '@/app/dashboard/projects/builder-actions'
import { toast } from 'sonner'
import { PendingButton } from '@/components/ui/pending-button'

interface WebsiteBuilderConfiguratorProps {
  projectId: string
  initialConfig?: any
  project?: any
}

export function WebsiteBuilderConfigurator({ projectId, initialConfig, project }: WebsiteBuilderConfiguratorProps) {
  const [step, setStep] = useState(1)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewingComponent, setPreviewingComponent] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<any>(null)

  // 1. Global Styles State - High Contrast Defaults
  const [globalStyles, setGlobalStyles] = useState(initialConfig?.globalStyles || {
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
  const [selectedComponents, setSelectedComponents] = useState<string[]>(initialConfig?.selectedComponents || [])

  // 3. Component Settings State
  const [componentSettings, setComponentSettings] = useState<Record<string, any>>(initialConfig?.componentSettings || {})

  // 4. Global Content Overrides
  const [contentOverrides, setContentOverrides] = useState(initialConfig?.contentOverrides || {
    h1: '',
    description: '',
    email: '',
    phone: ''
  })

  // Smart Pre-fill Effect
  useEffect(() => {
    if (project) {
      setContentOverrides((prev: any) => ({
        ...prev,
        h1: prev.h1 || project.seo_config?.title || project.name || '',
        description: prev.description || project.seo_config?.meta_description || project.description || '',
        email: prev.email || project.client_email || '',
        phone: prev.phone || project.client_phone || ''
      }))
    }
  }, [project])

  const toggleComponent = (key: string) => {
    setSelectedComponents(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const setComponentInGroup = (prefix: string, key: string) => {
    setSelectedComponents(prev => {
      const filtered = prev.filter(k => !k.startsWith(prefix))
      return [...filtered, key]
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveWebsiteConfig(projectId, {
        global_styles: globalStyles,
        selected_components: selectedComponents,
        component_settings: componentSettings,
        content_overrides: contentOverrides
      })
      toast.success('Architecture Synced')
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

  return (
    <div className="flex h-full w-full bg-zinc-50/50 overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* 1. Left Sidebar: Refined Dashboard Navigation */}
      <aside className="w-[320px] lg:w-[350px] border-r border-zinc-200 bg-white flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
        <div className="p-6 border-b border-zinc-100">
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-950 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                 <Settings2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-zinc-900">Site Architect</h1>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Configuration Engine</p>
              </div>
           </div>
        </div>

        <Tabs defaultValue="global" className="flex-1 flex flex-col overflow-hidden">
           <div className="px-6 py-4">
              <TabsList className="w-full h-10 bg-zinc-100/80 rounded-lg p-1 border border-zinc-200/50">
                 <TabsTrigger value="global" className="flex-1 rounded-md text-[12px] font-semibold data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm transition-all">Theme</TabsTrigger>
                 <TabsTrigger value="content" className="flex-1 rounded-md text-[12px] font-semibold data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm transition-all">Content</TabsTrigger>
              </TabsList>
           </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 text-left">
                <TabsContent value="global" className="mt-0 space-y-8 outline-none">
                   {/* Colors */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Palette className="w-4 h-4 text-zinc-400" />
                         <Label className="text-[12px] font-bold text-zinc-950">Master Palette</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-2">
                            <div className="group relative h-14 rounded-xl border border-zinc-200 p-1 bg-white hover:border-zinc-400 transition-all">
                               <input 
                                 type="color" 
                                 value={globalStyles.primary_color} 
                                 onChange={(e) => setGlobalStyles({...globalStyles, primary_color: e.target.value})}
                                 className="absolute inset-0 w-full h-full border-none cursor-pointer p-0 opacity-0 z-10"
                               />
                               <div className="w-full h-full rounded-lg shadow-inner border border-black/5" style={{ backgroundColor: globalStyles.primary_color }} />
                            </div>
                            <p className="text-[10px] font-semibold text-zinc-500 text-center uppercase tracking-tight">Primary Base</p>
                         </div>
                         <div className="space-y-2">
                            <div className="group relative h-14 rounded-xl border border-zinc-200 p-1 bg-white hover:border-zinc-400 transition-all">
                               <input 
                                 type="color" 
                                 value={globalStyles.accent_color} 
                                 onChange={(e) => setGlobalStyles({...globalStyles, accent_color: e.target.value})}
                                 className="absolute inset-0 w-full h-full border-none cursor-pointer p-0 opacity-0 z-10"
                               />
                               <div className="w-full h-full rounded-lg shadow-inner border border-black/5" style={{ backgroundColor: globalStyles.accent_color }} />
                            </div>
                            <p className="text-[10px] font-semibold text-zinc-500 text-center uppercase tracking-tight">Accent Detail</p>
                         </div>
                      </div>
                   </div>

                   {/* Typography */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Type className="w-4 h-4 text-zinc-400" />
                         <Label className="text-[12px] font-bold text-zinc-950">Typography System</Label>
                      </div>
                      <div className="space-y-3">
                         <div className="p-5 bg-zinc-50/50 rounded-xl space-y-4 border border-zinc-200/50">
                            <Select 
                              value={globalStyles.font_family_heading || 'Inter'} 
                              onValueChange={(v) => setGlobalStyles({...globalStyles, font_family_heading: v})}
                            >
                              <SelectTrigger className="h-10 bg-white border-zinc-200 rounded-lg text-[13px] font-medium shadow-sm focus:ring-2 focus:ring-zinc-950/5">
                                 <SelectValue placeholder="Select Font" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-zinc-200 shadow-xl">
                                 {['Inter', 'Outfit', 'Manrope', 'Clash Display', 'General Sans'].map(f => (
                                   <SelectItem key={f} value={f} className="text-[13px] font-medium">{f}</SelectItem>
                                 ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-1 p-1 bg-zinc-100/50 rounded-lg border border-zinc-200/50">
                               {['500', '700', '900'].map(w => (
                                 <button 
                                   key={w}
                                   onClick={() => setGlobalStyles({...globalStyles, font_weight_heading: w})}
                                   className={cn(
                                     "flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all",
                                     globalStyles.font_weight_heading === w ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:bg-white/50"
                                   )}
                                 >
                                   {w === '500' ? 'Medium' : w === '700' ? 'Bold' : 'Black'}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                    <Separator className="bg-zinc-200/50" />

                    {/* Interactivity & Assets */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-zinc-400" />
                          <Label className="text-[12px] font-bold text-zinc-950">Interactivity & Assets</Label>
                       </div>
                       <div className="p-5 bg-zinc-50/50 rounded-xl space-y-6 border border-zinc-200/50">
                          {/* Button Shadow & Animation */}
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-3">
                                <Label className="text-[11px] font-bold text-zinc-500 uppercase">Button Shadow</Label>
                                <Select 
                                  value={globalStyles.button_shadow || 'none'} 
                                  onValueChange={(v) => setGlobalStyles({...globalStyles, button_shadow: v})}
                                >
                                  <SelectTrigger className="h-9 bg-white border-zinc-200 text-[12px]">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="none">None</SelectItem>
                                     <SelectItem value="soft">Soft</SelectItem>
                                     <SelectItem value="hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[11px] font-bold text-zinc-500 uppercase">Animation</Label>
                                <Select 
                                  value={globalStyles.button_animation || 'scale'} 
                                  onValueChange={(v) => setGlobalStyles({...globalStyles, button_animation: v})}
                                >
                                  <SelectTrigger className="h-9 bg-white border-zinc-200 text-[12px]">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="none">None</SelectItem>
                                     <SelectItem value="pulse">Pulse</SelectItem>
                                     <SelectItem value="scale">Scale</SelectItem>
                                  </SelectContent>
                                </Select>
                             </div>
                          </div>

                          {/* Button Padding */}
                          <div className="space-y-3">
                             <Label className="text-[11px] font-bold text-zinc-500 uppercase">Button Size</Label>
                             <div className="flex gap-1 p-1 bg-zinc-100/50 rounded-lg border border-zinc-200/50">
                                {['compact', 'standard', 'large'].map(p => (
                                  <button 
                                    key={p}
                                    onClick={() => setGlobalStyles({...globalStyles, button_padding: p})}
                                    className={cn(
                                      "flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all",
                                      globalStyles.button_padding === p ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:bg-white/50"
                                    )}
                                  >
                                    {p.toUpperCase()}
                                  </button>
                                ))}
                             </div>
                          </div>

                          {/* Secondary CTA Toggle */}
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-zinc-200/50">
                             <div className="space-y-0.5">
                                <Label className="text-[12px] font-bold text-zinc-950">Secondary Buttons</Label>
                                <p className="text-[10px] text-zinc-500 font-medium">Show supplementary actions</p>
                             </div>
                             <button 
                               onClick={() => setGlobalStyles({...globalStyles, show_secondary_cta: !globalStyles.show_secondary_cta})}
                               className={cn(
                                 "w-10 h-5 rounded-full transition-colors relative",
                                 globalStyles.show_secondary_cta ? "bg-zinc-950" : "bg-zinc-200"
                               )}
                             >
                                <div className={cn(
                                  "w-3 h-3 bg-white rounded-full absolute top-1 transition-all",
                                  globalStyles.show_secondary_cta ? "right-1" : "left-1"
                                )} />
                             </button>
                          </div>
                       </div>
                    </div>

                   {/* Scale & Proportions */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Type className="w-4 h-4 text-zinc-400" />
                         <Label className="text-[12px] font-bold text-zinc-950">Scale & Proportions</Label>
                      </div>
                      <div className="p-5 bg-zinc-50/50 rounded-xl space-y-5 border border-zinc-200/50">
                         <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <Label className="text-[11px] font-bold text-zinc-500 uppercase">H1 Size</Label>
                               <span className="text-[11px] font-black text-zinc-900">{globalStyles.font_size_h1}px</span>
                            </div>
                            <input 
                              type="range" min="24" max="120" step="2"
                              value={globalStyles.font_size_h1}
                              onChange={(e) => setGlobalStyles({...globalStyles, font_size_h1: e.target.value})}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                            />
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <Label className="text-[11px] font-bold text-zinc-500 uppercase">H2 Size</Label>
                               <span className="text-[11px] font-black text-zinc-900">{globalStyles.font_size_h2}px</span>
                            </div>
                            <input 
                              type="range" min="18" max="80" step="2"
                              value={globalStyles.font_size_h2}
                              onChange={(e) => setGlobalStyles({...globalStyles, font_size_h2: e.target.value})}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                            />
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <Label className="text-[11px] font-bold text-zinc-500 uppercase">Body Size</Label>
                               <span className="text-[11px] font-black text-zinc-900">{globalStyles.font_size_body}px</span>
                            </div>
                            <input 
                              type="range" min="12" max="24" step="1"
                              value={globalStyles.font_size_body}
                              onChange={(e) => setGlobalStyles({...globalStyles, font_size_body: e.target.value})}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                            />
                         </div>
                      </div>
                   </div>

                   {/* Scale & Proportions */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                         <Type className="w-4 h-4 text-zinc-400" />
                         <Label className="text-[12px] font-bold text-zinc-950">Scale & Proportions</Label>
                      </div>
                      <div className="p-5 bg-zinc-50/50 rounded-xl space-y-5 border border-zinc-200/50">
                         <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <Label className="text-[11px] font-bold text-zinc-500 uppercase">H1 Size</Label>
                               <span className="text-[11px] font-black text-zinc-900">{globalStyles.font_size_h1}px</span>
                            </div>
                            <input 
                              type="range" min="24" max="120" step="2"
                              value={globalStyles.font_size_h1}
                              onChange={(e) => setGlobalStyles({...globalStyles, font_size_h1: e.target.value})}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                            />
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <Label className="text-[11px] font-bold text-zinc-500 uppercase">H2 Size</Label>
                               <span className="text-[11px] font-black text-zinc-900">{globalStyles.font_size_h2}px</span>
                            </div>
                            <input 
                              type="range" min="18" max="80" step="2"
                              value={globalStyles.font_size_h2}
                              onChange={(e) => setGlobalStyles({...globalStyles, font_size_h2: e.target.value})}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                            />
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between">
                               <Label className="text-[11px] font-bold text-zinc-500 uppercase">Body Size</Label>
                               <span className="text-[11px] font-black text-zinc-900">{globalStyles.font_size_body}px</span>
                            </div>
                            <input 
                              type="range" min="12" max="24" step="1"
                              value={globalStyles.font_size_body}
                              onChange={(e) => setGlobalStyles({...globalStyles, font_size_body: e.target.value})}
                              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                            />
                         </div>
                      </div>
                   </div>

                   {/* Alignment & Style */}
                   <div className="space-x-4 flex">
                      <div className="space-y-4 flex-1">
                         <Label className="text-[12px] font-bold text-zinc-950">Alignment</Label>
                         <div className="flex bg-zinc-100/50 p-1 rounded-lg border border-zinc-200/50">
                            {[
                              { id: 'left', icon: AlignLeft },
                              { id: 'center', icon: AlignCenter },
                              { id: 'right', icon: AlignRight }
                            ].map(align => (
                              <button
                                key={align.id}
                                onClick={() => setGlobalStyles({...globalStyles, text_alignment: align.id})}
                                className={cn(
                                  "flex-1 h-9 flex items-center justify-center rounded-md transition-all",
                                  globalStyles.text_alignment === align.id ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-400 hover:text-zinc-600"
                                )}
                              >
                                 <align.icon className="w-4 h-4" />
                              </button>
                            ))}
                         </div>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                         <Label className="text-[12px] font-bold text-zinc-950">Button Corner</Label>
                         <div className="flex bg-zinc-100/50 p-1 rounded-lg border border-zinc-200/50">
                            {['none', 'md', 'full'].map(radius => (
                              <button
                                key={radius}
                                onClick={() => setGlobalStyles({...globalStyles, button_radius: radius})}
                                className={cn(
                                  "flex-1 h-9 flex items-center justify-center rounded-md transition-all text-[11px] font-bold",
                                  (globalStyles.button_radius || 'md') === radius ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-400 hover:text-zinc-600"
                                )}
                              >
                                 {radius.toUpperCase()}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="text-[12px] font-bold text-zinc-950">Component Style</Label>
                      <div className="grid grid-cols-2 gap-2">
                         {[
                           { id: 'solid', label: 'Solid Minimal' },
                           { id: 'outline', label: 'Soft Outline' },
                           { id: 'bold-border', label: 'Dashboard Bold' },
                           { id: 'ghost', label: 'Subtle Ghost' }
                         ].map(style => (
                           <button
                             key={style.id}
                             onClick={() => setGlobalStyles({...globalStyles, button_style: style.id})}
                             className={cn(
                               "h-11 px-4 rounded-lg text-[11px] font-bold transition-all text-left border shrink-0",
                               globalStyles.button_style === style.id ? "border-zinc-950 bg-zinc-950 text-white shadow-md shadow-zinc-200" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                             )}
                           >
                              {style.label}
                           </button>
                         ))}
                      </div>
                   </div>
                </TabsContent>

               <TabsContent value="content" className="mt-0 space-y-10 outline-none">
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <Label className="text-[13px] font-black text-black">Main Headline</Label>
                         <Input 
                           value={contentOverrides.h1 || ''}
                           onChange={(e) => setContentOverrides({...contentOverrides, h1: e.target.value})}
                           placeholder="Core Objective"
                           className="h-12 bg-white border-zinc-200 rounded-md px-4 text-sm font-black shadow-sm focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-200"
                        />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[13px] font-black text-black">Email Contact</Label>
                         <Input 
                           value={contentOverrides.email || ''}
                           onChange={(e) => setContentOverrides({...contentOverrides, email: e.target.value})}
                           placeholder="mail@production.io"
                           className="h-12 bg-white border-zinc-200 rounded-md px-4 text-sm font-black shadow-sm focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-200"
                        />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[13px] font-black text-black">Project Description</Label>
                         <Input 
                           value={contentOverrides.description || ''}
                           onChange={(e) => setContentOverrides({...contentOverrides, description: e.target.value})}
                           placeholder="Technical Synopsis"
                           className="h-12 bg-white border-zinc-200 rounded-md px-4 text-sm font-black shadow-sm focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-200"
                        />
                     </div>
                  </div>
               </TabsContent>
            </div>
            
            <div className="p-6 bg-zinc-50 border-t border-zinc-100">
               <PendingButton 
                 loading={isSaving} 
                 onClick={handleSave} 
                 className="w-full h-11 bg-zinc-950 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-[0.98]"
               >
                  Save Configuration
               </PendingButton>
            </div>
        </Tabs>
      </aside>

      {/* 2. Main Content: High-Contrast Architectural Flow */}
      <main className="flex-1 flex flex-col h-full bg-zinc-50/50 relative overflow-hidden">
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-12 lg:p-16">
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {/* 2.1 Refined Header */}
               <div className="space-y-3 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-600 text-[11px] font-bold shadow-sm">
                    <Layers className="w-3.5 h-3.5" />
                    Site Architecture
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Select Components</h2>
                  <p className="text-zinc-500 font-medium text-[14px]">Define the structural foundation for your website build.</p>
               </div>

                {/* 2.2 Grid of Groups: 2-Column Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                  {[
                    { title: 'Navigation', prefix: 'NAV_', multiple: false },
                    { title: 'Hero Section', prefix: 'HERO_', multiple: false },
                    { title: 'Feature Modules', prefix: 'FEATURES_', multiple: true },
                    { title: 'Contact & CTA', prefix: 'CONTACT_', multiple: true },
                    { title: 'Footer', prefix: 'FOOTER_', multiple: false },
                  ].map((group) => (
                    <div key={group.title} className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-left">
                       <h3 className="text-sm font-bold text-zinc-900 mb-6 pb-3 border-b border-zinc-100 flex items-center justify-between">
                         {group.title}
                         {group.multiple && <Badge variant="secondary" className="bg-zinc-50 text-zinc-500 font-medium text-[10px] uppercase">Multi-select</Badge>}
                       </h3>
                       <div className="space-y-2.5">
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
                                  "w-full flex items-center justify-between p-4 rounded-xl transition-all border shrink-0 group/btn",
                                  selectedComponents.includes(key) 
                                    ? "bg-zinc-950 border-zinc-950 text-white shadow-lg shadow-zinc-200 translate-y-[-1px]" 
                                    : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50/50"
                                )}
                              >
                                 <div className="flex flex-col items-start">
                                   <span className="text-[13px] font-semibold">{template.name}</span>
                                   <span className="text-[9px] text-zinc-400 font-medium group-hover/btn:text-zinc-600 transition-colors">Hold to Preview</span>
                                 </div>
                                 <div className={cn(
                                   "w-2 h-2 rounded-full transition-all",
                                   selectedComponents.includes(key) ? "bg-white" : "bg-zinc-200"
                                 )} />
                              </button>
                            ))}
                       </div>
                    </div>
                  ))}

                  {/* Long Press Preview Overlay */}
                  <AnimatePresence>
                    {previewingComponent && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewingComponent(null)}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 lg:p-24"
                      >
                         <motion.div 
                           initial={{ scale: 0.9, y: 20 }}
                           animate={{ scale: 1, y: 0 }}
                           exit={{ scale: 0.9, y: 20 }}
                           className="w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl relative"
                         >
                            <div className="absolute top-8 right-8 z-10">
                               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-zinc-100" onClick={() => setPreviewingComponent(null)}>
                                  <Sparkles className="w-5 h-5" />
                               </Button>
                            </div>
                            <div className="p-12 lg:p-20 overflow-y-auto max-h-[80vh] custom-scrollbar">
                               {(COMPONENT_TEMPLATES as any)[previewingComponent]?.preview(
                                 globalStyles, 
                                 contentOverrides, 
                                 {}
                               )}
                            </div>
                            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                               <div>
                                  <h4 className="text-xl font-bold text-zinc-950">{(COMPONENT_TEMPLATES as any)[previewingComponent]?.name}</h4>
                                  <p className="text-sm font-medium text-zinc-500">Live Architectural Preview</p>
                               </div>
                               <Button 
                                 className="h-12 px-8 bg-zinc-950 text-white rounded-xl font-bold"
                                 onClick={() => {
                                   const prefix = previewingComponent.split('_')[0] + '_'
                                   const isMultiple = ['FEATURES_', 'CONTACT_'].includes(prefix)
                                   if (isMultiple) toggleComponent(previewingComponent)
                                   else setComponentInGroup(prefix, previewingComponent)
                                   setPreviewingComponent(null)
                                 }}
                               >
                                  Select this Module
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
              {/* Architectural Breadcrumb: Left-Aligned Step Flow */}
              <div className="h-16 bg-white border-b border-zinc-100 flex items-center px-10 gap-6 overflow-x-auto no-scrollbar z-10">
                 {selectedComponents.map((key, idx) => {
                   const template = (COMPONENT_TEMPLATES as any)[key]
                   return (
                     <button
                       key={key}
                       onClick={() => setActiveModuleIndex(idx)}
                       className={cn(
                         "flex items-center gap-3 whitespace-nowrap transition-all group",
                         activeModuleIndex === idx ? "opacity-100" : "opacity-40 hover:opacity-100"
                       )}
                     >
                        <div className={cn(
                          "w-8 h-8 rounded-lg border flex items-center justify-center text-[11px] font-bold transition-all",
                          activeModuleIndex === idx ? "bg-zinc-950 text-white border-zinc-950 shadow-md" : "bg-white text-zinc-400 border-zinc-200 group-hover:border-zinc-300"
                        )}>
                           {idx + 1}
                        </div>
                        <span className={cn(
                          "text-[12px] font-bold transition-colors",
                          activeModuleIndex === idx ? "text-zinc-900" : "text-zinc-400"
                        )}>
                           {template?.name || key}
                        </span>
                        {idx < selectedComponents.length - 1 && <div className="w-4 h-px bg-zinc-100" />}
                     </button>
                   )
                 })}
              </div>

              {/* Split Configuration Engine */}
              <div className="flex-1 flex overflow-hidden">
                 {/* 2A. Module Inspector */}
                 <div className="w-[400px] border-r border-zinc-200 bg-white flex flex-col p-8 overflow-y-auto z-10 text-left">
                    <div className="mb-10">
                       <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4">
                         Unit {activeModuleIndex + 1}
                       </div>
                       <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                         {(COMPONENT_TEMPLATES as any)[selectedComponents[activeModuleIndex]]?.name}
                       </h3>
                    </div>

                    <div className="space-y-12">
                       {/* 1. Layout Unit */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-2.5">
                             <Layers className="w-4 h-4 text-zinc-400" />
                             <Label className="text-[13px] font-bold text-zinc-900">Structural Layout</Label>
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
                                    "w-full h-14 px-6 flex items-center justify-between transition-all border rounded-xl text-left",
                                    (componentSettings[selectedComponents[activeModuleIndex]]?.layout_variant || 'standard') === v.id
                                      ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                                  )}
                                >
                                   <span className="text-[12px] font-bold">{v.name}</span>
                                   <div className={cn("w-1.5 h-1.5 rounded-full", (componentSettings[selectedComponents[activeModuleIndex]]?.layout_variant || 'standard') === v.id ? "bg-white" : "bg-zinc-200")} />
                                </button>
                             ))}
                          </div>
                       </div>

                       {/* 2. Weight Scale */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-2.5">
                             <Type className="w-4 h-4 text-zinc-400" />
                             <Label className="text-[13px] font-bold text-zinc-900">Hierarchy</Label>
                          </div>
                          <div className="flex bg-zinc-100/50 p-1 border border-zinc-200/50 rounded-xl gap-1">
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
                                    "flex-1 h-9 rounded-lg text-[11px] font-bold transition-all",
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

                       {/* 3. Custom Cosmetics (for specific components) */}
                       {selectedComponents[activeModuleIndex] === 'NAV_CUSTOM' && (
                          <div className="space-y-6">
                             <div className="flex items-center gap-2.5">
                                <Palette className="w-4 h-4 text-zinc-400" />
                                <Label className="text-[13px] font-bold text-zinc-900">Header Cosmetics</Label>
                             </div>
                             <div className="space-y-4 p-5 bg-zinc-50 border border-zinc-200 rounded-xl">
                                <div className="space-y-2">
                                   <Label className="text-[11px] font-bold text-zinc-500 uppercase text-left block">Background Color</Label>
                                   <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={componentSettings[selectedComponents[activeModuleIndex]]?.bg_color || '#ffffff'}
                                        onChange={(e) => setComponentSettings(prev => ({
                                          ...prev, 
                                          [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], bg_color: e.target.value, bg_gradient: '' }
                                        }))}
                                        className="w-10 h-10 rounded-lg border border-zinc-200 p-1 bg-white cursor-pointer"
                                      />
                                      <span className="text-sm font-mono text-zinc-500">{componentSettings[selectedComponents[activeModuleIndex]]?.bg_color || '#ffffff'}</span>
                                   </div>
                                </div>
                                <div className="space-y-3">
                                   <Label className="text-[11px] font-bold text-zinc-500 uppercase text-left block">Preset Gradients</Label>
                                   <div className="grid grid-cols-4 gap-2">
                                      {[
                                        'linear-gradient(to right, #000000, #434343)',
                                        'linear-gradient(to right, #ee9ca7, #ffdde1)',
                                        'linear-gradient(to right, #2193b0, #6dd5ed)',
                                        'linear-gradient(to right, #cc2b5e, #753a88)'
                                      ].map((grad, i) => (
                                         <button 
                                           key={i}
                                           onClick={() => setComponentSettings(prev => ({
                                             ...prev, 
                                             [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], bg_gradient: grad }
                                           }))}
                                           className={cn(
                                             "w-full aspect-square rounded-lg border-2 transition-all",
                                             componentSettings[selectedComponents[activeModuleIndex]]?.bg_gradient === grad ? "border-zinc-950 scale-110 shadow-md" : "border-transparent"
                                           )}
                                           style={{ backgroundImage: grad }}
                                         />
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}

                       {/* 4. Dynamics */}
                       <div className="space-y-6">
                          <div className="flex items-center gap-2.5">
                             <Sparkles className="w-4 h-4 text-zinc-400" />
                             <Label className="text-[13px] font-bold text-zinc-900">Motion Effects</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'fade', label: 'Soft Fade' },
                                { id: 'slide-up', label: 'Slide Up' },
                                { id: 'zoom', label: 'Zoom In' },
                                { id: 'none', label: 'No Motion' }
                              ].map(anim => (
                                 <button
                                   key={anim.id}
                                   onClick={() => setComponentSettings(prev => ({
                                     ...prev, 
                                     [selectedComponents[activeModuleIndex]]: { ...prev[selectedComponents[activeModuleIndex]], animation: anim.id }
                                   }))}
                                   className={cn(
                                     "h-11 border rounded-lg flex items-center justify-center text-[11px] font-bold transition-all",
                                     (componentSettings[selectedComponents[activeModuleIndex]]?.animation || 'fade') === anim.id
                                       ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                                       : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                   )}
                                 >
                                    {anim.label}
                                 </button>
                              ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 2B. Large Scale Sandbox */}
                 <div className="flex-1 bg-zinc-50/50 flex items-center justify-center p-8 lg:p-12 relative">
                    <div className="absolute top-8 left-8 flex items-center gap-3">
                       <div className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-zinc-200">Live Preview</div>
                    </div>
                    
                    <div className="w-full h-full max-h-[750px] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-zinc-200/80 rounded-[2rem] overflow-hidden relative group">
                       <div className="absolute inset-0 p-8 lg:p-16 overflow-auto no-scrollbar scroll-smooth">
                          <div className="transform scale-[0.6] lg:scale-[0.85] origin-top transition-transform duration-700">
                            {(COMPONENT_TEMPLATES as any)[selectedComponents[activeModuleIndex]]?.preview(
                              globalStyles, 
                              contentOverrides, 
                              componentSettings[selectedComponents[activeModuleIndex]]
                            )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {step === 3 && (
          <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-12 animate-in zoom-in-95 duration-1000 bg-white">
             <div className="w-24 h-24 bg-zinc-950 rounded-[2rem] flex items-center justify-center shadow-xl shadow-zinc-200 rotate-3 hover:rotate-0 transition-transform duration-700">
                <CheckCircle2 className="w-10 h-10 text-white" />
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">System Ready</h2>
                <p className="text-[14px] font-medium text-zinc-500">Your custom architecture has been successfully ejection-ready.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-12 text-left">
                <div className="p-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-4 hover:border-zinc-300 transition-all group">
                   <div className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-zinc-950 group-hover:border-zinc-950 transition-colors">
                      <Palette className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-zinc-900">Theme Assets</p>
                     <p className="text-[12px] font-medium text-zinc-500">Global styles and typography tokens</p>
                   </div>
                </div>
                <div className="p-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-4 hover:border-zinc-300 transition-all group">
                   <div className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-zinc-950 group-hover:border-zinc-950 transition-colors">
                      <Layers className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-zinc-900">Module Structure</p>
                     <p className="text-[12px] font-medium text-zinc-500">Layout configurations and metadata</p>
                   </div>
                </div>
             </div>

             <PendingButton 
               loading={isGenerating} 
               onClick={handleGenerate} 
               className="h-16 px-12 bg-zinc-950 text-white rounded-2xl text-[14px] font-bold shadow-2xl shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-4 group"
             >
                <Download className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                Eject Production Build
             </PendingButton>
          </div>
        )}

        {/* Action Infrastructure Footer */}
        <footer className="h-20 border-t border-zinc-200 bg-white flex items-center justify-between px-8 z-30">
           <Button
             variant="ghost"
             onClick={() => {
                if (step === 2) {
                   if (activeModuleIndex > 0) setActiveModuleIndex(activeModuleIndex - 1)
                   else setStep(1)
                } else if (step === 3) setStep(2)
                else window.location.reload()
             }}
             className="h-10 px-6 text-[12px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors rounded-xl"
           >
              {step === 1 ? "Cancel" : "Back One Step"}
           </Button>
           
           <div className="flex items-center gap-6">
              {step === 1 ? (
                <Button
                  disabled={selectedComponents.length === 0}
                  onClick={() => setStep(2)}
                  className="h-10 px-8 bg-zinc-900 text-white font-bold text-[13px] shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all hover:scale-[1.02] rounded-xl"
                >
                   Continue to Configure
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
                  className="h-10 px-8 bg-zinc-900 text-white font-bold text-[13px] shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all hover:scale-[1.02] flex items-center gap-2 rounded-xl"
                >
                   {activeModuleIndex < selectedComponents.length - 1 ? (
                     <>Next Component <ChevronRight className="w-4 h-4" /></>
                   ) : (
                     <>Finalize Build <CheckCircle2 className="w-4 h-4" /></>
                   )}
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(1)}
                  className="h-10 px-8 bg-white border border-zinc-200 text-zinc-900 font-bold text-[13px] hover:bg-zinc-50 transition-all rounded-xl"
                >
                   Restart Architecture
                </Button>
              )}
           </div>
        </footer>
      </main>
    </div>
  )
}
