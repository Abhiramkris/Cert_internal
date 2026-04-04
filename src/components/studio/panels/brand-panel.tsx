'use client'

import React, { useState, useEffect } from 'react'
import { Palette, Type, MousePointer2, Command, Search, PlusCircle, Globe, Layout, ChevronRight, Check, Maximize2, Settings2, Sparkles } from 'lucide-react'
import { useStudio } from '../context/studio-provider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const FONT_PAIRINGS = [
  {
    id: 'architectural',
    name: 'Architectural Contrast',
    heading: 'Instrument Serif',
    body: 'Inter Tight',
    description: 'High-contrast editorial elegance',
    featured: true
  },
  {
    id: 'maximalist-vector',
    name: 'Maximalist Vector',
    heading: 'Syne',
    body: 'Inter',
    description: 'Bold display strokes meeting utility',
    featured: true
  },
  {
    id: 'technical-luxe',
    name: 'Technical Luxe',
    heading: 'Fraunces',
    body: 'Geist Mono',
    description: 'Precision engineering meets organic warmth',
    featured: true
  },
  {
    id: 'developer-blueprint',
    name: 'Developer Blueprint',
    heading: 'Space Grotesk',
    body: 'JetBrains Mono',
    description: 'Technical clarity for production tools'
  },
  {
    id: 'editorial-authority',
    name: 'Editorial Authority',
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    description: 'Classic luxury for modern interfaces'
  },
  {
    id: 'classic-luxury',
    name: 'Classic Luxury',
    heading: 'Cormorant Garamond',
    body: 'Montserrat',
    description: 'Timeless elegance with geometric precision'
  },
  {
    id: 'geometric-minimal',
    name: 'Geometric Minimal',
    heading: 'Outfit',
    body: 'Inter',
    description: 'Clean, geometric, and high-performance'
  },
  {
    id: 'brutalist-mono',
    name: 'Brutalist Mono',
    heading: 'Bormioli',
    body: 'Space Mono',
    description: 'Hard-edged industrial aesthetic'
  },
  {
    id: 'soft-readable',
    name: 'Soft Readable',
    heading: 'Lora',
    body: 'Merriweather Sans',
    description: 'Warm, approachable serif and sans pairing'
  },
  {
    id: 'monolithic-impact',
    name: 'Monolithic Impact',
    heading: 'Archivo Black',
    body: 'Archivo',
    description: 'Heavy architectural weight throughout'
  }
]

export function BrandPanel() {
  const { globalStyles, setGlobalStyles } = useStudio()
  const [searchQuery, setSearchQuery] = useState('')
  const [matrixOpen, setMatrixOpen] = useState(false)

  const featuredPairings = FONT_PAIRINGS.filter(p => p.featured)
  const filteredPairings = FONT_PAIRINGS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.heading.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Dynamic head inject for matrix gallery
  useEffect(() => {
    if (matrixOpen) {
       const families = Array.from(new Set(FONT_PAIRINGS.flatMap(p => [p.heading, p.body])))
       const encodedFamilies = families.map(f => f.replace(/\s+/g, '+')).join('|')
       const link = document.createElement('link')
       link.id = 'studio-gallery-fonts'
       link.rel = 'stylesheet'
       link.href = `https://fonts.googleapis.com/css?family=${encodedFamilies}:400,700,900&display=swap`
       document.head.appendChild(link)
       return () => {
         const selection = document.getElementById('studio-gallery-fonts')
         if (selection) selection.remove()
       }
    }
  }, [matrixOpen])

  const handleCustomCdn = (type: 'head' | 'body', url: string) => {
    setGlobalStyles({ 
        ...globalStyles, 
        [type === 'head' ? 'font_head_cdn_url' : 'font_body_cdn_url']: url 
    })
  }

  const handleCustomFamily = (type: 'head' | 'body', family: string) => {
    setGlobalStyles({ 
      ...globalStyles, 
      [type === 'head' ? 'custom_font_family_heading' : 'custom_font_family_body']: family,
      [type === 'head' ? 'font_family_heading' : 'font_family_body']: family 
    })
  }

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Global Color Space */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-zinc-400" />
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Color Infrastructure</Label>
        </div>

        <div className="grid grid-cols-1 gap-4 bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-950 uppercase tracking-widest leading-none mb-1">Primary Vector</span>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest italic outline-none">Solid Foundation</span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-50/50 p-2 rounded-xl border border-zinc-100/50 shadow-inner">
              <span className="text-[10px] font-black text-zinc-950 uppercase tracking-widest tabular-nums ml-2 leading-none">{globalStyles.primary_color}</span>
              <input 
                type="color" 
                value={globalStyles.primary_color}
                onChange={(e) => setGlobalStyles({...globalStyles, primary_color: e.target.value})}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none appearance-none p-0 overflow-hidden outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-950 uppercase tracking-widest leading-none mb-1">Accent Blending</span>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest italic outline-none">Interaction Layer</span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-50/50 p-2 rounded-xl border border-zinc-100/50 shadow-inner">
              <span className="text-[10px] font-black text-zinc-950 uppercase tracking-widest tabular-nums ml-2 leading-none">{globalStyles.accent_color}</span>
              <input 
                type="color" 
                value={globalStyles.accent_color}
                onChange={(e) => setGlobalStyles({...globalStyles, accent_color: e.target.value})}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none appearance-none p-0 overflow-hidden outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Typography Matrix Interface */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-zinc-400" />
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Typography Matrix</Label>
            </div>
        </div>

        <Dialog open={matrixOpen} onOpenChange={setMatrixOpen}>
            <DialogTrigger render={
                <button className="w-full p-8 bg-zinc-950 text-white rounded-[2rem] group relative overflow-hidden transition-all hover:bg-black shadow-2xl shadow-black/20 text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] italic mb-2 leading-none">Global Vector Matrix</p>
                            <h3 className="text-xl font-black uppercase italic leading-none tracking-tighter">Launch Typography Matrix</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                            <Maximize2 className="w-5 h-5" />
                        </div>
                    </div>
                </button>
            } />
            <DialogContent className="max-w-7xl h-[95vh] bg-[#fafafa] border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl flex flex-col">
                <div className="p-16 border-b border-zinc-100 bg-white shadow-sm flex-shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-zinc-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic outline-none">v3.0 Engine</span>
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] italic leading-none">Architectural Typography Suite</p>
                                </div>
                                <DialogTitle className="text-5xl font-black tracking-tighter text-zinc-950 uppercase italic leading-none">LOREM IPSUM MATRIX</DialogTitle>
                            </div>
                            <div className="relative w-96">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                <Input 
                                    placeholder="Search Font Vectors (e.g. Syne, Serif)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-14 bg-zinc-50 border-zinc-100 rounded-full pl-14 text-[12px] font-black tracking-tight focus:bg-white transition-all shadow-sm focus:shadow-md"
                                />
                            </div>
                        </div>
                    </DialogHeader>
                </div>
                
                <div className="flex-1 overflow-hidden flex">
                    {/* Matrix Grid (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-white/40">
                        <div className="grid grid-cols-2 gap-10">
                            {filteredPairings.map((pairing) => {
                                const isActive = globalStyles.font_pairing_id === pairing.id
                                return (
                                    <motion.button
                                        key={pairing.id}
                                        onClick={() => {
                                            setGlobalStyles({
                                                ...globalStyles, 
                                                font_pairing_id: pairing.id,
                                                font_family_heading: pairing.heading,
                                                font_family_body: pairing.body
                                            })
                                            setMatrixOpen(false)
                                        }}
                                        className={cn(
                                            "p-14 rounded-[3.5rem] border border-zinc-100 text-left transition-all relative group bg-white overflow-hidden",
                                            isActive ? "ring-8 ring-zinc-950/5 border-zinc-950 shadow-2xl" : "hover:border-zinc-300 hover:shadow-2xl shadow-sm hover:scale-[1.01]"
                                        )}
                                    >
                                        <div className="flex flex-col gap-10 relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1 leading-none">
                                                        {pairing.name}
                                                    </h4>
                                                    {pairing.featured && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                                            <Sparkles className="w-2.5 h-2.5" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest italic outline-none">Featured Pairing</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {isActive && <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center shadow-lg"><Check className="w-5 h-5 text-white" /></div>}
                                            </div>

                                            <div className="space-y-8 border-t border-zinc-50 pt-10">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-[1px] bg-zinc-100" />
                                                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none outline-none">{pairing.heading} // SPEC_01</span>
                                                    </div>
                                                    <span className="text-[36px] font-bold text-zinc-950 tracking-tighter leading-none block" style={{ fontFamily: pairing.heading }}>
                                                        Lorem Ipsum Architecture.
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-[1px] bg-zinc-100" />
                                                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none outline-none">{pairing.body} // SPEC_02</span>
                                                    </div>
                                                    <span className="text-[16px] font-medium text-zinc-500 leading-relaxed max-w-md block" style={{ fontFamily: pairing.body }}>
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Functional blueprint for high-performance design interfaces and modular data structures in v3.0.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Manual Configuration Sidebar */}
                    <div className="w-[450px] bg-zinc-950 p-16 flex flex-col gap-12 overflow-y-auto custom-scrollbar shadow-[-20px_0_40px_rgba(0,0,0,0.1)] border-l border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Settings2 className="w-5 h-5 text-zinc-500" />
                                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic mb-1 leading-none">Manual Configuration</h4>
                            </div>
                            <p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase tracking-wider">
                                Override the matrix by injecting custom headline and sub-head vectors via Google Font CDN.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {/* Headline Override */}
                            <div className="space-y-6 group">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Headline Vector</Label>
                                    <Globe className="w-3.5 h-3.5 text-zinc-700" />
                                </div>
                                <div className="space-y-4">
                                    <Input 
                                        placeholder="CDN: https://fonts.googleapis.com/css2?..."
                                        value={globalStyles.font_head_cdn_url || ''}
                                        onChange={(e) => handleCustomCdn('head', e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl text-[11px] font-medium placeholder:text-zinc-800 focus:bg-white/10 transition-all outline-none"
                                    />
                                    <Input 
                                        placeholder="Family: 'Space Grotesk', sans-serif"
                                        value={globalStyles.custom_font_family_heading || ''}
                                        onChange={(e) => handleCustomFamily('head', e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl text-[11px] font-medium placeholder:text-zinc-800 focus:bg-white/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="h-[1px] bg-white/5" />

                            {/* Body Override */}
                            <div className="space-y-6 group">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Sub-head / Body Vector</Label>
                                    <Globe className="w-3.5 h-3.5 text-zinc-700" />
                                </div>
                                <div className="space-y-4">
                                    <Input 
                                        placeholder="CDN: https://fonts.googleapis.com/css2?..."
                                        value={globalStyles.font_body_cdn_url || ''}
                                        onChange={(e) => handleCustomCdn('body', e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl text-[11px] font-medium placeholder:text-zinc-800 focus:bg-white/10 transition-all outline-none"
                                    />
                                    <Input 
                                        placeholder="Family: 'Inter', sans-serif"
                                        value={globalStyles.custom_font_family_body || ''}
                                        onChange={(e) => handleCustomFamily('body', e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-14 rounded-2xl text-[11px] font-medium placeholder:text-zinc-800 focus:bg-white/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-10 border-t border-white/5">
                            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] italic leading-relaxed">
                              * Independent vectors will be injected into the production head. Curated matrix selections will be overridden by these manual configurations.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Current Active Spec Preview (Simplified for main panel) */}
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest italic outline-none">Active Vector Pair</span>
            </div>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[24px] font-black leading-none tracking-tighter text-zinc-950 mb-2" style={{ fontFamily: globalStyles.font_family_heading || 'Inter' }}>
                          Structure
                        </span>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none outline-none">
                            {globalStyles.font_family_heading}
                        </span>
                    </div>
                    <div className="w-[1px] h-12 bg-zinc-100" />
                    <div className="flex flex-col">
                        <span className="text-[14px] font-medium leading-tight text-zinc-500 mb-2 max-w-[150px] line-clamp-1" style={{ fontFamily: globalStyles.font_family_body || 'Inter' }}>
                            Functional system copy layer...
                        </span>
                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none outline-none">
                            {globalStyles.font_family_body}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
