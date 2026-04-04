'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings2, 
  ChevronRight, 
  Monitor, 
  Smartphone,
  Eye,
  Plus,
  Box,
  Sliders,
  ChevronLeft,
  Sparkles,
  Download,
  Save,
  PlusCircle,
  GripVertical,
  Trash2
} from 'lucide-react'
import { useStudio } from './context/studio-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates'
import { SitePreview } from '@/components/studio/canvas/site-preview'
import { WizardShell } from './wizard/wizard-shell'
import { InspectorPanel } from './panels/inspector-panel'
import { ComponentPickerModal } from './modals/component-picker-modal'
import { Reorder } from 'framer-motion'

export function StudioShell() {
  const { 
    flowMode, setFlowMode,
    selectedComponents, setSelectedComponents,
    activeComponentId, setActiveComponentId,
    pages, currentPage, setCurrentPage,
    setIsPickerOpen, setPickerCategory, setPickerSlotIndex,
    isSaving, isGenerating, isAiGenerating,
    handleSave, handleEject, handleGlobalAiGenerate,
    projectId, setWizardStep
  } = useStudio()

  if (flowMode === 'wizard') {
    return <WizardShell />
  }

  const mazzardFont = '"Mazzard H Bold", "Mazzard H Bold Placeholder", sans-serif'

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex overflow-hidden select-none" style={{ fontFamily: mazzardFont }}>
      
      {/* 1. LEFT BAR: COMPONENT REGISTRY (GALLERY) */}
      <aside className="w-[340px] bg-white border-r border-zinc-200 flex flex-col shrink-0 z-20 shadow-xl shadow-black/[0.01]">
         <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-[#fdfdfd]">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
                    <Box className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Registry</p>
                    <h2 className="text-sm font-black text-zinc-950 uppercase italic tracking-tight leading-none">Modules</h2>
                </div>
            </div>
            <button 
              onClick={() => setFlowMode('wizard')}
              className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-10 custom-scrollbar">
            {/* 1. Page Curation Stack */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-4 mb-2">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Active Stack // {currentPage}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                        setPickerCategory(null);
                        setPickerSlotIndex(null);
                        setIsPickerOpen(true);
                    }}
                    className="h-6 px-3 rounded-full bg-zinc-50 border border-zinc-100 text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950"
                  >
                     <Plus className="w-2 h-2 mr-1" />
                     Append Logic
                  </Button>
               </div>

               <Reorder.Group 
                 axis="y" 
                 values={selectedComponents[currentPage] || []} 
                 onReorder={(newStack) => setSelectedComponents({ ...selectedComponents, [currentPage]: newStack })} 
                 className="space-y-3"
               >
                  {(selectedComponents[currentPage] || []).map((key, index) => {
                    // Simple long press detection
                    let timer: any;
                    const handleTouchStart = () => {
                      timer = setTimeout(() => {
                        setPickerCategory(key.split('_')[0].toLowerCase());
                        setPickerSlotIndex(index);
                        setIsPickerOpen(true);
                      }, 500);
                    };
                    const handleTouchEnd = () => clearTimeout(timer);

                    return (
                      <Reorder.Item 
                        key={`${key}-${index}`} 
                        value={key}
                        onMouseDown={handleTouchStart}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onClick={() => setActiveComponentId(key)}
                        onDoubleClick={() => {
                           setPickerCategory(key.split('_')[0].toLowerCase());
                           setPickerSlotIndex(index);
                           setIsPickerOpen(true);
                        }}
                        className={cn(
                          "p-5 rounded-[2.5rem] border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between group relative overflow-hidden",
                          activeComponentId === key ? "bg-zinc-950 border-zinc-950 text-white shadow-2xl" : "bg-white border-zinc-100 text-zinc-950 hover:border-zinc-300"
                        )}
                      >
                         <div className="flex items-center gap-4 relative z-10">
                            <GripVertical className={cn("w-3 h-3 transition-colors", activeComponentId === key ? "text-white/20" : "text-zinc-200")} />
                            <div className="flex flex-col">
                               <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black tracking-tighter uppercase italic">{ (COMPONENT_TEMPLATES as any)[key]?.name || key }</span>
                               </div>
                               <span className={cn("text-[8px] font-bold uppercase tracking-[0.2em] italic", activeComponentId === key ? "text-white/30" : "text-zinc-400")}>
                                  Architectural Slot :: {key.split('_')[0]}
                               </span>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2 relative z-10 transition-transform duration-500 transform translate-x-12 group-hover:translate-x-0">
                            <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setPickerCategory(key.split('_')[0].toLowerCase());
                                 setPickerSlotIndex(index);
                                 setIsPickerOpen(true);
                              }}
                              className={cn(
                                "p-2 rounded-xl transition-all",
                                activeComponentId === key ? "bg-white/10 hover:bg-white/20 text-white" : "bg-zinc-50 hover:bg-zinc-100 text-zinc-400"
                              )}
                            >
                               <Sliders className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStack = (selectedComponents[currentPage] || []).filter((_, i) => i !== index);
                                setSelectedComponents({ ...selectedComponents, [currentPage]: newStack });
                              }}
                              className={cn(
                                 "p-2 rounded-xl transition-all",
                                 activeComponentId === key ? "bg-white/10 hover:bg-red-500/20 text-red-500" : "bg-zinc-50 hover:bg-red-50 text-zinc-400 hover:text-red-500"
                              )}
                            >
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </Reorder.Item>
                    );
                  })}
               </Reorder.Group>
            </div>

            {/* 2. Page Hierarchy Dropdown - Strategy Selection */}
            <div className="pt-6 border-t border-zinc-50 space-y-6">
                <div className="px-6 py-8 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 space-y-3 mx-2">
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-950 italic">Page Orchestron</p>
                   <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter">
                      Switch between defined pages to orchestrate unique component vectors.
                   </p>
                   
                   <div className="relative mt-4">
                      <select 
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        className="w-full h-14 bg-white border border-zinc-200 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-zinc-950 transition-all shadow-sm"
                      >
                         {pages.map((p) => (
                           <option key={p} value={p}>{p}</option>
                         ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                         <ChevronRight className="w-4 h-4 text-zinc-400 rotate-90" />
                      </div>
                   </div>
                </div>
            </div>

            {/* 3. Global Marketplace Quick-Add */}
            <div className="space-y-4 pt-6 border-t border-zinc-50">
               <div className="flex items-center justify-between px-4">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Full Component Market</p>
               </div>
               <div className="grid grid-cols-1 gap-2">
                  {Object.entries(COMPONENT_TEMPLATES).map(([key, template]: [string, any]) => {
                    const isSelected = (selectedComponents[currentPage] || []).includes(key);
                    if (isSelected) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                            const current = selectedComponents[currentPage] || [];
                            setSelectedComponents({ ...selectedComponents, [currentPage]: [...current, key] });
                        }}
                        className="p-4 rounded-[1.5rem] border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-zinc-950 transition-all flex items-center justify-between group text-left"
                      >
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-950 tracking-tight">{template.name}</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter underline underline-offset-4 decoration-zinc-200">{key.split('_')[0]}</span>
                         </div>
                         <PlusCircle className="w-4 h-4 text-zinc-300 group-hover:text-zinc-950 transition-all group-hover:scale-125" />
                      </button>
                    )
                  })}
               </div>
            </div>
         </div>

         <div className="p-6 border-t border-zinc-100 bg-white space-y-3">
            <Button 
               onClick={() => {
                 setFlowMode('wizard');
                 setWizardStep('pages');
               }}
               className="w-full h-11 bg-zinc-50 text-zinc-400 border border-zinc-100 rounded-none font-black uppercase tracking-[0.2em] text-[8px] hover:bg-zinc-100 hover:text-zinc-600 transition-all flex items-center justify-center gap-3 mb-2"
            >
               <ChevronLeft className="w-3 h-3" />
               Back to Configuration
            </Button>
            <Button 
               onClick={handleGlobalAiGenerate}
               disabled={isAiGenerating}
               className="w-full h-12 bg-white text-zinc-950 border border-zinc-200 rounded-none font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-50 transition-all flex items-center justify-center gap-3"
            >
               <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
               {isAiGenerating ? 'Projecting...' : 'Project Intelligence'}
            </Button>
            <Button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full h-12 bg-zinc-950 text-white rounded-none font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10"
            >
               <Save className="w-3.5 h-3.5" />
               {isSaving ? 'Syncing...' : 'Sync Blueprint'}
            </Button>
         </div>
      </aside>

      {/* 2. CENTER: PRODUCTION CANVAS (LIVE PREVIEW) */}
      <main className="flex-1 bg-[#f8f8fa] relative overflow-hidden flex flex-col">
         <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         
         <div className="h-16 border-b border-zinc-200/50 flex items-center justify-between px-8 relative z-20 bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-zinc-400 rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Live Projection</span>
               </div>
               <div className="flex items-center gap-4">
                  <button className="p-2 bg-zinc-950 text-white rounded-lg shadow-lg">
                     <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 bg-white text-zinc-400 border border-zinc-100 rounded-lg hover:text-zinc-950 transition-all">
                     <Smartphone className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-950 transition-all">
                   <Eye className="w-3.5 h-3.5" />
                   Review
                </button>
                <div className="h-4 w-[1px] bg-zinc-200" />
                <button 
                  onClick={handleEject}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-all"
                >
                   <Download className="w-3.5 h-3.5" />
                   {isGenerating ? 'Ejecting...' : 'Eject build'}
                </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/5 overflow-hidden border border-zinc-100 ring-1 ring-black/[0.02]">
                    <SitePreview />
                </div>
            </div>
         </div>
      </main>

      {/* 3. RIGHT BAR: COMPONENT INSPECTOR (TWEAKING) */}
      <aside className="w-[340px] bg-white border-l border-zinc-200 flex flex-col shrink-0 z-20 shadow-xl shadow-black/[0.01]">
         <div className="p-8 border-b border-zinc-100 bg-[#fdfdfd]">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center">
                    <Sliders className="w-4 h-4 text-zinc-950" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Inspector</p>
                    <h2 className="text-sm font-black text-zinc-950 uppercase italic tracking-tight leading-none">Property Tuning</h2>
                </div>
            </div>
         </div>

         <InspectorPanel />
      </aside>

      <ComponentPickerModal />

      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-md flex items-center justify-center"
          >
            <div className="bg-white border border-zinc-200 p-10 rounded-[2rem] flex items-center gap-6 shadow-2xl">
               <div className="w-6 h-6 border-4 border-zinc-950 border-t-transparent animate-spin rounded-full" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-950">Architectural Sync...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
