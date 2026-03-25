import { cn } from '@/lib/utils';

export const HERO_SPLIT = {
  name: 'Split Layout Hero',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const style = config.button_style || 'solid';
    const ctaCount = settings?.cta_count || 1;
    const hierarchy = settings?.hierarchy || 'h1';
    const variant = settings?.layout_variant || 'standard';
    
    const buttonClass = `px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-full transition-all ${
      style === 'solid' ? 'bg-white text-zinc-950 shadow-xl' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-100 to-zinc-400 text-zinc-950 shadow-xl' :
      style === 'outline' ? 'border-2 border-white text-white hover:bg-white hover:text-zinc-950' :
      'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl'
    }`;
    
    const isReversed = variant === 'split-reversed';
    const HeadingTag = (hierarchy || 'h1') as any;

    return (
      <section className="py-20 px-8 bg-zinc-950 text-white border-b border-zinc-900 overflow-hidden">
        <div className={cn(
          "grid grid-cols-2 gap-10 items-center",
          isReversed && "grid-flow-dense"
        )}>
          <div className={cn("space-y-6", isReversed ? "col-start-2" : "col-start-1")}>
            <HeadingTag 
              className={cn(
                "font-black tracking-tighter italic leading-none",
                hierarchy === 'h1' ? "text-4xl" : hierarchy === 'h2' ? "text-2xl" : "text-xl"
              )}
              style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
            >
              {content?.h1 || 'Bold Innovation'}
            </HeadingTag>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">{content?.description || 'Pushing the boundaries of digital craft.'}</p>
            <div className="flex gap-4">
               <button className={buttonClass}>{content?.cta_primary || 'Start project'}</button>
               {ctaCount > 1 && <button className="px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10 text-white/40">Secondary</button>}
            </div>
          </div>
          <div className={cn(
            "aspect-[4/5] bg-zinc-900 rounded-3xl border border-zinc-800 skew-y-2 flex items-center justify-center",
            isReversed ? "col-start-1" : "col-start-2"
          )}>
             <div className="w-1/2 aspect-square border-2 border-white/5 rounded-full animate-pulse" />
          </div>
        </div>
      </section>
    );
  },
  code: (config: any, content: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import config from '../data/config.json';

// Industrial State-Machine Utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function Hero() {
  const settings = config.settings?.HERO_SPLIT || { animation: 'fade' };
  const global = config.styles;
  const ctaCount = settings.cta_count || 1;
  const align = global.text_alignment || 'left';
  const hierarchy = settings.hierarchy || 'h1';
  const variant = settings.layout_variant || 'standard';
  
  const isReversed = variant === 'split-reversed';

  const variants = {
    none: { initial: {}, animate: {} },
    fade: { initial: { x: isReversed ? 20 : -20, opacity: 0 }, whileInView: { x: 0, opacity: 1 } },
    'slide-up': { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const imageVariants = {
    none: { initial: {}, animate: {} },
    fade: { initial: { x: isReversed ? -20 : 20, opacity: 0 }, whileInView: { x: 0, opacity: 1 } },
    'slide-up': { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;
  const selectedImage = imageVariants[settings.animation as keyof typeof imageVariants] || imageVariants.fade;

  const alignmentClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const mx = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  const HeadingTag = hierarchy as any;

  return (
    <section className="py-24 px-8 bg-zinc-950 text-white overflow-hidden">
      <div className={cn(
        "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center",
        isReversed && "lg:grid-flow-dense"
      )}>
        <motion.div 
          {...selected}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={cn("flex flex-col space-y-10", alignmentClass, isReversed && "lg:col-start-2")}
        >
          <HeadingTag 
            className={cn(
              "font-black tracking-tighter leading-none italic",
              hierarchy === 'h1' ? "text-7xl" : hierarchy === 'h2' ? "text-5xl" : "text-3xl"
            )}
            style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
          >
            {config.content.h1 || 'Experience the Future of Digital Excellence'}
          </HeadingTag>
          <p className={cn("text-lg text-zinc-400 font-medium leading-relaxed max-w-lg", mx)}>
            {config.content.description || 'Our agency delivers premium solutions tailored to your unique business needs.'}
          </p>
          <div className="flex flex-wrap items-center gap-8">
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
        
        <motion.div 
          {...selectedImage}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={cn("relative", isReversed && "lg:col-start-1")}
        >
          <div className="aspect-[4/5] bg-zinc-900 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-2xl skew-y-3 rotate-3 hover:skew-y-0 hover:rotate-0 transition-all duration-700">
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center p-12">
               <div className="w-full aspect-square border-2 border-white/10 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-2/3 aspect-square border-2 border-white/5 rounded-full" />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
`
};
