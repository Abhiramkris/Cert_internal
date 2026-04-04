'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  ChevronRight, 
  Layout, 
  Palette, 
  Type, 
  MousePointer2, 
  ArrowRight,
  Sparkles,
  Globe,
  Monitor,
  Zap
} from 'lucide-react'
import { useStudio } from '../context/studio-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import staticQuestions from '@/utils/builder/static-questions.json'

const WIZARD_STEPS = [
  { id: 'pages', name: 'Pages', icon: Layout, description: 'Define your site architecture' },
  { id: 'details', name: 'Blueprint', icon: Sparkles, description: 'Inject mission-critical business data' },
  { id: 'colors', name: 'Palette', icon: Palette, description: 'Choose your brand identity' },
  { id: 'typography', name: 'Typography', icon: Type, description: 'Set your headline & body fonts' },
  { id: 'cta', name: 'Action', icon: MousePointer2, description: 'Configure interaction vectors' },
]

export function WizardShell() {
  const { 
    wizardStep, setWizardStep,
    pages, setPages,
    globalStyles, setGlobalStyles,
    contentOverrides, setContentOverrides,
    setFlowMode
  } = useStudio()

  // 1. Missing Data Guard Logic
  React.useEffect(() => {
    const requiredMissing = staticQuestions.filter(q => q.required && !contentOverrides[q.key])
    if (requiredMissing.length > 0 && wizardStep === 'pages') {
      // Suggest moving to details if pages are already set
      if (pages.length > 0) setWizardStep('details')
    }
  }, [])

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === wizardStep)
  const currentStep = WIZARD_STEPS[currentStepIndex] || WIZARD_STEPS[0]

  const nextStep = () => {
    // 2. Validation Guard
    if (wizardStep === 'details') {
      const missing = staticQuestions.filter(q => q.required && !contentOverrides[q.key])
      if (missing.length > 0) {
        alert(`Required Data Missing: ${missing.map(m => m.label).join(', ')}`)
        return
      }
    }

    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setWizardStep(WIZARD_STEPS[currentStepIndex + 1].id as any)
    } else {
      setFlowMode('builder')
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setWizardStep(WIZARD_STEPS[currentStepIndex - 1].id as any)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col font-sans overflow-y-auto no-scrollbar py-10 lg:py-0 lg:items-center lg:justify-center">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="relative w-full max-w-5xl px-6 lg:px-10 flex flex-col items-center">
        {/* Progress Header */}
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 lg:mb-20">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                  <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Architect v3.0</p>
                  <h1 className="text-lg font-black tracking-tighter text-zinc-950 uppercase italic leading-none">Studio Launch</h1>
              </div>
           </div>

           <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {WIZARD_STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex
                const isCompleted = idx < currentStepIndex
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500",
                      isActive ? "bg-zinc-950 text-white scale-110 shadow-xl shadow-black/10" : 
                      isCompleted ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400"
                    )}>
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < WIZARD_STEPS.length - 1 && (
                      <div className={cn(
                        "w-4 h-0.5 mx-1 rounded-full overflow-hidden",
                        isCompleted ? "bg-emerald-500" : "bg-zinc-100"
                      )} />
                    )}
                  </div>
                )
              })}
           </div>
        </div>

        {/* Content Body */}
        <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-20">
            {/* Left: Info Section */}
            <div className="w-full lg:w-1/3 space-y-8 lg:py-10">
               <AnimatePresence mode="wait">
                <motion.div 
                  key={currentStep.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="w-14 h-14 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <currentStep.icon className="w-6 h-6 text-zinc-950" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-zinc-950 uppercase italic tracking-tighter leading-none">
                      {currentStep.name}
                    </h2>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
           </div>

            {/* Right: Interaction Section */}
            <div className="flex-1 bg-white border border-zinc-100 rounded-[2rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-black/[0.02] flex flex-col relative overflow-hidden min-h-[400px]">
              <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                 <AnimatePresence mode="wait">
                    {wizardStep === 'pages' && <PagesStep key="pages" />}
                    {wizardStep === 'details' && <DetailsStep key="details" />}
                    {wizardStep === 'colors' && <ColorsStep key="colors" />}
                    {wizardStep === 'typography' && <TypographyStep key="typography" />}
                    {wizardStep === 'cta' && <CTAStep key="cta" />}
                 </AnimatePresence>
              </div>

              <div className="pt-10 flex items-center justify-between border-t border-zinc-50 mt-10">
                 <button 
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 disabled:opacity-0 transition-all"
                >
                  Go Back
                 </button>
                 <Button 
                    onClick={nextStep}
                    className="h-14 px-10 bg-zinc-950 text-white rounded-none font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all flex items-center gap-4 group"
                 >
                    {currentStepIndex === WIZARD_STEPS.length - 1 ? 'Launch Studio' : 'Next Step'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function DetailsStep() {
  const { contentOverrides, setContentOverrides } = useStudio()
  
  const updateField = (key: string, value: any) => {
    setContentOverrides({ ...contentOverrides, [key]: value })
  }

  // Group questions by role for better UI flow
  const roles = [...new Set(staticQuestions.map(q => q.role))]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
       {roles.map((role) => {
         const questions = staticQuestions.filter(q => q.role === role)
         return (
           <div key={role} className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-zinc-100" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">{role} // Protocols</span>
                 <div className="h-[1px] flex-1 bg-zinc-100" />
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {questions.map((q) => (
                    <div key={q.key} className="space-y-3">
                       <Label className="text-[10px] font-black text-zinc-950 uppercase tracking-widest flex items-center gap-2">
                          {q.label}
                          {q.required && <span className="text-rose-500 font-bold">*</span>}
                       </Label>
                       
                       {q.type === 'textarea' ? (
                          <textarea 
                            value={contentOverrides[q.key] || ''}
                            onChange={(e) => updateField(q.key, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full min-h-[100px] bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-xs font-bold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-300"
                          />
                       ) : q.type === 'select' ? (
                          <div className="flex flex-wrap gap-2">
                             {q.options?.map((opt: string) => (
                                <button
                                  key={opt}
                                  onClick={() => updateField(q.key, opt)}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    contentOverrides[q.key] === opt 
                                      ? "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-black/10" 
                                      : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                                  )}
                                >
                                   {opt}
                                </button>
                             ))}
                          </div>
                       ) : (
                          <input 
                            type={q.type === 'number' ? 'number' : 'text'}
                            value={contentOverrides[q.key] || ''}
                            onChange={(e) => updateField(q.key, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 text-xs font-bold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-300"
                          />
                       )}

                       {q.description && (
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter italic">{q.description}</p>
                       )}
                    </div>
                 ))}
              </div>
           </div>
         )
       })}
    </motion.div>
  )
}

function PagesStep() {
  const { pages, setPages } = useStudio()
  const options = ['Home', 'About', 'Services', 'Projects', 'Contact', 'Blog', 'Join Us']

  const togglePage = (page: string) => {
    if (pages.includes(page)) {
      if (pages.length > 1) setPages(pages.filter(p => p !== page))
    } else {
      setPages([...pages, page])
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
       <div className="space-y-6">
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans">Project Architecture</Label>
          <div className="grid grid-cols-2 gap-4">
             {options.map((option) => (
               <button
                  key={option}
                  onClick={() => togglePage(option)}
                  className={cn(
                    "p-6 rounded-[2rem] border transition-all flex items-center justify-between group",
                    pages.includes(option) 
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-black/10" 
                      : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                  )}
               >
                  <span className="text-xs font-black uppercase tracking-wider">{option}</span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    pages.includes(option) ? "bg-white border-white text-zinc-950" : "border-zinc-200 group-hover:border-zinc-400"
                  )}>
                    {pages.includes(option) && <Check className="w-3 h-3" />}
                  </div>
               </button>
             ))}
          </div>
       </div>
    </motion.div>
  )
}

function ColorsStep() {
  const { globalStyles, setGlobalStyles } = useStudio()
  
  const presets = [
    { name: 'Pitch Black', primary: '#000000', accent: '#18181b' },
    { name: 'Cyber Blue', primary: '#0f172a', accent: '#3b82f6' },
    { name: 'Forest Industrial', primary: '#052c22', accent: '#10b981' },
    { name: 'Deep Crimson', primary: '#450a0a', accent: '#ef4444' },
    { name: 'Royal Gold', primary: '#1c1917', accent: '#ca8a04' },
    { name: 'Monochrome Luxe', primary: '#111827', accent: '#9ca3af' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
       <div className="space-y-8">
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans">Primary Branding Identity</Label>
          <div className="grid grid-cols-2 gap-6">
             {presets.map((preset) => (
               <button
                  key={preset.name}
                  onClick={() => setGlobalStyles({ ...globalStyles, primary_color: preset.primary, accent_color: preset.accent })}
                  className={cn(
                    "p-6 rounded-[2rem] border transition-all flex flex-col gap-4 text-left group",
                    globalStyles.primary_color === preset.primary && globalStyles.accent_color === preset.accent
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-black/10" 
                      : "bg-white border-zinc-100 text-zinc-950 hover:border-zinc-200"
                  )}
               >
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                     <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-widest">{preset.name}</span>
                     <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter italic font-sans">Hex: {preset.primary}</span>
                  </div>
               </button>
             ))}
          </div>

          <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Custom Vector Input:</span>
             <div className="flex gap-4">
                <input 
                  type="color" 
                  value={globalStyles.primary_color}
                  onChange={(e) => setGlobalStyles({ ...globalStyles, primary_color: e.target.value })}
                  className="w-10 h-10 rounded-xl overflow-hidden border-none p-0 cursor-pointer"
                />
                <input 
                  type="color" 
                  value={globalStyles.accent_color}
                  onChange={(e) => setGlobalStyles({ ...globalStyles, accent_color: e.target.value })}
                  className="w-10 h-10 rounded-xl overflow-hidden border-none p-0 cursor-pointer"
                />
             </div>
          </div>
       </div>
    </motion.div>
  )
}

function TypographyStep() {
  const { globalStyles, setGlobalStyles } = useStudio()

  const fonts = [
    { name: 'Inter', provider: 'Sans' },
    { name: 'Mazzard H', provider: 'Display' },
    { name: 'Roboto Mono', provider: 'Technical' },
    { name: 'Outfit', provider: 'Geometric' },
    { name: 'Playfair Display', provider: 'Serif' },
    { name: 'Syne', provider: 'Brutalist' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
       <div className="space-y-8">
          <div className="space-y-4">
             <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans">Headline Vector (H1/H2)</Label>
             <div className="grid grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setGlobalStyles({ ...globalStyles, font_family_heading: font.name })}
                    className={cn(
                      "p-5 rounded-[1.5rem] border transition-all text-left group",
                      globalStyles.font_family_heading === font.name
                        ? "bg-zinc-950 border-zinc-950 text-white" 
                        : "bg-white border-zinc-100 text-zinc-950 hover:border-zinc-200"
                    )}
                  >
                    <p className="text-xl font-black italic tracking-tighter leading-none mb-1" style={{ fontFamily: font.name }}>{font.name}</p>
                    <p className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40 italic", globalStyles.font_family_heading === font.name ? "text-white" : "text-zinc-400")}>{font.provider}</p>
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-50">
             <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans">Body / Copy Vector (P/LI)</Label>
             <div className="grid grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setGlobalStyles({ ...globalStyles, font_family_body: font.name })}
                    className={cn(
                      "p-5 rounded-[1.5rem] border transition-all text-left",
                      globalStyles.font_family_body === font.name
                        ? "bg-zinc-950 border-zinc-950 text-white" 
                        : "bg-white border-zinc-100 text-zinc-950 hover:border-zinc-200"
                    )}
                  >
                    <p className="text-sm font-semibold tracking-tight leading-none mb-2" style={{ fontFamily: font.name }}>{font.name}</p>
                    <p className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40 italic", globalStyles.font_family_body === font.name ? "text-white" : "text-zinc-400")}>{font.provider}</p>
                  </button>
                ))}
             </div>
          </div>
       </div>
    </motion.div>
  )
}

function CTAStep() {
  const { globalStyles, setGlobalStyles } = useStudio()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
       <div className="space-y-8">
          <div className="space-y-4">
             <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans">Interaction Vector // Styling</Label>
             <div className="grid grid-cols-3 gap-4">
                {['none', 'md', 'full'].map((radius) => (
                   <button
                      key={radius}
                      onClick={() => setGlobalStyles({ ...globalStyles, button_radius: radius as any })}
                      className={cn(
                        "p-6 rounded-2xl border transition-all flex flex-col items-center gap-3",
                        globalStyles.button_radius === radius 
                          ? "bg-zinc-950 border-zinc-950 text-white" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-950 hover:border-zinc-200"
                      )}
                   >
                      <div className={cn(
                        "w-full h-8 bg-zinc-400/20 border border-current opacity-50 transition-all",
                        radius === 'none' ? 'rounded-none' : radius === 'md' ? 'rounded-lg' : 'rounded-full'
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{radius}</span>
                   </button>
                ))}
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-50">
             <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans">Visual Technique // Fill</Label>
             <div className="grid grid-cols-3 gap-4">
                {['solid', 'glass', 'ghost'].map((style) => (
                   <button
                      key={style}
                      onClick={() => setGlobalStyles({ ...globalStyles, button_style: style as any })}
                      className={cn(
                        "p-6 rounded-2xl border transition-all flex flex-col items-center gap-3",
                        globalStyles.button_style === style 
                          ? "bg-zinc-950 border-zinc-950 text-white" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-950 hover:border-zinc-200"
                      )}
                   >
                      <div className={cn(
                        "w-full h-8 opacity-50",
                        style === 'solid' ? 'bg-current' : style === 'glass' ? 'bg-current/10 border border-current' : 'border border-dashed border-current'
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{style}</span>
                   </button>
                ))}
             </div>
          </div>

          <div className="p-10 border border-zinc-100 rounded-[2.5rem] bg-zinc-50 flex flex-col items-center gap-6">
             <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic italic">Action Preview (Real-time)</Label>
             <button 
                className={cn(
                  "px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3",
                   globalStyles.button_radius === 'none' ? 'rounded-none' : globalStyles.button_radius === 'md' ? 'rounded-lg' : 'rounded-full',
                   globalStyles.button_style === 'solid' ? 'bg-zinc-950 text-white' : globalStyles.button_style === 'glass' ? 'bg-zinc-950/10 border border-zinc-950 text-zinc-950' : 'border border-zinc-950 text-zinc-950'
                )}
                style={{ 
                  backgroundColor: globalStyles.button_style === 'solid' ? globalStyles.primary_color : undefined,
                  borderColor: globalStyles.button_style !== 'solid' ? globalStyles.primary_color : undefined,
                  color: globalStyles.button_style === 'solid' ? '#fff' : globalStyles.primary_color
                }}
             >
                Initiate Breakthrough <ArrowRight className="w-4 h-4" />
             </button>
          </div>
       </div>
    </motion.div>
  )
}
