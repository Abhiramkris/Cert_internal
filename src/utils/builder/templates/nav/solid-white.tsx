import React from 'react';

export const NAV_SOLID_WHITE = {
  name: 'Solid White Navbar',
  type: 'layout',
  preview: (config: any) => {
    const style = config.button_style || 'solid';
    const buttonClass = `px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
      style === 'solid' ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-100' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-900 to-zinc-500 text-white shadow-xl' :
      style === 'outline' ? 'border-2 border-zinc-900 text-zinc-900 font-bold' :
      'bg-zinc-100/50 backdrop-blur-md border border-zinc-200 text-zinc-900 shadow-xl'
    }`;
    
    return (
      <nav className="flex items-center justify-between px-10 py-6 bg-white border-b border-zinc-100">
        <div 
          className="text-xl font-black tracking-tighter text-zinc-900 uppercase"
          style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
        >
          Logo
        </div>
        <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest text-zinc-400">
           <span>Work</span>
           <span>Approach</span>
           <span>Contact</span>
        </div>
        <button className={buttonClass}>Inquiry</button>
      </nav>
    );
  },
  code: (config: any) => `
'use client'
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import config from '../data/config.json';

export default function Navbar() {
  const settings = config.settings?.NAV_SOLID_WHITE || { animation: 'fade' };
  const global = config.styles;

  const variants = {
    none: { initial: {}, animate: {} },
    fade: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    'slide-up': { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;

  return (
    <motion.nav 
      {...selected}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between px-10 py-8 bg-white shadow-sm border-b border-zinc-50"
    >
      <div 
        className="text-2xl font-black tracking-tighter text-zinc-900 uppercase"
        style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
      >
        Logo
      </div>
      <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Index</Link>
        <Link href="/work" className="hover:text-zinc-900 transition-colors">Work</Link>
        <Link href="/approach" className="hover:text-zinc-900 transition-colors">Approach</Link>
        <Link href="/contact" className="hover:text-zinc-900 transition-colors">Inquiry</Link>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary !h-10 !px-6 !text-[10px] !rounded-none"
      >
        {config.content.cta_primary || 'Contact Us'}
      </motion.button>
    </motion.nav>
  );
}
`
};
