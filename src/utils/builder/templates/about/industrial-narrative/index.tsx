import React from 'react';
import { cn } from '@/lib/utils';
import { Target, Cpu, Boxes, ArrowRight, CornerRightDown } from 'lucide-react';
import ai from './ai.json';

export const ABOUT_INDUSTRIAL_NARRATIVE = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const imageSide = settings?.image_side || 'right';

    return (
      <section className="w-full bg-white py-24 px-8 flex justify-center overflow-hidden">
        <div className="w-full max-w-7xl">
          <div className={cn(
            "flex flex-col lg:flex-row items-center gap-16 lg:gap-24",
            imageSide === 'left' && "lg:flex-row-reverse"
          )}>
            {/* Text Content */}
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-[1px] bg-zinc-400" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400" style={pFont}>
                      {content?.eyebrow || 'Philosophy'}
                   </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-zinc-950 leading-[0.9] uppercase" style={h2Font}>
                  {content?.h2 || "Engineering the future."}
                </h2>
              </div>
              
              <p className="text-xl text-zinc-500 leading-relaxed max-w-xl" style={pFont}>
                {content?.description || "Bridges the gap between engineering and digital experience."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {(content?.points || []).map((point: any, i: number) => (
                   <div key={i} className="space-y-3">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center">
                            <CornerRightDown className="w-3.5 h-3.5 text-zinc-950" />
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-950" style={h2Font}>
                            {point.label}
                         </h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed" style={pFont}>
                         {point.desc}
                      </p>
                   </div>
                 ))}
              </div>
            </div>

            {/* Image Section */}
            <div className="flex-1 relative">
               <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                  <img 
                    src={content?.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"}
                    alt="Industrial Narrative"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/20 to-transparent" />
               </div>
               
               {/* Decorative Geometric Overlay */}
               <div className={cn(
                 "absolute -bottom-10 w-48 h-48 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center shadow-2xl",
                 imageSide === 'right' ? "-left-10" : "-right-10"
               )}>
                  <div className="text-center space-y-2">
                     <span className="text-[40px] text-white font-black italic tracking-tighter">98.4%</span>
                     <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Precision Delta</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Cpu, Boxes, ArrowRight, CornerRightDown, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IndustrialNarrative() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const imageSide = settings?.image_side || 'right';
  const intensity = settings?.animation_intensity || 'dynamic';

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const textVariants = {
    initial: { opacity: 0, x: imageSide === 'right' ? -30 : 30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const imageVariants = {
    initial: { opacity: 0, scale: 0.9, rotate: imageSide === 'right' ? 2 : -2 },
    animate: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="w-full bg-white py-24 md:py-32 px-6 md:px-12 flex justify-center overflow-hidden">
      <div className="max-w-7xl w-full">
        <div className={cn(
          "flex flex-col lg:flex-row items-center gap-16 lg:gap-32",
          imageSide === 'left' && "lg:flex-row-reverse"
        )}>
          {/* Text Content */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="flex-1 space-y-12"
          >
            <div className="space-y-6">
              <motion.div variants={textVariants} className="flex items-center gap-4">
                 <div className="w-12 h-[1px] bg-zinc-200" />
                 <span 
                   className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-400"
                   style={{ fontFamily: global.font_family_body }}
                 >
                    {content.eyebrow}
                 </span>
              </motion.div>
              
              <motion.h2 
                variants={textVariants}
                className="text-5xl md:text-7xl font-black italic tracking-tighter text-zinc-950 leading-[0.85] uppercase"
                style={{ fontFamily: global.font_family_heading }}
              >
                {content.h2}
              </motion.h2>
            </div>
            
            <motion.p 
              variants={textVariants}
              className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-xl"
              style={{ fontFamily: global.font_family_body }}
            >
              {content.description}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
               {content.points.map((point: any, i: number) => (
                 <motion.div 
                   key={i} 
                   variants={textVariants}
                   className="space-y-4 group"
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-950 group-hover:rotate-90 transition-all duration-500 shadow-sm">
                          <CornerRightDown className="w-4 h-4 text-zinc-950 group-hover:text-white transition-colors" />
                       </div>
                       <h4 
                         className="text-[11px] font-black uppercase tracking-widest text-zinc-950"
                         style={{ fontFamily: global.font_family_heading }}
                       >
                          {point.label}
                       </h4>
                    </div>
                    <p 
                      className="text-sm md:text-base text-zinc-400 leading-relaxed"
                      style={{ fontFamily: global.font_family_body }}
                    >
                       {point.desc}
                    </p>
                 </motion.div>
               ))}
            </div>
          </motion.div>

          {/* Image Section */}
          <motion.div 
            variants={imageVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex-1 relative"
          >
             <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] group">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1 }}
                  src={content.image}
                  alt="Industrial Architecture"
                  className="w-full h-full object-cover"
                />
                {/* Image Glitch Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             </div>
             
             {/* Decorative Geometric Overlay */}
             <motion.div 
               animate={{ 
                 y: [0, -10, 0],
                 rotate: [0, 1, 0]
               }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className={cn(
                 "absolute -bottom-12 w-56 h-56 bg-zinc-950 rounded-[3.5rem] flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.4)] z-20",
                 imageSide === 'right' ? "-left-12" : "-right-12"
               )}
             >
                <div className="text-center space-y-3 p-8">
                   <motion.span 
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     transition={{ delay: 1 }}
                     className="text-5xl text-white font-black italic tracking-tighter block"
                   >
                     98.4%
                   </motion.span>
                   <div className="w-12 h-[1px] bg-white/20 mx-auto" />
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 leading-tight">
                     Precision Manufacturing Delta
                   </p>
                </div>
             </motion.div>

             {/* Frame Corner Accents */}
             <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-zinc-100 rounded-tr-[4rem] pointer-events-none" />
             <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-zinc-100 rounded-bl-[4rem] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
`
};
