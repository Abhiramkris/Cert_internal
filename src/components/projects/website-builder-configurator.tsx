'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { saveWebsiteConfig, generateProjectZip } from '@/app/dashboard/projects/builder-actions'
import { toast } from 'sonner'
import { Palette, Layers, Sparkles, Download, CheckCircle2, Type, AlignLeft, AlignCenter, AlignRight, Settings2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface WebsiteBuilderConfiguratorProps {
  projectId: string
  initialConfig?: any
}

export function WebsiteBuilderConfigurator({ projectId, initialConfig }: WebsiteBuilderConfiguratorProps) {
  const [step, setStep] = useState(1)
  const [globalStyles, setGlobalStyles] = useState(initialConfig?.global_styles || {
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#3b82f6',
    font_family_heading: 'Inter',
    font_weight_heading: '900',
    font_family_subheading: 'Inter',
    font_weight_subheading: '500',
    font_family_body: 'Inter',
    button_style: 'solid',
    text_alignment: 'left',
    spacing_scale: 'md',
    border_radius: 'xl',
  })

  const [selectedComponents, setSelectedComponents] = useState<string[]>(initialConfig?.selected_components || ['NAV_GLASS', 'HERO_CENTERED', 'FEATURES_GRID', 'FOOTER_SOCIAL'])
  const [componentSettings, setComponentSettings] = useState<Record<string, any>>(initialConfig?.component_settings || {})
  const [contentOverrides, setContentOverrides] = useState(initialConfig?.content_overrides || {
    h1: '',
    description: '',
    cta_primary: 'Launch Project',
    cta_secondary: 'Learn More',
    email: '',
    phone: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const steps = [
    { id: 1, title: 'Identity', description: 'Content Overrides', icon: Sparkles },
    { id: 2, title: 'Brand', description: 'Visual Identity', icon: Palette },
    { id: 3, title: 'Architecture', description: 'Template Selection', icon: Layers },
    { id: 4, title: 'Motion', description: 'Animation Design', icon: CheckCircle2 },
    { id: 5, title: 'Finalize', description: 'Launch & Export', icon: Download },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveWebsiteConfig(projectId, { 
        global_styles: globalStyles, 
        selected_components: selectedComponents,
        content_overrides: contentOverrides,
        component_settings: componentSettings
      })
      toast.success('Configuration synchronized')
    } catch (err) {
      toast.error('Sync failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateProjectZip(projectId)
      if (result.success && result.data) {
        const link = document.createElement('a')
        link.href = `data:application/zip;base64,${result.data}`
        link.download = result.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Site Ejected Successfully!')
      }
    } catch (err) {
      toast.error('Ejection failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const setComponentInGroup = (groupPrefix: string, key: string) => {
    setSelectedComponents(prev => [
      ...prev.filter(c => !c.startsWith(groupPrefix)),
      key
    ])
  }

  const toggleComponent = (key: string) => {
    setSelectedComponents(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }

  const updateComponentAnimation = (key: string, animation: string) => {
    setComponentSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], animation }
    }))
  }

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* 1. Left Sidebar: Persistent Identity & Brand */}
      <aside className="w-[340px] lg:w-[420px] border-r border-zinc-100 bg-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-zinc-50 bg-zinc-50/30">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                 <Settings2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-black uppercase tracking-widest italic text-zinc-900">Brand Identity</h1>
           </div>
           <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Global Style System</p>
        </div>

        <Tabs defaultValue="global" className="flex-1 flex flex-col overflow-hidden">
           <div className="px-8 pt-8">
              <TabsList className="w-full h-14 bg-zinc-50 rounded-2xl p-1.5">
                 <TabsTrigger value="global" className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Styles</TabsTrigger>
                 <TabsTrigger value="content" className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Content</TabsTrigger>
              </TabsList>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <TabsContent value="global" className="mt-0 space-y-10 outline-none">
                 {/* Colors */}
                 <div className="space-y-5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Brand Palette</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="relative group">
                          <input 
                            type="color" 
                            value={globalStyles.primary_color} 
                            onChange={(e) => setGlobalStyles({...globalStyles, primary_color: e.target.value})}
                            className="w-full h-14 rounded-2xl border-none cursor-pointer shadow-sm group-hover:shadow-md transition-all"
                          />
                          <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none">
                             <span className="text-[9px] font-black uppercase tracking-widest text-white mix-blend-difference">Primary</span>
                          </div>
                       </div>
                       <div className="relative group">
                          <input 
                            type="color" 
                            value={globalStyles.accent_color} 
                            onChange={(e) => setGlobalStyles({...globalStyles, accent_color: e.target.value})}
                            className="w-full h-14 rounded-2xl border-none cursor-pointer shadow-sm group-hover:shadow-md transition-all"
                          />
                          <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none">
                             <span className="text-[9px] font-black uppercase tracking-widest text-white mix-blend-difference">Accent</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <Separator className="opacity-50" />

                 {/* Typography */}
                 <div className="space-y-5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Typography</Label>
                    <div className="space-y-4">
                       <div className="p-5 bg-zinc-50 rounded-[2rem] space-y-4 border border-zinc-100/50 shadow-inner">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Headings</p>
                          <Select 
                            value={globalStyles.font_family_heading || 'Inter'} 
                            onValueChange={(v) => setGlobalStyles({...globalStyles, font_family_heading: v})}
                          >
                            <SelectTrigger className="h-12 bg-white border-none rounded-xl text-sm font-bold shadow-sm">
                               <SelectValue placeholder="Font Family" />
                            </SelectTrigger>
                            <SelectContent>
                               {['Inter', 'Outfit', 'Manrope', 'Playfair Display', 'Clash Display'].map(f => (
                                 <SelectItem key={f} value={f} className="text-sm font-bold">{f}</SelectItem>
                               ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                             {['500', '700', '900'].map(w => (
                               <button 
                                 key={w}
                                 onClick={() => setGlobalStyles({...globalStyles, font_weight_heading: w})}
                                 className={cn(
                                   "flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all",
                                   globalStyles.font_weight_heading === w ? "bg-zinc-900 text-white shadow-lg" : "bg-white text-zinc-400 border border-zinc-100"
                                 )}
                               >
                                 {w}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Alignment */}
                 <div className="space-y-5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Layout Tone</Label>
                    <div className="flex bg-zinc-50 p-1.5 rounded-2xl gap-1.5">
                       {[
                         { id: 'left', icon: AlignLeft },
                         { id: 'center', icon: AlignCenter },
                         { id: 'right', icon: AlignRight }
                       ].map(align => (
                         <button
                           key={align.id}
                           onClick={() => setGlobalStyles({...globalStyles, text_alignment: align.id})}
                           className={cn(
                             "flex-1 h-12 flex items-center justify-center rounded-xl transition-all",
                             globalStyles.text_alignment === align.id ? "bg-white text-zinc-900 shadow-md" : "text-zinc-400 hover:text-zinc-600"
                           )}
                         >
                            <align.icon className="w-5 h-5" />
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Button Style */}
                 <div className="space-y-5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Interaction Style</Label>
                    <div className="grid grid-cols-2 gap-3">
                       {['solid', 'gradient', 'outline', 'glass'].map(style => (
                         <button
                           key={style}
                           onClick={() => setGlobalStyles({...globalStyles, button_style: style})}
                           className={cn(
                             "h-14 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border",
                             globalStyles.button_style === style ? "border-zinc-900 bg-zinc-50 shadow-md text-zinc-900" : "border-zinc-50 text-zinc-400 hover:border-zinc-200"
                           )}
                         >
                            {style}
                         </button>
                       ))}
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0 space-y-8 outline-none">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Main Headline</Label>
                        <Input 
                          value={contentOverrides.h1 || ''}
                          onChange={(e) => setContentOverrides({...contentOverrides, h1: e.target.value})}
                          placeholder="Brand Title"
                          className="h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold shadow-inner"
                        />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Business Email</Label>
                        <Input 
                          value={contentOverrides.email || ''}
                          onChange={(e) => setContentOverrides({...contentOverrides, email: e.target.value})}
                          placeholder="contact@agency.com"
                          className="h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold shadow-inner"
                        />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tagline / Vision</Label>
                        <Input 
                          value={contentOverrides.description || ''}
                          onChange={(e) => setContentOverrides({...contentOverrides, description: e.target.value})}
                          placeholder="Short value prop"
                          className="h-14 bg-zinc-50 border-none rounded-2xl px-5 text-sm font-bold shadow-inner"
                        />
                    </div>
                 </div>
              </TabsContent>
           </div>
           
           <div className="p-8 bg-zinc-50/50 border-t border-zinc-100">
              <PendingButton 
                loading={isSaving} 
                onClick={handleSave} 
                className="w-full h-14 bg-white text-zinc-900 border border-zinc-200 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-zinc-50 transition-all active:scale-[0.98]"
              >
                 Sync Brand State
              </PendingButton>
           </div>
        </Tabs>
      </aside>

      {/* 2. Main Content: Fluid Stack Architect */}
      <main className="flex-1 flex flex-col h-full bg-zinc-50/50 relative overflow-hidden">
        {step < 3 ? (
          <div className="flex-1 overflow-y-auto p-12 lg:p-16">
            <div className="max-w-6xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {/* Header */}
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Site Architect
                </div>
                <h2 className="text-5xl font-black text-zinc-900 tracking-tighter italic">Stack Builder</h2>
                <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest opacity-60">Design your high-performance web experience</p>
              </div>

              {/* Matrix of Available Modules */}
              <div className="space-y-12 bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100/50">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-zinc-900">Module Matrix</h3>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select the components for your site flow</p>
                   </div>
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      <Layers className="w-4 h-4" />
                      {selectedComponents.length} Modules Active
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[
                    { title: 'Navigation', prefix: 'NAV_', multiple: false },
                    { title: 'Hero Sections', prefix: 'HERO_', multiple: false },
                    { title: 'Features', prefix: 'FEATURES_', multiple: true },
                    { title: 'Conversion', prefix: 'CONTACT_', multiple: true },
                    { title: 'Footer', prefix: 'FOOTER_', multiple: false },
                  ].map((group) => (
                    <div key={group.title} className="space-y-6 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100/50">
                       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-200 pb-3 mb-2">{group.title}</p>
                       <div className="space-y-3">
                          {Object.entries(COMPONENT_TEMPLATES as Record<string, any>)
                            .filter(([key]) => key.startsWith(group.prefix))
                            .map(([key, template]) => (
                              <button 
                                key={key}
                                onClick={() => group.multiple ? toggleComponent(key) : setComponentInGroup(group.prefix, key)}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group shadow-sm",
                                  selectedComponents.includes(key) 
                                    ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200" 
                                    : "bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200/50"
                                )}
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                                      selectedComponents.includes(key) ? "bg-white/20" : "bg-zinc-100"
                                    )}>
                                       {selectedComponents.includes(key) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">{template.name}</span>
                                 </div>
                                 <div className={cn(
                                   "w-2 h-2 rounded-full transition-all",
                                   selectedComponents.includes(key) ? "bg-emerald-400 animate-pulse" : "bg-zinc-200"
                                 )} />
                              </button>
                            ))}
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Granular Component Refinement Stack */}
              {selectedComponents.length > 0 && (
                <div className="space-y-12">
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black text-zinc-900 tracking-tight italic">Refinement Stack</h3>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest opacity-60">Deep configuration of active modules</p>
                   </div>

                   <div className="grid grid-cols-1 gap-12">
                      {selectedComponents.map(key => {
                        const template = (COMPONENT_TEMPLATES as any)[key]
                        if (!template) return null
                        return (
                          <Card key={key} className="rounded-[3.5rem] border-none shadow-2xl shadow-zinc-200/50 overflow-hidden bg-white group-hover:scale-[1.01] transition-transform duration-500">
                             <div className="p-10 flex flex-col xl:flex-row gap-12">
                                <div className="w-full xl:w-[320px] space-y-8">
                                   <div className="flex items-center gap-4">
                                      <div className="w-3 h-3 rounded-full bg-zinc-900" />
                                      <h3 className="text-base font-black uppercase tracking-widest text-zinc-900">{template.name}</h3>
                                   </div>

                                   <div className="space-y-6">
                                      <div className="space-y-3">
                                         <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Animation Motion</p>
                                         <div className="grid grid-cols-2 gap-3">
                                            {['none', 'fade', 'slide-up', 'zoom'].map(anim => (
                                              <button
                                                key={anim}
                                                onClick={() => updateComponentAnimation(key, anim)}
                                                className={cn(
                                                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                  (componentSettings[key]?.animation || 'fade') === anim 
                                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" 
                                                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                                                )}
                                              >
                                                 {anim}
                                              </button>
                                            ))}
                                         </div>
                                      </div>

                                      {(key.includes('HERO') || key.includes('FEATURES')) && (
                                         <div className="space-y-3">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Interaction Depth</p>
                                            <Select 
                                              value={componentSettings[key]?.cta_count?.toString() || '1'} 
                                              onValueChange={(v) => setComponentSettings(prev => ({...prev, [key]: {...prev[key], cta_count: parseInt(v)}}))}
                                            >
                                               <SelectTrigger className="h-12 bg-zinc-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-inner">
                                                  <SelectValue placeholder="Action Count" />
                                               </SelectTrigger>
                                               <SelectContent>
                                                  <SelectItem value="1" className="text-[11px] font-black uppercase">Single CTA</SelectItem>
                                                  <SelectItem value="2" className="text-[11px] font-black uppercase">Dual CTAs</SelectItem>
                                               </SelectContent>
                                            </Select>
                                         </div>
                                      )}

                                      {key.includes('FEATURES') && (
                                         <div className="space-y-3">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Card Aesthetic</p>
                                            <div className="flex flex-wrap gap-3">
                                               {['standard', 'minimal', 'glass'].map(style => (
                                                  <button
                                                     key={style}
                                                     onClick={() => setComponentSettings(prev => ({...prev, [key]: {...prev[key], card_style: style}}))}
                                                     className={cn(
                                                        "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        (componentSettings[key]?.card_style || 'standard') === style 
                                                          ? "bg-zinc-900 text-white shadow-lg" 
                                                          : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                                                     )}
                                                  >
                                                     {style}
                                                  </button>
                                               ))}
                                            </div>
                                         </div>
                                      )}
                                   </div>
                                </div>

                                <div className="flex-1 bg-zinc-50 rounded-[2.5rem] min-h-[320px] flex items-center justify-center p-12 overflow-hidden border border-zinc-100 relative shadow-inner">
                                   <div className="absolute top-6 left-8">
                                      <Badge variant="outline" className="bg-white border-none font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 px-5 py-2 shadow-sm rounded-full">Industrial Preview</Badge>
                                   </div>
                                   <div className="transform scale-[0.7] md:scale-[0.8] origin-center opacity-90 drop-shadow-3xl transition-transform duration-700">
                                      {template.preview(globalStyles, contentOverrides, componentSettings[key])}
                                   </div>
                                </div>
                             </div>
                          </Card>
                        )
                      })}
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-12 animate-in zoom-in-95 duration-1000 bg-white">
             <div className="w-32 h-32 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center shadow-3xl shadow-zinc-200 rotate-12 hover:rotate-0 transition-transform duration-500">
                <CheckCircle2 className="w-16 h-16 text-emerald-400" />
             </div>
             <div className="space-y-4">
                <h2 className="text-5xl font-black text-zinc-900 tracking-tighter italic">Architecture Verified</h2>
                <p className="text-base font-bold text-zinc-400 uppercase tracking-[0.4em]">Final Industrial Stage</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-12">
                <Card className="p-10 rounded-[3rem] border-zinc-50 bg-zinc-50/30 text-left space-y-6 hover:shadow-xl transition-all group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Palette className="w-6 h-6 text-zinc-900" />
                   </div>
                   <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Global Identity</p>
                      <div className="flex items-center gap-4">
                         <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: globalStyles.primary_color }} />
                         <span className="text-sm font-black text-zinc-900 uppercase tracking-widest">{globalStyles.font_family_heading}</span>
                      </div>
                   </div>
                </Card>
                <Card className="p-10 rounded-[3rem] border-zinc-50 bg-zinc-50/30 text-left space-y-6 hover:shadow-xl transition-all group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Layers className="w-6 h-6 text-zinc-900" />
                   </div>
                   <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Stack Metadata</p>
                      <p className="text-sm font-black text-zinc-900 uppercase tracking-widest">{selectedComponents.length} Pre-built Modules</p>
                   </div>
                </Card>
             </div>

             <PendingButton 
               loading={isGenerating} 
               onClick={handleGenerate} 
               className="h-24 px-16 bg-zinc-950 text-white rounded-[2.5rem] text-[14px] font-black uppercase tracking-[0.3em] shadow-3xl shadow-zinc-300 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-6 group"
             >
                <Download className="w-8 h-8 group-hover:translate-y-2 transition-transform duration-300 text-emerald-400" />
                Eject Production Build
             </PendingButton>
          </div>
        )}

        {/* Action Bar Footer */}
        <footer className="p-10 border-t border-zinc-100 bg-white/80 backdrop-blur-xl flex items-center justify-between z-30">
           <Button
             variant="ghost"
             onClick={() => {
                if (step === 3) setStep(1)
                else window.location.reload()
             }}
             className="rounded-2xl h-14 px-8 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100"
           >
              {step === 3 ? "Back to Architect" : "Exit Architect"}
           </Button>
           <div className="flex items-center gap-6">
              {step < 3 ? (
                <div className="flex items-center gap-4">
                   <p className="text-[11px] font-black uppercase tracking-widest text-zinc-300 mr-4">Architecture Active</p>
                   <Button
                     onClick={() => {
                       handleSave()
                       setStep(3)
                     }}
                     className="rounded-2xl h-14 px-12 bg-zinc-900 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                   >
                      Verify & Proceed
                   </Button>
                </div>
              ) : (
                <Button
                  onClick={() => window.location.reload()}
                  className="rounded-[2rem] h-14 px-12 bg-emerald-50 text-emerald-700 font-black text-[12px] uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-lg shadow-emerald-100/50"
                >
                   Finish Architecture
                </Button>
              )}
           </div>
        </footer>
      </main>
    </div>
  )
}
