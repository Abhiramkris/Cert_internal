import React from 'react';

export const HERO_CENTERED = {
  name: 'Centered Hero',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const style = config.button_style || 'solid';
    const align = config.text_alignment || 'center';
    const ctaCount = settings?.cta_count || 1;
    
    const buttonClass = `px-8 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
      style === 'solid' ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-100' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-900 to-zinc-500 text-white shadow-xl' :
      style === 'outline' ? 'border-2 border-zinc-900 text-zinc-900 shadow-sm' :
      'bg-zinc-100/50 backdrop-blur-md border border-zinc-200 text-zinc-900 shadow-xl'
    }`;
    
    const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
    const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';
    const mx = align === 'left' ? 'ml-0' : align === 'right' ? 'mr-0' : 'mx-auto';

    return (
      <section className={`py-20 px-8 bg-white border-b border-zinc-50 relative overflow-hidden ${alignmentClass}`}>
        <div className={`relative z-10 flex flex-col ${containerAlign}`}>
          <div className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-6">Premium Agency</div>
          <h1 
            className="text-4xl font-black text-zinc-900 tracking-tight leading-tight mb-4"
            style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
          >
            {content?.h1 || 'Experience Excellence'}
          </h1>
          <p className={`text-sm text-zinc-500 font-medium mb-8 max-w-md ${mx}`}>{content?.description || 'Tailored digital solutions for modern businesses.'}</p>
          <div className="flex gap-4">
             <button className={buttonClass}>{content?.cta_primary || 'Explore'}</button>
             {ctaCount > 1 && <button className="px-8 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 text-zinc-400">Secondary</button>}
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white -z-0" />
      </section>
    );
  },
  code: (config: any, content: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import config from '../data/config.json';

export default function Hero() {
  const settings = config.settings?.HERO_CENTERED || { animation: 'fade' };
  const global = config.styles;
  const ctaCount = settings.cta_count || 1;
  const align = global.text_alignment || 'center';
  
  const variants = {
    none: { initial: {}, animate: {} },
    fade: { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    'slide-up': { initial: { y: 40, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;
  
  const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';
  const mx = align === 'left' ? 'ml-0' : align === 'right' ? 'mr-0' : 'mx-auto';

  return (
    <section className="relative py-32 px-8 overflow-hidden bg-white">
      <motion.div 
        {...selected}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={\`max-w-4xl \${mx} \${alignmentClass} flex flex-col \${containerAlign} relative z-10\`}
      >
        <div className="inline-block px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">
          Crafting Digital Excellence
        </div>
        <h1 
          className="text-7xl font-black text-zinc-900 tracking-tight leading-[1.05] mb-8"
          style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
        >
          {config.content.h1 || 'Experience the Future of Digital Excellence'}
        </h1>
        <p className={\`text-xl text-zinc-500 font-medium leading-relaxed mb-12 max-w-2xl \${mx}\`}>
          {config.content.description || 'Our agency delivers premium solutions tailored to your unique business needs.'}
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            {config.content.cta_primary || 'Launch Project'}
          </motion.button>
          
          {ctaCount > 1 && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              {config.content.cta_secondary || 'Learn More'}
            </motion.button>
          )}
        </div>
      </motion.div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white -z-10" />
    </section>
  );
}
`
};
