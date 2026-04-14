'use client'

import React from 'react'
import { useStudio } from '../context/studio-provider'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Hash, Layers, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SitePreview() {
  const { 
    selectedComponents, 
    globalStyles, 
    componentSettings, 
    contentOverrides,
    isArchitectureVerified,
    activeComponentId,
    setActiveComponentId,
    currentPage,
    pages
  } = useStudio()

  const currentStack = selectedComponents[currentPage] || []
  const hasNavbarAtTop = currentStack[0]?.includes('NAV')

  if (currentStack.length === 0) {
    return (
      <div className="h-[60vh] border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-zinc-300 transition-all bg-white/50 backdrop-blur-sm">
         <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-black/[0.03] group-hover:scale-110 transition-transform duration-500">
            <div className="w-10 h-10 border-4 border-zinc-100 rounded-full border-t-zinc-300 animate-spin" />
         </div>
         <div className="text-center space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Blueprint Empty // {currentPage}</h3>
            <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.4em]">Assemble modules to begin production</p>
         </div>
      </div>
    )
  }

  return (
    <div className="relative group/canvas">
      {/* 1. Production Blueprint Frame (High Fidelity) */}
      <div className="absolute -inset-10 border border-zinc-200/50 rounded-[3rem] pointer-events-none transition-all group-hover/canvas:border-zinc-300" />
      

      <div className="relative shadow-2xl shadow-black/[0.08] rounded-[2.5rem] overflow-hidden border border-zinc-200/60 bg-white min-h-[80vh] origin-top transition-all duration-700">
        {/* Component Stream */}
        <div className={cn("flex flex-col", hasNavbarAtTop && "pt-20")}>
          {currentStack.map((templateKey, index) => {
            const template = (COMPONENT_TEMPLATES as any)[templateKey]
            if (!template || !template.preview) return null

            const settings = componentSettings[templateKey] || {}
            
            return (
              <motion.div
                key={`${templateKey}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative group/module cursor-pointer transition-all",
                  activeComponentId === templateKey ? "ring-2 ring-zinc-950 ring-offset-4 ring-offset-white" : ""
                )}
                onClick={() => setActiveComponentId(templateKey)}
              >
                {/* Module Precision Overlay */}
                <div className="absolute top-8 right-8 z-20 opacity-0 group-hover/module:opacity-100 transition-all">
                    <div className="bg-zinc-950 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl shadow-black/20 scale-90 group-hover/module:scale-100 transition-transform">
                        <Hash className="w-3 h-3 text-zinc-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{templateKey.split('_')[0]}</span>
                    </div>
                </div>

                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent opacity-0 group-hover/module:opacity-100 transition-opacity" />
                
                {template.preview(globalStyles, contentOverrides, settings, pages)}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
