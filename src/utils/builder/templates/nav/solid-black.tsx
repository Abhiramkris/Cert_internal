import React from 'react';

export const NAV_SOLID_BLACK = {
  name: 'Solid Black Navbar',
  type: 'layout',
  preview: (config: any) => {
    const style = config.button_style || 'solid';
    const buttonClass = `px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
      style === 'solid' ? 'bg-white text-zinc-950 shadow-xl' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-100 to-zinc-400 text-zinc-950 shadow-xl' :
      style === 'outline' ? 'border-2 border-white text-white hover:bg-white hover:text-zinc-950' :
      'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl'
    }`;
    
    return (
      <nav className="flex items-center justify-between px-8 py-5 bg-zinc-950 border-b border-zinc-800 text-white">
        <div 
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
        >
          Logo
        </div>
        <div className="flex gap-6 text-[10px] font-medium text-zinc-400">
           <span>Home</span>
           <span>Services</span>
           <span>Contact</span>
        </div>
        <button className={buttonClass}>Start</button>
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
  const settings = config.settings?.NAV_SOLID_BLACK || { animation: 'fade' };
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
      className="flex items-center justify-between px-8 py-6 bg-zinc-950 text-white border-b border-zinc-800"
    >
      <div 
        className="text-xl font-bold tracking-tight"
        style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
      >
        Logo
      </div>
      <div className="flex gap-8 text-sm font-medium text-zinc-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/services" className="hover:text-white transition-colors">Services</Link>
        <Link href="/about" className="hover:text-white transition-colors">About</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary !h-10 !px-6 !text-[10px] !rounded-lg"
      >
        {config.content.cta_primary || 'Get Started'}
      </motion.button>
    </motion.nav>
  );
}
  `
};
