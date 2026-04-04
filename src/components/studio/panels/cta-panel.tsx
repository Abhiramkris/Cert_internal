'use client'

import React from 'react'
import { 
  MousePointer2, 
  ArrowRight, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Command, 
  Layout, 
  Maximize2,
  Settings2,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react'
import { useStudio } from '../context/studio-provider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const BUTTON_PRESETS = [
  { 
    id: 'solid', 
    name: 'Industrial Solid', 
    getStyle: (accent: string) => ({ backgroundColor: accent, color: '#fff' })
  },
  { 
    id: 'glow', 
    name: 'Accent Glow', 
    getStyle: (accent: string) => ({ 
      backgroundColor: `${accent}15`, 
      color: accent,
      border: `1px solid ${accent}30`,
      boxShadow: `0 0 20px ${accent}20`
    })
  },
  { 
    id: 'double', 
    name: 'Double Vector', 
    getStyle: (accent: string) => ({ 
      backgroundColor: 'transparent', 
      color: accent,
      border: `1px solid ${accent}`,
      boxShadow: `4px 4px 0px ${accent}20` 
    })
  },
  { 
    id: 'glass', 
    name: 'Glass Vector', 
    getStyle: (accent: string) => ({ 
      backgroundColor: 'rgba(255,255,255,0.05)', 
      backdropFilter: 'blur(10px)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.1)'
    })
  }
]

const ICONS = [
  { id: 'arrow', Icon: ArrowRight },
  { id: 'zap', Icon: Zap },
  { id: 'globe', Icon: Globe },
  { id: 'shield', Icon: ShieldCheck },
  { id: 'command', Icon: Command }
]

export function CTAPanel() {
  const { globalStyles, setGlobalStyles } = useStudio()
  const accent = globalStyles.accent_color || '#000000'

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Dynamic Preset Foundation */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MousePointer2 className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Interaction Vector</Label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {BUTTON_PRESETS.map((preset) => {
            const isActive = globalStyles.button_style === preset.id
            const style = preset.getStyle(accent)
            return (
              <button
                key={preset.id}
                onClick={() => setGlobalStyles({...globalStyles, button_style: preset.id})}
                className={cn(
                  "p-8 rounded-[2rem] border text-left transition-all flex items-center justify-between group h-24 overflow-hidden",
                  isActive 
                    ? "bg-zinc-950 border-zinc-950 shadow-xl shadow-black/10" 
                    : "bg-white border-zinc-100 hover:border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                )}
              >
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    isActive ? "text-zinc-500" : "text-zinc-400"
                  )}>{preset.name}</span>
                  <span className={cn(
                    "text-[12px] font-black mt-1",
                    isActive ? "text-white" : "text-zinc-950"
                  )}>Call-to-Action Layer</span>
                </div>
                
                <div 
                  style={style}
                  className={cn(
                    "px-6 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    isActive ? "scale-105" : "opacity-30 group-hover:opacity-100"
                  )}
                >
                  Preview
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. SVG Manifest & Custom Vector */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Command className="w-4 h-4 text-zinc-400" />
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Icon Architecture</Label>
            </div>
            <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
        </div>

        <div className="grid grid-cols-5 gap-3 bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {ICONS.map(({ id, Icon }) => {
            const isActive = globalStyles.button_icon_id === id && !globalStyles.button_custom_svg
            return (
              <button
                key={id}
                onClick={() => setGlobalStyles({...globalStyles, button_icon_id: id, button_custom_svg: ''})}
                className={cn(
                  "aspect-square rounded-xl border flex items-center justify-center transition-all",
                  isActive ? "bg-zinc-950 border-zinc-950 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>

        <div className="bg-zinc-950 p-8 rounded-[2rem] shadow-2xl shadow-black/20 space-y-4">
            <Label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Custom SVG Path Vector</Label>
            <div className="relative">
                <Input 
                    placeholder="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                    value={globalStyles.button_custom_svg || ''}
                    onChange={(e) => setGlobalStyles({...globalStyles, button_custom_svg: e.target.value})}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-[10px] font-medium placeholder:text-zinc-700 focus:bg-white/10 transition-all outline-none"
                />
                <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            </div>
        </div>
      </div>

      {/* 3. Positioning & Alignment Controller */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Layout className="w-4 h-4 text-zinc-400" />
                <Label className="text-[10px] font-black text-zinc-950 uppercase tracking-[0.2em] italic">Position</Label>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                {['left', 'right'].map((pos) => (
                    <button
                        key={pos}
                        onClick={() => setGlobalStyles({...globalStyles, button_icon_pos: pos})}
                        className={cn(
                            "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            globalStyles.button_icon_pos === pos ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-400"
                        )}
                    >
                        {pos}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings2 className="w-4 h-4 text-zinc-400" />
                <Label className="text-[10px] font-black text-zinc-950 uppercase tracking-[0.2em] italic">Alignment</Label>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                {['inside', 'outside'].map((align) => (
                    <button
                        key={align}
                        onClick={() => setGlobalStyles({...globalStyles, button_icon_alignment: align})}
                        className={cn(
                            "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            globalStyles.button_icon_alignment === align ? "bg-white text-zinc-950 shadow-sm border border-zinc-200" : "text-zinc-400"
                        )}
                    >
                        {align}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 4. Radius Architecture */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Maximize2 className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Radius Protocol</Label>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {['none', 'sm', 'md', 'full'].map((r) => {
            const isActive = globalStyles.button_radius === r
            return (
              <button
                key={r}
                onClick={() => setGlobalStyles({...globalStyles, button_radius: r})}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={cn(
                  "w-full aspect-square border-2 transition-all flex items-center justify-center bg-white",
                  isActive ? "border-zinc-950" : "border-zinc-100 hover:border-zinc-200",
                  r === 'none' ? 'rounded-none' : r === 'sm' ? 'rounded-lg' : r === 'md' ? 'rounded-2xl' : 'rounded-full'
                )}>
                   {isActive && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  isActive ? "text-zinc-950" : "text-zinc-400"
                )}>{r}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
