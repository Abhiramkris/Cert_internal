import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Zap, Target, MousePointer2 } from 'lucide-react';
import ai from './ai.json';

export const CTA_INDUSTRIAL_GLOW = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const glowColor = settings?.glow_color || 'emerald';
    const glowClasses = 
      glowColor === 'blue' ? "bg-blue-500/20" :
      glowColor === 'purple' ? "bg-purple-500/20" :
      glowColor === 'white' ? "bg-white/10" :
      "bg-emerald-500/20";

    return (
      <section className="w-full bg-zinc-950 py-32 px-8 flex justify-center overflow-hidden relative">
        {/* Volumetric Glow */}
        <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[140px] rounded-full opacity-50", glowClasses)} />
        
        <div className="w-full max-w-4xl relative z-10 text-center space-y-10">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
               <div className="w-12 h-[1px] bg-white/10" />
               <Zap className="w-5 h-5 text-white/40" />
               <div className="w-12 h-[1px] bg-white/10" />
            </div>
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter text-white leading-[0.85] uppercase" style={h2Font}>
              {content?.h2 || "Initiate transformation."}
            </h2>
            <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto" style={pFont}>
              {content?.description || "Join the global network of enterprises leveraging precision AI."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <button className="h-16 px-12 bg-white text-zinc-950 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-white/10 hover:scale-105 transition-all">
                {content?.cta_text || 'Get Started'}
                <ArrowRight className="w-4 h-4" />
             </button>
             <button className="h-16 px-12 bg-white/5 border border-white/10 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                {content?.secondary_text || 'Learn More'}
             </button>
          </div>
        </div>
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, MousePointer2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IndustrialGlowCTA() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const glowColor = settings?.glow_color || 'emerald';
  const glowClasses = 
    glowColor === 'blue' ? "bg-blue-600/30 shadow-[0_0_100px_rgba(37,99,235,0.2)]" :
    glowColor === 'purple' ? "bg-purple-600/30 shadow-[0_0_100px_rgba(147,51,234,0.2)]" :
    glowColor === 'white' ? "bg-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)]" :
    "bg-emerald-600/30 shadow-[0_0_100px_rgba(16,185,129,0.2)]";

  return (
    <section className="w-full bg-zinc-950 py-32 md:py-48 px-6 md:px-12 flex justify-center overflow-hidden relative">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Volumetric Glow Focal Point */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blur-[160px] rounded-full", glowClasses)} 
      />
      
      <div className="w-full max-w-5xl relative z-10 text-center space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div className="flex items-center justify-center gap-6">
             <div className="w-16 h-[1px] bg-white/10" />
             <motion.div
               animate={{ rotate: [0, 360] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             >
                <Sparkles className="w-6 h-6 text-white/20" />
             </motion.div>
             <div className="w-16 h-[1px] bg-white/10" />
          </div>
          
          <h2 
            className="text-5xl md:text-8xl font-black italic tracking-tighter text-white leading-[0.8] uppercase"
            style={{ fontFamily: global.font_family_heading }}
          >
            {content.h2}
          </h2>
          
          <p 
            className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: global.font_family_body }}
          >
            {content.description}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
           <motion.button 
             whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,255,255,0.1)' }}
             whileTap={{ scale: 0.95 }}
             className="h-20 px-16 bg-white text-zinc-950 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all"
           >
              {content.cta_text}
              <ArrowRight className="w-5 h-5" />
           </motion.button>
           
           <motion.button 
             whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
             whileTap={{ scale: 0.95 }}
             className="h-20 px-16 bg-white/5 border border-white/10 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all"
           >
              {content.secondary_text}
           </motion.button>
        </motion.div>
        
        {/* Terminal Line Decor */}
        <div className="pt-20 flex items-center justify-center gap-4 opacity-10">
           <div className="w-2 h-2 bg-white rounded-full" />
           <div className="w-24 h-[1px] bg-white" />
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Connection Established</span>
           <div className="w-24 h-[1px] bg-white" />
           <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
`
};
