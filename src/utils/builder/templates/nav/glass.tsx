import React from 'react';

export const NAV_GLASS = {
  name: 'Glass Navbar',
  type: 'layout',
  preview: (config: any) => {
    const style = config.button_style || 'solid';
    const buttonClass = `px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-full transition-all ${
      style === 'solid' ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-100' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-900 to-zinc-500 text-white shadow-xl' :
      style === 'outline' ? 'border-2 border-zinc-900 text-zinc-900 font-bold' :
      'bg-zinc-100/50 backdrop-blur-md border border-zinc-200 text-zinc-900 shadow-xl'
    }`;
    
    return (
      <nav className="flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
        <div 
          className="text-xl font-bold tracking-tight text-zinc-900"
          style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
        >
          Logo
        </div>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
           <span>Home</span>
           <span>Work</span>
           <span>About</span>
        </div>
        <button className={buttonClass}>Explore</button>
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
  const settings = config.settings?.NAV_GLASS || { animation: 'fade' };
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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-white/70 backdrop-blur-md border-b border-white/20"
    >
      <div 
        className="text-xl font-bold tracking-tight text-zinc-900"
        style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
      >
        Logo
      </div>
      <div className="flex gap-8 text-sm font-medium text-zinc-600">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
        <Link href="/services" className="hover:text-zinc-900 transition-colors">Services</Link>
        <Link href="/about" className="hover:text-zinc-900 transition-colors">About</Link>
        <Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-primary !h-10 !px-6 !text-[10px]"
      >
        {config.content.cta_primary || 'Get Started'}
      </motion.button>
    </motion.nav>
  );
}
  `
};
