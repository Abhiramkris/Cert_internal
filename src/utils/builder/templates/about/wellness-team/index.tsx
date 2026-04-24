import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';
import ai from './ai.json';

export const ABOUT_WELLNESS_TEAM = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const imageClass = settings?.image_shape === 'circle' ? 'rounded-full' : 
                       settings?.image_shape === 'blob' ? 'rounded-[3rem]' : 'rounded-3xl';

    return (
      <section className="w-full py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-[#1A2E1D]" style={h2Font}>
              {content?.h2 || "People behind the Healing Path"}
            </h2>
            <p className="text-zinc-500" style={pFont}>
              {content?.description || "Our team of dedicated professionals is here to support you."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {(content?.experts || [...Array(6)]).map((expert: any, i: number) => (
              <div key={i} className="space-y-4 group">
                <div className={cn("aspect-square bg-zinc-100 overflow-hidden relative border border-zinc-50 shadow-sm", imageClass)}>
                   <img 
                     src={expert?.image || \`https://i.pravatar.cc/300?u=\${i}\`} 
                     className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
                     alt="Expert"
                   />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1A2E1D]" style={h2Font}>{expert?.name || 'Dr. Sarah Wilson'}</h4>
                  {settings?.show_role && (
                    <p className="text-[10px] font-medium uppercase tracking-widest text-[#DFFF1A] bg-[#1A2E1D] inline-block px-2 py-0.5 rounded-sm" style={pFont}>
                      {expert?.role || 'Psychologist'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WellnessTeamGrid() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const imageClass = settings?.image_shape === 'circle' ? 'rounded-full' : 
                     settings?.image_shape === 'blob' ? 'rounded-[3rem] rotate-3 group-hover:rotate-0' : 'rounded-[2.5rem]';

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    initial: { 
      opacity: 0, 
      y: settings?.animation_type === 'slide-up' ? 30 : 0,
      scale: settings?.animation_type === 'pop-in' ? 0.9 : 1
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="w-full py-24 md:py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-20 md:mb-28">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             viewport={{ once: true }}
             className="w-16 h-1 bg-[#DFFF1A] mx-auto uppercase tracking-[0.5em] text-[10px] font-black text-transparent rounded-full"
           >
             divider
           </motion.div>
           <motion.h2 
             initial={{ y: 20, opacity: 0 }}
             whileInView={{ y: 0, opacity: 1 }}
             viewport={{ once: true }}
             className="text-4xl md:text-6xl font-black tracking-tighter text-[#1A2E1D] uppercase bg-clip-text"
             style={{ fontFamily: global.font_family_heading }}
           >
             {content.h2}
           </motion.h2>
           <motion.p 
             initial={{ y: 20, opacity: 0 }}
             whileInView={{ y: 0, opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium"
             style={{ fontFamily: global.font_family_body }}
           >
             {content.description}
           </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12"
        >
          {content.experts.map((expert: any, i: number) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="group space-y-6 text-center"
            >
              <div className={cn(
                "aspect-square bg-zinc-50 overflow-hidden relative border border-zinc-100 shadow-sm transition-all duration-700",
                imageClass
              )}>
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  src={expert.image} 
                  alt={expert.name} 
                  className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Social Overlay */}
                <div className="absolute inset-0 bg-[#1A2E1D]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                   <motion.div whileHover={{ y: -3 }} className="w-8 h-8 rounded-full bg-[#DFFF1A] flex items-center justify-center cursor-pointer">
                      <Linkedin className="w-4 h-4 text-[#1A2E1D]" />
                   </motion.div>
                   <motion.div whileHover={{ y: -3 }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer">
                      <Mail className="w-4 h-4 text-[#1A2E1D]" />
                   </motion.div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 
                  className="text-lg font-black text-[#1A2E1D] tracking-tight"
                  style={{ fontFamily: global.font_family_heading }}
                >
                  {expert.name}
                </h4>
                {settings?.show_role && (
                  <p 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3A3A3]"
                    style={{ fontFamily: global.font_family_body }}
                  >
                    {expert.role}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
`
};
