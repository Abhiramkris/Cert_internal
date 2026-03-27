import { cn } from '@/lib/utils';

export const HERO_SPLIT = {
  name: 'Split Layout Hero',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const style = config.button_style || 'solid';
    const ctaCount = settings?.cta_count || 1;
    const hierarchy = settings?.hierarchy || 'h1';
    const variant = settings?.layout_variant || 'standard';
    
    const shadowClass = config.button_shadow === 'soft' ? 'shadow-lg shadow-white/10' : 
                        config.button_shadow === 'hard' ? 'shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]' : '';
    const paddingClass = config.button_padding === 'compact' ? 'px-6 py-2' : 
                         config.button_padding === 'large' ? 'px-12 py-5' : 'px-8 py-3';

    const buttonClass = cn(
      "text-[9px] font-black uppercase tracking-widest rounded-full transition-all",
      paddingClass,
      shadowClass,
      style === 'solid' ? 'bg-white text-zinc-950 shadow-xl' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-100 to-zinc-400 text-zinc-950 shadow-xl' :
      style === 'outline' ? 'border-2 border-white text-white hover:bg-white hover:text-zinc-950' :
      'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl'
    );
    
    const isReversed = variant === 'split-reversed';
    const HeadingTag = (hierarchy || 'h1') as any;

    return (
      <section className="py-16 md:py-20 px-8 bg-zinc-950 text-white border-b border-zinc-900 overflow-hidden">
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto",
          isReversed && "grid-flow-dense"
        )}>
          <div className={cn("space-y-6", isReversed ? "md:col-start-2" : "md:col-start-1")}>
            <HeadingTag 
              className={cn(
                "font-black tracking-tighter italic leading-none"
              )}
              style={{ 
                fontFamily: config.font_family_heading, 
                fontWeight: config.font_weight_heading,
                fontSize: `${hierarchy === 'h1' ? config.font_size_h1 * 0.7 : hierarchy === 'h2' ? config.font_size_h2 * 0.7 : config.font_size_body * 0.7}px`
              }}
            >
              {content?.h1 || 'Bold Innovation'}
            </HeadingTag>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-sm">
              {content?.description || 'Pushing the boundaries of digital craft through elite engineering.'}
            </p>
            <div className="flex flex-wrap gap-4">
               <button className={buttonClass}>{content?.cta_primary || 'Start project'}</button>
               {(ctaCount > 1 && config.show_secondary_cta !== false) && (
                 <button className={cn(paddingClass, "text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10 text-white/40")}>Secondary</button>
               )}
            </div>
          </div>
          <div className={cn(
            "aspect-square md:aspect-[4/5] bg-zinc-900 rounded-3xl border border-zinc-800 skew-y-2 relative overflow-hidden",
            isReversed ? "md:col-start-1" : "md:col-start-2"
          )}>
             <img src="/assets/hero-placeholder.png" alt="" className="w-full h-full object-cover grayscale opacity-50" />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent" />
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

  const btnAnims = {
    none: { whileHover: {}, whileTap: {} },
    pulse: { 
      animate: { scale: [1, 1.02, 1] }, 
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 }
    },
    scale: {
      whileHover: { scale: 1.05, y: -2 },
      whileTap: { scale: 0.98 }
    }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;
  const selectedBtnAnim = btnAnims[global.button_animation as keyof typeof btnAnims] || btnAnims.scale;

  const alignmentClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const mx = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  const HeadingTag = hierarchy as any;

  return (
    <section className="py-24 md:py-48 px-8 bg-zinc-950 text-white overflow-hidden relative">
      <div className={cn(
        "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center",
        isReversed && "lg:grid-flow-dense"
      )}>
        <motion.div 
          {...selected}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={cn("flex flex-col space-y-10 md:space-y-14", alignmentClass, isReversed && "lg:col-start-2")}
        >
          <HeadingTag 
            className={cn(
              "font-black tracking-tighter leading-[0.9] italic"
            )}
            style={{ 
              fontFamily: global.font_family_heading, 
              fontWeight: global.font_weight_heading,
              fontSize: \`clamp(\${Math.min(parseInt(global.font_size_h1 || '48') * 0.7, 40)}px, 10vw, \${global.font_size_h1 || '48'}px)\`
            }}
          >
            {config.content.h1 || 'Experience the Future of Digital Excellence'}
          </HeadingTag>
          <p className={cn("text-lg md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-xl", mx)}>
            {config.content.description || 'Our agency delivers premium solutions tailored to your unique business needs.'}
          </p>
          <div className="flex flex-wrap items-center gap-6 md:gap-10">
            <motion.button 
              {...selectedBtnAnim}
              className="btn-primary !bg-white !text-zinc-950"
            >
              {config.content.cta_primary || 'Launch Project'}
            </motion.button>
            
            {(ctaCount > 1 && global.show_secondary_cta !== false) && (
              <motion.button 
                {...selectedBtnAnim}
                className="btn-secondary !border-white/10 !text-white/60 hover:!text-white"
              >
                {config.content.cta_secondary || 'Learn More'}
              </motion.button>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, rotate: isReversed ? -2 : 2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn("relative group", isReversed && "lg:col-start-1")}
        >
          <div className="aspect-square md:aspect-[4/5] bg-zinc-900 rounded-[3rem] md:rounded-[4rem] border border-zinc-800 overflow-hidden shadow-2xl transition-all duration-700">
             <img 
               src="/assets/hero-placeholder.png" 
               alt="" 
               className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-1000" />
          </div>
          
          {/* Accent Element */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
        </motion.div>
      </div>
    </section>
  );
}
`
};
