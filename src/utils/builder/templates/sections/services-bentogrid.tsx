import React from 'react';
import { cn } from '@/lib/utils';
import { Layers, Zap, Shield, AppWindow } from 'lucide-react';

export const SERVICES_BENTO = {
  name: 'Bento Services Grid',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const align = config.text_alignment || 'center';
    const hierarchy = settings?.hierarchy || 'h2';
    
    const alignmentClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';

    const HeadingTag = (hierarchy || 'h2') as any;

    const cardStyle = settings?.card_style || 'standard';
    const bgStyle = settings?.bg_gradient ? { backgroundImage: settings.bg_gradient } : settings?.bg_color ? { backgroundColor: settings.bg_color } : {};

    const cardClass = cardStyle === 'minimal' ? 'bg-transparent border-none shadow-none p-4' :
                     cardStyle === 'glass' ? 'bg-white/40 backdrop-blur-md border border-white shadow-xl rounded-3xl p-6' :
                     'bg-white rounded-3xl p-6 border border-zinc-200';

    return (
      <section 
        className="py-16 px-8 bg-zinc-50 border-b border-zinc-100 relative overflow-hidden"
        style={bgStyle}
      >
        <div className={cn("max-w-4xl mx-auto flex flex-col", alignmentClass)}>
          <HeadingTag 
            className="font-black text-zinc-900 tracking-tight leading-none mb-10"
            style={{ 
              fontFamily: config.font_family_heading, 
              fontWeight: config.font_weight_heading,
              fontSize: `${hierarchy === 'h1' ? parseInt(config.font_size_h1 || '48') : hierarchy === 'h2' ? parseInt(config.font_size_h2 || '32') : parseInt(config.font_size_body || '16')}px`
            }}
          >
            Core Capabilities
          </HeadingTag>
          
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[240px] w-full">
            <div className="col-span-2 row-span-2 bg-zinc-900 rounded-3xl p-6 flex flex-col justify-end text-white overflow-hidden relative">
               <img src="/assets/hero-placeholder.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-200" />
               <Zap className="w-5 h-5 mb-3" />
               <span className="text-[10px] font-black uppercase">Technical Architecture</span>
            </div>
            <div className={cn(cardClass, "col-span-2 flex flex-col justify-center")}>
               <Shield className="w-4 h-4 text-zinc-400 mb-2" />
               <span className="text-[9px] font-bold text-zinc-900 uppercase">Security Engineering</span>
            </div>
            <div className="bg-zinc-100 rounded-3xl p-4 flex items-center justify-center">
               <AppWindow className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="bg-zinc-200 rounded-3xl p-4 flex items-center justify-center">
               <Layers className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
          {settings?.cta_primary && (
            <div className={cn("mt-12 flex", alignmentClass.includes('items-start') ? 'justify-start' : alignmentClass.includes('items-end') ? 'justify-end' : 'justify-center')}>
              <button className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-zinc-200">
                {settings?.cta_primary}
              </button>
            </div>
          )}
        </div>
      </section>
    );
  },
  code: (config: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Shield, AppWindow, Cpu, Globe } from 'lucide-react';
import config from '../data/config.json';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const services = [
  { id: 1, title: 'Cloud Infrastructure', icon: Globe, size: 'large', color: 'bg-zinc-900 text-white' },
  { id: 2, title: 'Strategic Consulting', icon: Cpu, size: 'medium', color: 'bg-zinc-50 border border-zinc-100' },
  { id: 3, title: 'Product Design', icon: Layers, size: 'small', color: 'bg-zinc-100' },
  { id: 4, title: 'Security Audits', icon: Shield, size: 'small', color: 'bg-zinc-200' },
];

export default function Services() {
  const global = config.styles;
  const settings = config.settings?.SERVICES_BENTO || { animation: 'fade' };
  const align = global.text_alignment || 'center';
  
  const alignmentClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';

  const cardStyle = settings.card_style || 'standard';
  const cardClass = cardStyle === 'minimal' ? 'bg-transparent border-none shadow-none p-0' :
                   cardStyle === 'glass' ? 'bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[3rem] md:rounded-[4rem] p-12 md:p-16' :
                   'bg-white rounded-[3rem] md:rounded-[4rem] p-12 md:p-16 border border-zinc-100 shadow-xl shadow-zinc-200/20';

  const bgStyle = settings.bg_gradient ? { backgroundImage: settings.bg_gradient } : settings.bg_color ? { backgroundColor: settings.bg_color } : {};

  return (
    <section 
      className="py-32 md:py-48 px-8 bg-zinc-50 border-b border-zinc-100 overflow-hidden"
      style={bgStyle}
    >
      <div className={cn("max-w-7xl mx-auto flex flex-col", alignmentClass)}>
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8"
        >
          Engineering the Future
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="font-black text-zinc-950 tracking-tighter leading-none mb-20 md:mb-32 uppercase italic"
          style={{ 
            fontFamily: global.font_family_heading, 
            fontWeight: global.font_weight_heading,
            fontSize: \`clamp(40px, 8vw, \${global.font_size_h2}px)\`
          }}
        >
          Premier Capabilities
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 md:gap-8 h-auto md:h-[700px] w-full">
          {/* Main Large Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2 md:row-span-2 bg-zinc-950 rounded-[3rem] md:rounded-[4rem] p-12 md:p-20 flex flex-col justify-end text-white overflow-hidden relative group shadow-2xl shadow-zinc-950/20"
          >
             <img src="/assets/hero-placeholder.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale brightness-200 group-hover:scale-110 group-hover:opacity-20 transition-all duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
             <motion.div 
               initial={{ rotate: 0 }}
               whileInView={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
               className="w-20 h-20 border border-white/10 rounded-full mb-10 flex items-center justify-center relative z-10"
             >
                <Globe className="w-8 h-8 text-white" />
             </motion.div>
             <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 relative z-10" style={{ fontFamily: global.font_family_heading }}>
               Enterprise Architecture
             </h3>
             <p className="text-sm md:text-lg text-zinc-400 font-medium max-w-md relative z-10">
               Highly scalable, battle-tested infrastructure for the world's most demanding digital workloads.
             </p>
          </motion.div>

          {/* Medium Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={cn("md:col-span-2 flex flex-col justify-center gap-8", cardClass)}
          >
             <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-zinc-900" />
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black text-zinc-950 uppercase italic tracking-tighter" style={{ fontFamily: global.font_family_heading }}>
                   Security Operations
                </h3>
                <p className="text-sm md:text-base text-zinc-500 font-medium max-w-md leading-relaxed">
                   Military-grade protection and continuous audit monitoring for your critical assets.
                </p>
             </div>
          </motion.div>

          {/* Small Cards */}
          <motion.div 
            whileHover={{ scale: 1.02, rotate: -2 }}
            className="bg-zinc-100 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center gap-6"
          >
             <AppWindow className="w-10 h-10 text-zinc-900" />
             <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900">App Design</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02, rotate: 2 }}
            className="bg-zinc-900 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center gap-6 text-white"
          >
             <Layers className="w-10 h-10 text-zinc-100" />
             <span className="text-[11px] font-black uppercase tracking-widest text-zinc-100">Interface Rigor</span>
          </motion.div>
        </div>
        {settings?.cta_primary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn("mt-20 flex", alignmentClass.includes('items-start') ? 'justify-start' : alignmentClass.includes('items-end') ? 'justify-end' : 'justify-center')}
          >
            <button className="px-12 py-5 bg-zinc-950 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-zinc-200 hover:scale-105 active:scale-95 transition-all">
              {settings?.cta_primary}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
  `
};
