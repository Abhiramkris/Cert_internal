import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, MoveRight } from 'lucide-react';
import ai from './ai.json';

export const HERO_FULL_IMAGE_STATS = {
   ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const stats = content?.stats || [
      { label: 'Project Success', value: '98%' },
      { label: 'Years Experience', value: '15+' },
      { label: 'Global Clients', value: '250+' }
    ];

    const h1Style = { 
      fontFamily: config?.font_family_heading || 'Inter', 
      fontWeight: config?.font_weight_heading || '900',
      textAlign: (config?.text_alignment as any) || 'left'
    }

    const overlayOpacity = (settings?.overlay_opacity ?? 50) / 100
    const spacingTop = settings?.spacing_top ?? 80

    return (
      <section 
        className={cn(
          "relative min-h-[600px] flex flex-col justify-end overflow-hidden bg-zinc-950 group transition-all duration-700",
          config?.text_alignment === 'center' ? 'items-center' : 'items-start'
        )}
        style={{ paddingTop: `${spacingTop}px` }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={content?.image_url || "https://images.unsplash.com/photo-1519067793744-1618217bd501?auto=format&fit=crop&q=80"} 
            alt="Hero Background" 
            className="w-full h-full object-cover grayscale brightness-50 transition-all duration-700 group-hover:scale-105"
          />
          <div 
             className="absolute inset-0 bg-zinc-950 transition-opacity duration-500" 
             style={{ opacity: overlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        {/* Content Layer */}
        <div className={cn(
          "relative z-10 px-12 mb-20 max-w-5xl",
          config?.text_alignment === 'center' ? 'text-center' : 'text-left'
        )}>
          <h1 
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] mb-6 uppercase italic"
            style={h1Style}
          >
            {content?.h1 || "Precision Logistics, Start to Finish."}
          </h1>
          <p className={cn(
            "text-base text-zinc-300 font-medium max-w-xl mb-12 leading-relaxed opacity-80",
            config?.text_alignment === 'center' ? 'mx-auto' : ''
          )} style={{ fontFamily: config?.font_family_body || 'Inter' }}>
            {content?.description || "Delivering excellence through heavy haulage and strategic freight solutions since 2008."}
          </p>

          <div className={cn(
            "flex items-center gap-8",
            config?.text_alignment === 'center' ? 'justify-center' : 'justify-start'
          )}>
            <button 
              className="h-14 px-10 bg-white text-zinc-900 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-2xl shadow-black/20"
            >
              Learn More
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </button>
            <button className="text-[11px] font-black uppercase tracking-[0.3em] text-white transition-colors flex items-center gap-4 hover:opacity-80">
              Our Strategy
              <MoveRight className="w-5 h-5" style={{ color: config?.accent_color || '#3b82f6' }} />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {settings?.show_stats !== false && (
          <div className="relative z-10 w-full bg-white/5 backdrop-blur-3xl border-t border-white/10 px-12 py-12">
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl",
              config?.text_alignment === 'center' ? 'mx-auto' : ''
            )}>
              {stats.slice(0, 3).map((stat: any, i: number) => (
                <div key={i} className="flex flex-col gap-2 group">
                  <div className="flex items-center gap-3">
                     <div className="w-1 h-8 bg-zinc-800 transition-all group-hover:h-10" style={{ backgroundColor: config?.accent_color || '#3b82f6' }} />
                     <span className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-none">{stat.value}</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] pl-4">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MoveRight } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function HeroStats() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const stats = content.stats || [
    { label: 'Project Success', value: '98%' },
    { label: 'Years Experience', value: '15+' },
    { label: 'Global Clients', value: '250+' }
  ];

  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    'scale-up': { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
    zoom: { initial: { scale: 1.1, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
    'slide-up': { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } }
  };

  const anim = variants[settings?.animation || 'fade'];

  return (
    <section 
      className={cn(
        "relative min-h-[90vh] flex flex-col justify-end overflow-hidden bg-zinc-950",
        global.text_alignment === 'center' ? 'items-center' : 'items-start'
      )}
      style={{ paddingTop: settings?.spacing_top ? settings.spacing_top + 'px' : '80px' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          src={content.image_url || "https://images.unsplash.com/photo-1519067793744-1618217bd501?auto=format&fit=crop&q=80"} 
          className="w-full h-full object-cover grayscale brightness-50"
        />
        <div 
          className="absolute inset-0 bg-zinc-950" 
          style={{ opacity: (settings?.overlay_opacity ?? 50) / 100 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      {/* Main Content */}
      <motion.div 
        initial={anim.initial}
        whileInView={anim.animate}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative z-10 px-12 md:px-24 mb-20 max-w-7xl",
          global.text_alignment === 'center' ? 'text-center' : 'text-left'
        )}
      >
        <h1 
          className="text-6xl md:text-9xl font-black text-white tracking-[1.2px] leading-[0.85] mb-8 uppercase italic"
          style={{ fontFamily: global.font_family_heading }}
        >
          {content.h1 || "Precision Logistics."}
        </h1>
        <p className={cn("text-lg md:text-xl text-zinc-300 font-medium max-w-2xl mb-16 leading-relaxed", global.text_alignment === 'center' ? 'mx-auto' : "")}>
          {content.description}
        </p>
        <div className={cn("flex flex-wrap items-center gap-10", global.text_alignment === 'center' ? 'justify-center' : "")}>
           <button className="h-20 px-14 bg-white text-zinc-950 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl">
              {content.cta_primary}
           </button>
        </div>
      </motion.div>

      {settings?.show_stats !== false && (
        <div className="relative z-10 bg-white/5 backdrop-blur-3xl border-t border-white/10 px-12 md:px-24 py-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
            {stats.slice(0, 3).map((stat: any, i: number) => (
              <div key={i} className="flex flex-col gap-2">
                 <span className="text-4xl md:text-7xl font-black text-white italic">{stat.value}</span>
                 <span className="text-[11px] md:text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
  `
};
