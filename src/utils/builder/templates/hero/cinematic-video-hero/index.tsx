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
      textAlign: (config?.text_alignment as any) || 'center'
    }

    const blurLevel = settings?.blur_intensity ?? 20;
    const overlayOpacity = (settings?.overlay_opacity ?? 40) / 100;

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
        <div className="relative z-20 max-w-5xl px-8 w-full">
          <div 
            className="p-12 md:p-20 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 hover:border-white/20"
            style={{ 
                backdropFilter: `blur(${blurLevel}px)`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="flex flex-col items-center text-center gap-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[.2em] font-bold text-blue-400 animate-in fade-in slide-in-from-top-4 duration-1000">
                <Play className="w-3 h-3 fill-current" />
                Next Generation Studio
              </div>

              <h1 
                className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic"
                style={h1Style}
              >
                {content?.h1 || "Redefining the Future."}
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed opacity-80" style={{ fontFamily: config?.font_family_body || 'Inter' }}>
                {content?.description || "Experience the next generation of digital excellence with our cinematic AI orchestrations."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                <button 
                  className="h-16 px-12 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  style={{ backgroundColor: config?.accent_color || '#ffffff' }}
                >
                  {content?.cta_primary || "Explore Vision"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="h-16 px-12 bg-transparent border border-white/10 text-white rounded-full text-[11px] font-black uppercase tracking-[.2em] hover:bg-white/5 transition-all">
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
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 max-w-5xl px-6 w-full"
      >
        <div 
          className="p-10 md:p-24 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
          style={{ 
              backdropFilter: \`blur(\${blurLevel}px)\`,
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div className="flex flex-col items-center text-center gap-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[.3em] font-black text-blue-400"
            >
              <Play className="w-3 h-3 fill-current" />
              Intelligence Driven Design
            </motion.div>

            <h1 
              className="text-6xl md:text-[8.5rem] font-black text-white tracking-tighter leading-[0.8] uppercase italic"
              style={{ fontFamily: global.font_family_heading }}
            >
              {content.h1}
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl leading-relaxed" style={{ fontFamily: global.font_family_body }}>
              {content.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-20 px-16 bg-white text-black rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                style={{ backgroundColor: global.accent_color }}
              >
                {content.cta_primary}
              </motion.button>
              <button className="h-20 px-16 bg-transparent border border-white/20 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
                {content.cta_secondary}
              </button>
            </div>
          </div>
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
