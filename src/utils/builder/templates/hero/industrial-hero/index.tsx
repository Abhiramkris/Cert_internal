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

    const containerAnim = settings?.container_animation === 'fade-up' ? 'animate-in fade-in slide-in-from-bottom-8 duration-1000' :
                          settings?.container_animation === 'scale-up' ? 'animate-in zoom-in-95 duration-1000' :
                          settings?.container_animation === 'blur-in' ? 'animate-in fade-in blur-sm duration-1000' : 
                          settings?.container_animation === 'none' ? '' : 'animate-in fade-in duration-1000';

    const textAnim = settings?.text_animation === 'fade' ? 'animate-in fade-in duration-700' :
                     settings?.text_animation === 'scale' ? 'animate-in zoom-in-95 duration-700' :
                     settings?.text_animation === 'none' ? '' : 'animate-in slide-in-from-bottom-4 fade-in duration-700';

    const textSize = settings?.hero_text_size || "text-6xl md:text-8xl";
    const textAlignment = settings?.hero_text_alignment || "text-left";
    const textMargin = settings?.hero_text_margin || "mb-8";
    const flexAlignment = textAlignment === 'text-center' ? 'items-center' : textAlignment === 'text-right' ? 'items-end' : 'items-start';

    return (
      <section 
        className={cn(
          "relative min-h-[600px] flex flex-col justify-end overflow-hidden bg-zinc-950 group transition-all duration-700",
          flexAlignment
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
          textAlignment, containerAnim
        )}>
          <h1 
            className={cn(`font-black text-white tracking-tighter leading-[0.85] uppercase italic ${textSize} ${textMargin}`, textAnim)}
            style={h1Style}
          >
            {content?.h1 || "Precision Logistics, Start to Finish."}
          </h1>
          <p className={cn(
            "text-base text-zinc-300 font-medium max-w-xl mb-12 leading-relaxed opacity-80",
            textAlignment === 'text-center' ? 'mx-auto' : '',
            textAnim
          )} style={{ fontFamily: config?.font_family_body || 'Inter' }}>
            {content?.description || "Delivering excellence through heavy haulage and strategic freight solutions since 2008."}
          </p>

          <div className={cn(
            "flex items-center gap-8",
            textAlignment === 'text-center' ? 'justify-center' : textAlignment === 'text-right' ? 'justify-end' : 'justify-start',
            textAnim
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

  const containerAnimPreset = settings?.container_animation || 'fade-up';
  const textAnimPreset = settings?.text_animation || 'slide-up';
  const textSize = settings?.hero_text_size || "text-6xl md:text-8xl";
  const textAlignment = settings?.hero_text_alignment || "text-left";
  const textMargin = settings?.hero_text_margin || "mb-8";
  const flexAlignment = textAlignment === 'text-center' ? 'items-center' : textAlignment === 'text-right' ? 'items-end' : 'items-start';

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: containerAnimPreset === 'fade-up' ? 40 : 0, 
      scale: containerAnimPreset === 'scale-up' || containerAnimPreset === 'elastic-pop' ? 0.9 : 1,
      filter: containerAnimPreset === 'blur-in' ? "blur(10px)" : "blur(0px)",
      x: containerAnimPreset === 'slide-right' ? -50 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      filter: "blur(0px)",
      x: 0,
      transition: { 
        duration: 1, 
        staggerChildren: 0.1,
        type: containerAnimPreset === 'elastic-pop' ? "spring" : "tween",
        bounce: 0.5
      } 
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: textAnimPreset === 'slide-up' ? 20 : textAnimPreset === 'spring-up' ? 40 : 0,
      scale: textAnimPreset === 'scale' ? 0.95 : 1,
      filter: textAnimPreset === 'blur-reveal' ? "blur(0px)" : "blur(0px)",
      rotateX: textAnimPreset === 'flip-down' ? 90 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      rotateX: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        type: textAnimPreset === 'spring-up' ? "spring" : "tween",
        bounce: 0.4 
      } 
    }
  };

  return (
    <section 
      className={cn(
        "relative min-h-[90vh] flex flex-col justify-end overflow-hidden bg-zinc-950",
        flexAlignment
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
        variants={containerAnimPreset === 'none' ? {} : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={cn(
          "relative z-10 px-12 md:px-24 mb-20 max-w-7xl",
          textAlignment
        )}
      >
        <motion.h1 
          variants={textAnimPreset === 'none' ? {} : itemVariants}
          className={\`\${textSize} \${textMargin} font-black text-white tracking-[1.2px] leading-[0.85] uppercase italic\`}
          style={{ fontFamily: global.font_family_heading }}
        >
          {content.h1 || "Precision Logistics."}
        </motion.h1>
        <motion.p 
          variants={textAnimPreset === 'none' ? {} : itemVariants}
          className={cn("text-lg md:text-xl text-zinc-300 font-medium max-w-2xl mb-16 leading-relaxed", textAlignment === 'text-center' ? 'mx-auto' : "")}
        >
          {content.description}
        </motion.p>
        <motion.div variants={textAnimPreset === 'none' ? {} : itemVariants} className={cn("flex flex-wrap items-center gap-10", textAlignment === 'text-center' ? 'justify-center' : textAlignment === 'text-right' ? 'justify-end' : "")}>
           <button className="h-20 px-14 bg-white text-zinc-950 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 transition-all">
              {content.cta_primary}
           </button>
        </motion.div>
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
