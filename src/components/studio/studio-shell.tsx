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
  Trash2,
  X
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
  const [isAddingPage, setIsAddingPage] = React.useState(false);
  const [newPageName, setNewPageName] = React.useState('');

  const { 
    flowMode, setFlowMode,
    selectedComponents, setSelectedComponents,
    activeComponentId, setActiveComponentId,
    pages, setPages, currentPage, setCurrentPage,
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
                   
                   <div className="relative mt-4 flex flex-col gap-2">
                      <div className="relative">
                        <select 
                          value={currentPage}
                          onChange={(e) => setCurrentPage(e.target.value)}
                          className="w-full h-14 bg-white border border-zinc-200 rounded-none px-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-zinc-950 transition-all shadow-sm"
                        >
                           {pages.map((p) => (
                             <option key={p} value={p}>{p}</option>
                           ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                           <ChevronRight className="w-4 h-4 text-zinc-400 rotate-90" />
                        </div>
                      </div>
                      
                      {!isAddingPage ? (
                        <button 
                          onClick={() => setIsAddingPage(true)}
                          className="w-full h-10 border border-dashed border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-950 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3 h-3" /> Add Custom Page
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                           <input 
                              type="text" 
                              value={newPageName}
                              onChange={(e) => setNewPageName(e.target.value)}
                              placeholder="Page Name..."
                              className="flex-1 min-w-0 h-10 bg-white border border-zinc-200 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-zinc-950 transition-all placeholder:text-zinc-300"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newPageName.trim()) {
                                  const name = newPageName.trim();
                                  if (!pages.includes(name)) {
                                     setPages([...pages, name]);
                                     setSelectedComponents({ ...selectedComponents, [name]: [] });
                                     setCurrentPage(name);
                                  }
                                  setNewPageName('');
                                  setIsAddingPage(false);
                                }
                                if (e.key === 'Escape') {
                                  setIsAddingPage(false);
                                  setNewPageName('');
                                }
                              }}
                           />
                           <button 
                             onClick={() => {
                                if (newPageName.trim()) {
                                  const name = newPageName.trim();
                                  if (!pages.includes(name)) {
                                     setPages([...pages, name]);
                                     setSelectedComponents({ ...selectedComponents, [name]: [] });
                                     setCurrentPage(name);
                                  }
                                  setNewPageName('');
                                  setIsAddingPage(false);
                                }
                             }}
                             className="h-10 px-3 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-800 shrink-0"
                           >
                             Add
                           </button>
                           <button onClick={() => { setIsAddingPage(false); setNewPageName(''); }} className="h-10 w-10 flex shrink-0 items-center justify-center bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all hover:bg-zinc-200">
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                   </div>
                </div>
            </div>

            {/* 3. Global Ai Forge (Launchpad) */}
            <div className="mt-auto p-4 border-t border-zinc-50 space-y-3">
               <button 
                  onClick={handleGlobalAiGenerate}
                  disabled={isAiGenerating}
                  className={cn(
                    "w-full py-4 bg-zinc-950 text-white rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-zinc-950/20 active:scale-95 transition-all group overflow-hidden relative",
                    isAiGenerating && "opacity-80 grayscale"
                  )}
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <Sparkles className={cn("w-4 h-4", isAiGenerating ? "animate-spin" : "group-hover:rotate-12 transition-transform")} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Forge Global Intent</span>
               </button>
            </div>
         </div>
      </aside>

      {/* 2. CENTER: CANVAS (PREVIEW) */}
      <main className="flex-1 flex flex-col relative bg-[#fafafa]">
         {/* Device Switcher (Orchestron Interface) */}
         <header className="h-[80px] bg-white border-b border-zinc-200 flex items-center justify-between px-10 shrink-0 shadow-sm relative z-10">
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-6">
                    <button className="text-zinc-950 hover:bg-zinc-100 p-2 rounded-lg transition-all group">
                        <Monitor className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="text-zinc-300 hover:bg-zinc-100 p-2 rounded-lg transition-all group">
                        <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
                <div className="h-6 w-px bg-zinc-100" />
                <div className="flex flex-col">
                   <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Realtime Viewport</p>
                   <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black text-zinc-900 tracking-tighter uppercase italic">{currentPage} Overview</span>
                   </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-950 hover:bg-zinc-50 transition-all flex items-center gap-3"
                >
                   {isSaving ? <Save className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                   Sync State
                </button>
                <button 
                  onClick={handleEject}
                  className="px-8 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-black/10 active:scale-95"
                >
                   <Download className="w-3 h-3" />
                   Eject Production ZIP
                </button>
            </div>
         </header>

         {/* Site Preview Container */}
         <div className="flex-1 overflow-y-auto no-scrollbar relative p-12 bg-zinc-50/50">
            <div className="mx-auto bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] border border-zinc-100 overflow-hidden relative group">
               <div className="absolute inset-x-0 top-0 h-10 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
               </div>
               <div className="pt-0 min-h-[1200px]">
                  <SitePreview />
               </div>
            </div>

            {/* FAB: APPEND COMPONENT */}
            <button 
              onClick={() => {
                setPickerCategory(null);
                setPickerSlotIndex(null);
                setIsPickerOpen(true);
              }}
              className="fixed bottom-12 right-12 w-16 h-16 bg-zinc-950 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-20 group"
            >
               <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
         </div>
      </main>

      {/* 3. RIGHT BAR: INSPECTOR (ATTRS) */}
      <aside className="w-[420px] bg-white border-l border-zinc-200 flex flex-col shrink-0 z-20 shadow-xl shadow-black/[0.01]">
         <div className="p-8 border-b border-zinc-100 bg-[#fdfdfd] flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center">
                <Sliders className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Configuration</p>
                <h2 className="text-sm font-black text-zinc-950 uppercase italic tracking-tight leading-none">Inspector Panel</h2>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <InspectorPanel />
         </div>
      </aside>

      <ComponentPickerModal />
    </div>
  )
}
