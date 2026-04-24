import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ai from './ai.json';

export const HERO_WELLNESS_COLLAGE = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const bgColor = settings?.background_color === 'dark-green' ? 'bg-[#1A2E1D]' : 'bg-white';
    const textColor = settings?.text_color === 'zinc-600' ? 'text-zinc-600' : 'text-white';
    const accentColor = 'bg-[#DFFF1A]';
    const accentText = 'text-[#1A2E1D]';

    return (
      <section className={cn("w-full py-24 px-8 flex flex-col items-center overflow-hidden", bgColor)}>
        <div className="max-w-4xl text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DFFF1A]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#DFFF1A]" style={pFont}>
              {content?.eyebrow || 'Empower your journey'}
            </span>
          </div>
          <h1 className={cn("text-5xl md:text-7xl font-bold tracking-tight", textColor)} style={h2Font}>
            {content?.h1 || "Empower your mental health journey!"}
          </h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto" style={pFont}>
            {content?.description || "Find clarity, healing, and peace with our professional community."}
          </p>
          <div className="pt-4">
             <button className={cn("px-8 py-4 rounded-full font-bold flex items-center gap-2 mx-auto transition-transform hover:scale-105", accentColor, accentText)}>
                {content?.cta_text || 'Book Consultation'}
                <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Mock Collage Grid */}
        <div className="relative w-full max-w-5xl aspect-[16/9] mt-8 grid grid-cols-4 gap-4">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="bg-zinc-800/50 rounded-2xl overflow-hidden aspect-square border border-white/5">
                <img 
                  src={content?.images?.[i] || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400"} 
                  className="w-full h-full object-cover opacity-80"
                  alt={`Wellness ${i}`}
                />
             </div>
           ))}
        </div>
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WellnessCollageHero() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const bgColor = settings?.background_color === 'dark-green' ? 'bg-[#1A2E1D]' : 
                  settings?.background_color === 'navy' ? 'bg-[#0F172A]' :
                  settings?.background_color === 'soft-beige' ? 'bg-[#F5F5F4]' :
                  settings?.background_color === 'lavender' ? 'bg-[#F5F3FF]' : 'bg-white';
  
  const textColor = settings?.text_color === 'white' ? 'text-white' : 
                    settings?.text_color === 'black' ? 'text-[#1A2E1D]' : 'text-zinc-600';

  const accentColor = 'bg-[#DFFF1A]';
  const accentText = 'text-[#1A2E1D]';

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const collageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 } }
  };

  // Collage layouts
  const getLayoutStyles = (index: number) => {
    const layout = settings?.collage_layout || 'heart';
    if (layout === 'heart') {
       const positions = [
         { top: '20%', left: '40%' }, { top: '20%', left: '50%' },
         { top: '35%', left: '30%' }, { top: '35%', left: '45%' }, { top: '35%', left: '60%' },
         { top: '55%', left: '35%' }, { top: '55%', left: '55%' },
         { top: '75%', left: '45%' }
       ];
       return { 
         position: 'absolute', 
         ...positions[index], 
         width: '12%', 
         zIndex: index % 2 === 0 ? 10 : 20,
         transform: 'translate(-50%, -50%)'
       };
    }
    return {}; // Fallback to flex/grid logic handled in JSX
  };

  return (
    <section className={cn("w-full min-h-screen py-24 md:py-32 px-6 flex flex-col items-center justify-center overflow-hidden relative", bgColor)}>
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <motion.div 
           animate={{ 
             scale: [1, 1.1, 1],
             opacity: [0.05, 0.1, 0.05]
           }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -top-[20%] -left-[10%] w-[60%] aspect-square rounded-full bg-[#DFFF1A] blur-[120px]" 
         />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-5xl text-center space-y-8 z-10 relative"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
          <div className="w-10 h-[1px] bg-[#DFFF1A]/40" />
          <Sparkles className="w-4 h-4 text-[#DFFF1A]" />
          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#DFFF1A]" style={{ fontFamily: global.font_family_body }}>
            {content.eyebrow}
          </span>
          <div className="w-10 h-[1px] bg-[#DFFF1A]/40" />
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className={cn("text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic", textColor)}
          style={{ fontFamily: global.font_family_heading }}
        >
          {content.h1.split(' ').map((word, i) => (
            <span key={i} className="block">{word}</span>
          ))}
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className={cn("text-xl md:text-2xl opacity-70 max-w-2xl mx-auto font-medium leading-relaxed", textColor)}
          style={{ fontFamily: global.font_family_body }}
        >
          {content.description}
        </motion.p>

        <motion.div variants={itemVariants} className="pt-6">
           <button className={cn("group px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto transition-all duration-500 hover:shadow-[0_0_40px_rgba(223,255,26,0.3)]", accentColor, accentText)}>
              {content.cta_text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
           </button>
        </motion.div>
      </motion.div>

      {/* Image Collage Section */}
      <motion.div 
        variants={collageVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className={cn(
          "w-full max-w-7xl relative mt-20",
          settings?.collage_layout === 'heart' ? "h-[600px]" : "grid grid-cols-2 md:grid-cols-4 gap-4 px-4"
        )}
      >
        {content.images.map((img: string, i: number) => {
          const style = settings?.collage_layout === 'heart' ? getLayoutStyles(i) : {};
          return (
            <motion.div 
              key={i}
              style={style as any}
              whileHover={settings?.animation_intensity === 'dynamic' ? { scale: 1.05, zIndex: 50, rotate: i % 2 === 0 ? 3 : -3 } : {}}
              className={cn(
                "overflow-hidden shadow-2xl relative group",
                settings?.collage_layout === 'heart' ? "rounded-3xl border-2 border-[#1A2E1D]" : "aspect-[3/4] rounded-[2rem]",
                "bg-zinc-800"
              )}
            >
               <img 
                 src={img} 
                 alt="Wellness collage" 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#1A2E1D]/40 to-transparent opacity-60" />
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Decorative Accents */}
      <div className="absolute bottom-10 left-10 text-[#DFFF1A]/20 pointer-events-none hidden lg:block">
         <span className="text-[12rem] font-black italic tracking-tighter leading-none select-none">PEACE</span>
      </div>
    </section>
  );
}
`
};
