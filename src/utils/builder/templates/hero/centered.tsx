import React from 'react';
import { cn } from '@/lib/utils';

export const HERO_CENTERED = {
  name: 'Centered Hero',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const style = config.button_style || 'solid';
    const align = config.text_alignment || 'center';
    const ctaCount = settings?.cta_count || 1;
    const hierarchy = settings?.hierarchy || 'h1';
    const variant = settings?.layout_variant || 'standard';
    
    const shadowClass = config.button_shadow === 'soft' ? 'shadow-lg shadow-zinc-200/50' : 
                        config.button_shadow === 'hard' ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : '';
    const paddingClass = config.button_padding === 'compact' ? 'px-6 py-2' : 
                         config.button_padding === 'large' ? 'px-12 py-5' : 'px-8 py-3';
    
    const buttonClass = cn(
      "text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
      paddingClass,
      shadowClass,
      style === 'solid' ? 'bg-zinc-900 text-white' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-900 to-zinc-500 text-white' :
      style === 'outline' ? 'border-2 border-zinc-900 text-zinc-900' :
      'bg-zinc-100/50 backdrop-blur-md border border-zinc-200 text-zinc-900'
    );
    
    const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
    const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';
    const mx = align === 'left' ? 'ml-0' : align === 'right' ? 'mr-0' : 'mx-auto';

    const HeadingTag = (hierarchy || 'h1') as any;
    const headingClass = cn(
      "font-black text-zinc-900 tracking-tight leading-tight mb-4"
    );

    const getFontSize = () => {
      const base = hierarchy === 'h1' ? (config.font_size_h1 || 48) : 
                   hierarchy === 'h2' ? (config.font_size_h2 || 32) : 24;
      return `${base * 0.75}px`; // Preview scaling
    };

    return (
      <section className={cn(
        "py-16 md:py-24 px-8 bg-white border-b border-zinc-50 relative overflow-hidden",
        alignmentClass,
        variant === 'full-height' && "min-h-[400px] flex items-center justify-center",
        variant === 'contained' && "max-w-4xl mx-auto rounded-[3rem] border border-zinc-100 my-10"
      )}>
        <div className={`relative z-10 flex flex-col ${containerAlign}`}>
          <div className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-6">Premium Agency</div>
          <HeadingTag 
            className={headingClass}
            style={{ 
              fontFamily: config.font_family_heading, 
              fontWeight: config.font_weight_heading,
              fontSize: getFontSize()
            }}
          >
            {content?.h1 || 'Experience Excellence'}
          </HeadingTag>
          <p 
            className={`text-sm text-zinc-500 font-medium mb-8 max-w-md ${mx}`}
            style={{ fontSize: `${config.font_size_body * 0.8 || 14}px` }}
          >
            {content?.description || 'Tailored digital solutions for modern businesses.'}
          </p>
          <div className="flex flex-wrap gap-4">
             <button className={buttonClass}>{content?.cta_primary || 'Explore'}</button>
             {(ctaCount > 1 && config.show_secondary_cta !== false) && (
               <button className={cn(paddingClass, "text-[9px] font-black uppercase tracking-widest rounded-xl border border-zinc-200 text-zinc-400")}>Secondary</button>
             )}
          </div>
        </div>
        <div className="absolute inset-0 opacity-5">
           <img src="/assets/hero-placeholder.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white to-white -z-0" />
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
  const settings = config.settings?.HERO_CENTERED || { animation: 'fade' };
  const global = config.styles;
  const ctaCount = settings.cta_count || 1;
  const align = global.text_alignment || 'center';
  const hierarchy = settings.hierarchy || 'h1';
  const variant = settings.layout_variant || 'standard';
  
  const variants = {
    none: { initial: {}, animate: {} },
    fade: { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    'slide-up': { initial: { y: 40, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
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
  
  const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';
  const mx = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  const HeadingTag = hierarchy as any;

  return (
    <section className={cn(
      "relative py-24 md:py-40 px-8 overflow-hidden bg-white",
      variant === 'full-height' && "min-h-screen flex items-center",
      variant === 'contained' && "max-w-7xl mx-auto rounded-[3rem] md:rounded-[5rem] border border-zinc-100 my-12 md:my-24 shadow-2xl"
    )}>
      <motion.div 
        {...selected}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={cn("max-w-5xl relative z-10 flex flex-col", mx, alignmentClass, containerAlign)}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 md:mb-12"
        >
          Crafting Digital Excellence
        </motion.div>
        
        <HeadingTag 
          className={cn(
            "font-black text-zinc-900 tracking-tight leading-[1.05] mb-8 md:mb-12"
          )}
          style={{ 
            fontFamily: global.font_family_heading, 
            fontWeight: global.font_weight_heading,
            fontSize: \`clamp(\${Math.min(parseInt(global.font_size_h1 || '48') * 0.6, 40)}px, 8vw, \${global.font_size_h1 || '48'}px)\`
          }}
        >
          {config.content.h1 || 'Experience the Future of Digital Excellence'}
        </HeadingTag>

        <p 
          className={cn("text-lg md:text-2xl text-zinc-500 font-medium leading-relaxed mb-12 md:mb-16 max-w-3xl", mx)}
          style={{ fontSize: \`clamp(16px, 2vw, \${global.font_size_body || '16'}px)\` }}
        >
          {config.content.description || 'Our agency delivers premium solutions tailored to your unique business needs.'}
        </p>

        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <motion.button 
            {...selectedBtnAnim}
            className="btn-primary"
          >
            {config.content.cta_primary || 'Launch Project'}
          </motion.button>
          
          {(ctaCount > 1 && global.show_secondary_cta !== false) && (
            <motion.button 
              {...selectedBtnAnim}
              className="btn-secondary"
            >
              {config.content.cta_secondary || 'Learn More'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Background Image Enhancement */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
         <img 
           src="/assets/hero-placeholder.png" 
           alt="" 
           className="w-full h-full object-cover"
         />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-50/50 via-white to-white -z-20" />
    </section>
  );
}
`
};
