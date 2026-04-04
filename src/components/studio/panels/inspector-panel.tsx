'use client'

import React from 'react'
import { useStudio } from '../context/studio-provider'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles, Sliders, Type, Box } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InspectorPanel() {
  const { 
    activeComponentId, 
    contentOverrides, 
    setContentOverrides,
    componentSettings,
    setComponentSettings,
    handleAiGenerate,
    isAiGenerating
  } = useStudio()

  if (!activeComponentId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 opacity-40 grayscale">
         <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
            <Sliders className="w-6 h-6 text-zinc-300" />
         </div>
         <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-950">No Selection</p>
            <p className="text-[9px] font-bold uppercase italic leading-relaxed text-zinc-400 max-w-[180px]">
               Select a component from the canvas or stack to adjust its properties.
            </p>
         </div>
      </div>
    )
  }

  const template = (COMPONENT_TEMPLATES as any)[activeComponentId]
  if (!template) return null

  const schema = template.content_schema || {}

  const updateContent = (key: string, value: any) => {
    setContentOverrides({
      ...contentOverrides,
      [key]: value
    })
  }

  const updateSetting = (key: string, value: any) => {
    setComponentSettings({
      ...componentSettings,
      [activeComponentId]: {
        ...(componentSettings[activeComponentId] || {}),
        [key]: value
      }
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. Header context */}
      <div className="space-y-2">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest">{activeComponentId}</p>
         </div>
         <p className="text-[9px] text-zinc-400 font-bold uppercase italic tracking-tighter">Active Vector Module</p>
      </div>

      {/* 2. Content Tweaking */}
      <div className="space-y-6">
         <div className="flex items-center gap-2 mb-4">
            <Type className="w-3 h-3 text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Content Overrides</span>
         </div>

         {Object.keys(schema).map((key) => {
            const value = contentOverrides[key] || ''
            const label = key.replace(/_/g, ' ').toUpperCase()
            const isLong = key.includes('description') || key.includes('text') || key.includes('content')

            return (
              <div key={key} className="space-y-3">
                 <Label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{label}</Label>
                 {isLong ? (
                   <Textarea 
                     value={value}
                     onChange={(e) => updateContent(key, e.target.value)}
                     className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-[11px] font-medium min-h-[100px] outline-none focus:ring-1 focus:ring-zinc-950 transition-all"
                     placeholder={`Enter ${key}...`}
                   />
                 ) : (
                   <Input 
                     value={value}
                     onChange={(e) => updateContent(key, e.target.value)}
                     className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[11px] font-medium outline-none focus:ring-1 focus:ring-zinc-950 transition-all"
                     placeholder={`Enter ${key}...`}
                   />
                 )}
              </div>
            )
         })}
      </div>

      {/* 3. Property Engine / Settings Tweaking */}
      <div className="space-y-8 pt-6 border-t border-zinc-50">
         <div className="flex items-center gap-2 mb-4">
            <Box className="w-3 h-3 text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Modularity // Property Engine</span>
         </div>

         {(template.settings_schema || []).map((field: any) => {
            const currentValue = componentSettings[activeComponentId]?.[field.id] ?? (field.default ?? '')
            
            return (
              <div key={field.id} className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-[9px] font-black text-zinc-950 uppercase tracking-widest leading-none">{field.label}</Label>
                    <span className="text-[10px] font-bold text-zinc-300 italic uppercase tabular-nums">
                       {field.type === 'range' ? `${currentValue}%` : currentValue.toString().toUpperCase()}
                    </span>
                 </div>

                 {/* 3a. Segmented Control */}
                 {field.type === 'select' && (
                    <div className="flex flex-wrap gap-2 p-1 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                       {field.options.map((opt: string) => (
                         <button
                            key={opt}
                            onClick={() => updateSetting(field.id, opt)}
                            className={cn(
                              "flex-1 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
                              currentValue === opt 
                                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" 
                                : "text-zinc-400 hover:text-zinc-600"
                            )}
                         >
                            {opt}
                         </button>
                       ))}
                    </div>
                 )}

                 {/* 3b. Range Slider */}
                 {field.type === 'range' && (
                    <div className="relative group/range py-4">
                       <input 
                         type="range"
                         min={field.min}
                         max={field.max}
                         step={field.step || 1}
                         value={currentValue}
                         onChange={(e) => updateSetting(field.id, parseInt(e.target.value))}
                         className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 block transition-all focus:outline-none"
                       />
                       <div className="flex justify-between mt-2">
                          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{field.min}</span>
                          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{field.max}</span>
                       </div>
                    </div>
                 )}

                 {/* 3c. Boolean Toggle */}
                 {field.type === 'boolean' && (
                    <button 
                      onClick={() => updateSetting(field.id, !currentValue)}
                      className={cn(
                        "w-full h-12 flex items-center justify-between px-6 rounded-2xl border transition-all group",
                        currentValue ? "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-black/10" : "bg-white border-zinc-100 text-zinc-400"
                      )}
                    >
                       <span className="text-[9px] font-black uppercase tracking-widest italic">{currentValue ? 'Activated' : 'Disabled'}</span>
                       <div className={cn(
                          "w-4 h-4 rounded-full transition-all border-2",
                          currentValue ? "bg-emerald-400 border-white" : "bg-white border-zinc-200"
                       )} />
                    </button>
                 )}
              </div>
            )
         })}
      </div>

      {/* 4. AI Generator Integration */}
      <div className="pt-10 border-t border-zinc-50">
         <Button 
            onClick={handleAiGenerate}
            disabled={isAiGenerating}
            className="w-full h-14 bg-zinc-950 text-white rounded-none font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-black/10"
         >
            <Sparkles className={cn("w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform", isAiGenerating && "animate-pulse")} />
            {isAiGenerating ? 'AI Summoning...' : 'Polish with AI'}
         </Button>
         <p className="text-[8px] text-center text-zinc-400 mt-4 font-bold uppercase italic tracking-[0.2em]">
            Re-project content via OpenRouter (R1)
         </p>
      </div>
    </div>
  )
}
