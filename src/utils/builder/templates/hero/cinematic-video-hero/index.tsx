import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Play, MousePointer2 } from 'lucide-react';
import ai from './ai.json';

export const HERO_CINEMATIC_VIDEO = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h1Style = { 
      fontFamily: config?.font_family_heading || 'Inter', 
      fontWeight: config?.font_weight_heading || '900',
    }

    const blurLevel = settings?.blur_intensity ?? 20;
    const overlayOpacity = (settings?.overlay_opacity ?? 40) / 100;
    const enableBlurDiv = settings?.enable_blur_div ?? true;
    const showContainer = enableBlurDiv && blurLevel > 0;
    const heroTextSize = settings?.hero_text_size ?? 'text-6xl md:text-8xl';
    const heroTextMargin = settings?.hero_text_margin ?? 'mb-8';
    const heroTextAlignment = settings?.hero_text_alignment ?? 'text-center';

    const containerAnimationPreset = settings?.container_animation ?? 'fade-up';
    const textAnimationPreset = settings?.text_animation ?? 'slide-up';

    const containerTailwindAnim = 
      containerAnimationPreset === 'fade-up' ? 'animate-in fade-in slide-in-from-bottom-8 duration-1000' :
      containerAnimationPreset === 'scale-up' ? 'animate-in zoom-in-90 duration-1000' :
      containerAnimationPreset === 'blur-in' ? 'animate-in fade-in duration-1000' : 
      containerAnimationPreset === '3d-flip' ? 'animate-in fade-in duration-1000' : 
      containerAnimationPreset === 'elastic-pop' ? 'animate-in zoom-in-75 duration-700' : 
      containerAnimationPreset === 'slide-right' ? 'animate-in fade-in slide-in-from-left-8 duration-1000' : 
      '';

    const textTailwindAnim = 
      textAnimationPreset === 'slide-up' ? 'animate-in fade-in slide-in-from-bottom-4 duration-700' :
      textAnimationPreset === 'fade' ? 'animate-in fade-in duration-700' :
      textAnimationPreset === 'scale' ? 'animate-in zoom-in-95 duration-700' : 
      textAnimationPreset === 'spring-up' ? 'animate-in fade-in slide-in-from-bottom-6 duration-700' : 
      textAnimationPreset === 'blur-reveal' ? 'animate-in fade-in duration-1000' : 
      textAnimationPreset === 'flip-down' ? 'animate-in fade-in duration-700' : 
      '';

    const renderAlign = heroTextAlignment === 'text-left' ? 'items-start text-left' :
                        heroTextAlignment === 'text-right' ? 'items-end text-right' :
                        'items-center text-center';

    const flexJustify = heroTextAlignment === 'text-left' ? 'justify-start' :
                        heroTextAlignment === 'text-right' ? 'justify-end' :
                        'justify-center';

    const isMixkit = content?.video_url?.includes('mixkit.co');
    const safeVideoUrl = isMixkit ? "https://res.cloudinary.com/demo/video/upload/v1689360580/c_fill,h_1080,w_1920/samples/sea-turtle.mp4" : (content?.video_url || "https://res.cloudinary.com/demo/video/upload/v1689360580/c_fill,h_1080,w_1920/samples/sea-turtle.mp4");

    return (
      <section className="relative min-h-[700px] w-full flex items-center justify-center overflow-hidden bg-black group">
        {/* Background Video Mockup */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
          <div 
            className="absolute inset-0 bg-zinc-900/60 z-10" 
            style={{ opacity: overlayOpacity }}
          />
          <video 
            key={safeVideoUrl}
            src={safeVideoUrl}
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
          />
          
          {/* Animated Glows */}
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse decoration-1000" />
        </div>

        {/* Content Box with Glassmorphism */}
        <div className={cn("relative z-20 max-w-5xl px-8 w-full", containerTailwindAnim)}>
          <div 
            className={cn(
               "transition-all duration-700",
               showContainer ? "p-12 md:p-20 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl hover:border-white/20" : "p-0 border-none bg-transparent"
             )}
            style={showContainer ? { 
                backdropFilter: `blur(${blurLevel}px)`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)'
            } : {}}
          >
            <div className={cn("flex flex-col gap-8", renderAlign)}>
          
             

              <h1 
                className={cn("font-black text-white tracking-tighter leading-[0.85] uppercase italic", heroTextSize, heroTextMargin, textTailwindAnim)}
                style={h1Style}
              >
                {content?.h1 || "Redefining the Future."}
              </h1>

              <p className={cn("text-lg md:text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed opacity-80", textTailwindAnim)} style={{ fontFamily: config?.font_family_body || 'Inter' }}>
                {content?.description || "Experience the next generation of digital excellence with our cinematic AI orchestrations."}
              </p>

              <div className={cn("flex flex-wrap items-center gap-6 mt-4", flexJustify, textTailwindAnim)}>
                <button 
                  className={cn(
                    "flex items-center justify-center gap-3 font-black uppercase tracking-[.2em] transition-all",
                    (!config?.button_padding || config?.button_padding === 'standard') ? 'px-10 py-5 text-[10px]' : config?.button_padding === 'compact' ? 'px-8 py-3 text-[9px]' : 'px-14 py-6 text-[12px]',
                    config?.button_radius === 'none' ? 'rounded-none' : config?.button_radius === 'md' ? 'rounded-xl' : 'rounded-full',
                    config?.button_style === 'ghost' ? 'bg-transparent border border-white text-white hover:bg-white hover:text-black' : config?.button_style === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20' : 'text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105'
                  )}
                  style={config?.button_style === 'solid' || !config?.button_style ? { backgroundColor: config?.accent_color || '#ffffff' } : {}}
                >
                  {content?.cta_primary || "Explore Vision"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  className={cn(
                    "flex items-center justify-center gap-3 font-black uppercase tracking-[.2em] transition-all bg-transparent border border-white/20 text-white hover:bg-white/5",
                    (!config?.button_padding || config?.button_padding === 'standard') ? 'px-10 py-5 text-[10px]' : config?.button_padding === 'compact' ? 'px-8 py-3 text-[9px]' : 'px-14 py-6 text-[12px]',
                    config?.button_radius === 'none' ? 'rounded-none' : config?.button_radius === 'md' ? 'rounded-xl' : 'rounded-full'
                  )}
                >
                  {content?.cta_secondary || "Our Story"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mouse Hint */}
        {settings?.show_scroll_indicator !== false && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center p-1.5">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Scroll</span>
          </div>
        )}
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, MousePointer2 } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function CinematicHero() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const blurLevel = settings?.blur_intensity ?? 20;
  const overlayOpacity = (settings?.overlay_opacity ?? 40) / 100;
  const enableBlurDiv = settings?.enable_blur_div ?? true;
  const showContainer = enableBlurDiv && blurLevel > 0;
  const heroTextSize = settings?.hero_text_size ?? 'text-6xl md:text-8xl';
  const heroTextMargin = settings?.hero_text_margin ?? 'mb-8';
  const heroTextAlignment = settings?.hero_text_alignment ?? 'text-center';

  const containerAnimationPreset = settings?.container_animation ?? 'fade-up';
  const textAnimationPreset = settings?.text_animation ?? 'slide-up';

  const containerVariants = {
    'fade-up': { initial: { opacity: 0, y: 40, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
    'scale-up': { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
    'blur-in': { initial: { opacity: 0, filter: 'blur(20px)' }, animate: { opacity: 1, filter: 'blur(0px)' } },
    '3d-flip': { initial: { opacity: 0, rotateX: 60, y: 50 }, animate: { opacity: 1, rotateX: 0, y: 0, transition: { type: 'spring', damping: 20, stiffness: 80 } } },
    'elastic-pop': { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.6, duration: 1 } } },
    'slide-right': { initial: { opacity: 0, x: -80 }, animate: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } } },
    'none': { initial: { opacity: 1 }, animate: { opacity: 1 } },
  };
  const selectedContainerVariant = containerVariants[containerAnimationPreset as keyof typeof containerVariants] || containerVariants['fade-up'];

  const textVariants = {
    'slide-up': { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    'fade': { initial: { opacity: 0 }, animate: { opacity: 1 } },
    'scale': { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } },
    'spring-up': { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0, transition: { type: 'spring', mass: 0.5, damping: 10 } } },
    'blur-reveal': { initial: { opacity: 0, filter: 'blur(12px)', y: 15 }, animate: { opacity: 1, filter: 'blur(0px)', y: 0 } },
    'flip-down': { initial: { opacity: 0, rotateX: -90, transformOrigin: 'top' }, animate: { opacity: 1, rotateX: 0, transformOrigin: 'top' } },
    'none': { initial: { opacity: 1 }, animate: { opacity: 1 } },
  };
  const selectedTextVariant = textVariants[textAnimationPreset as keyof typeof textVariants] || textVariants['slide-up'];

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
  };

  const renderAlign = heroTextAlignment === 'text-left' ? 'items-start text-left' :
                      heroTextAlignment === 'text-right' ? 'items-end text-right' :
                      'items-center text-center';

  const flexJustify = heroTextAlignment === 'text-left' ? 'justify-start' :
                      heroTextAlignment === 'text-right' ? 'justify-end' :
                      'justify-center';

  const isMixkit = content?.video_url?.includes('mixkit.co');
  const safeVideoUrl = isMixkit ? "https://res.cloudinary.com/demo/video/upload/v1689360580/c_fill,h_1080,w_1920/samples/sea-turtle.mp4" : (content?.video_url || "https://res.cloudinary.com/demo/video/upload/v1689360580/c_fill,h_1080,w_1920/samples/sea-turtle.mp4");

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
        <div 
          className="absolute inset-0 bg-black/60 z-10" 
          style={{ opacity: overlayOpacity }}
        />
        <video 
          key={safeVideoUrl}
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src={safeVideoUrl} type="video/mp4" />
        </video>
        
        {/* Animated Glows */}
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.15, 0.1],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full" 
        />
      </div>

      {/* Content Box with Glassmorphism */}
      <motion.div 
        initial={selectedContainerVariant.initial}
        whileInView={selectedContainerVariant.animate}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 max-w-5xl px-6 w-full"
      >
        <div 
          className={cn(
            showContainer ? "p-10 md:p-24 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl" : ""
          )}
          style={showContainer ? { 
              backdropFilter: \`blur(\${blurLevel}px)\`,
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
          } : {}}
        >
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            className={cn("flex flex-col gap-10", renderAlign)}
          >

            <motion.h1 
              variants={selectedTextVariant}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("font-black text-white tracking-tighter leading-[0.8] uppercase italic", heroTextSize, heroTextMargin)}
              style={{ fontFamily: global.font_family_heading }}
            >
              {content.h1}
            </motion.h1>

            <motion.p 
              variants={selectedTextVariant}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl leading-relaxed" 
              style={{ fontFamily: global.font_family_body }}
            >
              {content.description}
            </motion.p>

            <motion.div 
              variants={selectedTextVariant}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("flex flex-wrap items-center gap-6 mt-6", flexJustify)}
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,255,255,0.1)]",
                  (!global.button_padding || global.button_padding === 'standard') ? 'px-10 py-5 text-[10px]' : global.button_padding === 'compact' ? 'px-8 py-3 text-[9px]' : 'px-14 py-6 text-[12px]',
                  global.button_radius === 'none' ? 'rounded-none' : global.button_radius === 'md' ? 'rounded-xl' : 'rounded-full',
                  global.button_style === 'ghost' ? 'bg-transparent border border-white text-white hover:bg-white hover:text-black' : global.button_style === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20' : 'text-black'
                )}
                style={global.button_style === 'solid' || !global.button_style ? { backgroundColor: global.accent_color || '#ffffff' } : {}}
              >
                {content.cta_primary}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button 
                className={cn(
                  "flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] bg-transparent border border-white/20 text-white hover:bg-white/5 transition-all",
                  (!global.button_padding || global.button_padding === 'standard') ? 'px-10 py-5 text-[10px]' : global.button_padding === 'compact' ? 'px-8 py-3 text-[9px]' : 'px-14 py-6 text-[12px]',
                  global.button_radius === 'none' ? 'rounded-none' : global.button_radius === 'md' ? 'rounded-xl' : 'rounded-full'
                )}
              >
                {content.cta_secondary}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Mouse Hint */}
      {settings?.show_scroll_indicator !== false && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        >
          <div className="w-7 h-12 rounded-full border-2 border-white/30 flex justify-center p-2">
             <motion.div 
               animate={{ y: [0, 12, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-1.5 h-1.5 bg-white rounded-full" 
             />
          </div>
        </motion.div>
      )}
    </section>
  );
}
  `
};
