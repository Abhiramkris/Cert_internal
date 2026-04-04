'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Box, Layout, Type, Image as ImageIcon, Zap, Star } from 'lucide-react'
import { useStudio } from '../context/studio-provider'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { cn } from '@/lib/utils'

export function ComponentPickerModal() {
  const { 
    isPickerOpen, setIsPickerOpen, 
    pickerCategory, pickerSlotIndex, 
    currentPage, selectedComponents, setSelectedComponents 
  } = useStudio()

  if (!isPickerOpen) return null

  // Filter templates by category
  const availableTemplates = Object.entries(COMPONENT_TEMPLATES).filter(([key]) => {
    if (!pickerCategory) return true
    return key.startsWith(pickerCategory.toUpperCase())
  })

  const currentStack = selectedComponents[currentPage] || []

  const handleSelect = (templateKey: string) => {
    const newStack = [...currentStack]
    if (pickerSlotIndex !== null) {
      newStack[pickerSlotIndex] = templateKey
    } else {
      newStack.push(templateKey)
    }

    setSelectedComponents({
      ...selectedComponents,
      [currentPage]: newStack
    })
    setIsPickerOpen(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsPickerOpen(false)}
          className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-full bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-zinc-200"
        >
          {/* Header */}
          <div className="p-10 border-b border-zinc-100 flex items-center justify-between bg-[#fdfdfd]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
                 <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] leading-none mb-2">Registry Marketplace</p>
                <h2 className="text-2xl font-black text-zinc-950 uppercase italic tracking-tight leading-none">
                  Choose {pickerCategory || 'Component'} Variant
                </h2>
              </div>
            </div>
            <button 
              onClick={() => setIsPickerOpen(false)}
              className="w-12 h-12 flex items-center justify-center hover:bg-zinc-100 rounded-2xl transition-all group"
            >
              <X className="w-6 h-6 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {availableTemplates.map(([key, template]: [string, any]) => {
                 const isActive = currentStack.includes(key)
                 return (
                   <motion.button
                     key={key}
                     whileHover={{ y: -5 }}
                     onClick={() => handleSelect(key)}
                     className={cn(
                       "group text-left flex flex-col rounded-[2.5rem] border overflow-hidden transition-all duration-500",
                       isActive ? "border-zinc-950 ring-1 ring-zinc-950" : "border-zinc-100 hover:border-zinc-300"
                     )}
                   >
                      {/* Screenshot Placeholder */}
                      <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                         
                         {/* Static Template Label for Dummy */}
                         <div className="relative z-10 flex flex-col items-center gap-4">
                            <Box className="w-12 h-12 text-zinc-200 group-hover:scale-110 transition-transform duration-700" />
                            <div className="px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-zinc-100 rounded-full flex items-center gap-2">
                               <Zap className="w-3 h-3 text-emerald-500" />
                               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 italic">V3.0 Orchestrated</span>
                            </div>
                         </div>

                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/5 transition-all duration-500" />
                      </div>

                      {/* Info Area */}
                      <div className="p-8 space-y-4 bg-white flex-1 flex flex-col">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">{key.split('_')[0]}</span>
                            {isActive && <Check className="w-4 h-4 text-emerald-500" />}
                         </div>
                         <h3 className="text-sm font-black text-zinc-950 uppercase italic tracking-tight">{template.name}</h3>
                         <p className="text-[10px] text-zinc-400 font-bold leading-relaxed uppercase tracking-tighter">
                            A high-fidelity {key.toLowerCase()} vector designed for industrial impact.
                         </p>
                         
                         <div className="mt-auto pt-4 flex items-center gap-4 border-t border-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(i => <Star key={i} className="w-2 h-2 fill-zinc-950 text-zinc-950" />)}
                            </div>
                            <span className="text-[8px] font-black text-zinc-950 uppercase tracking-widest italic">Select Blueprint</span>
                         </div>
                      </div>
                   </motion.button>
                 )
               })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-8 border-t border-zinc-100 bg-[#fdfdfd] flex items-center justify-center">
             <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em] italic leading-none">
                Orchestrating High-Stakes Components // Architect v3.0
             </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
