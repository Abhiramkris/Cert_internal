import React from 'react';

export const FOOTER_MINIMAL = {
  name: 'Minimal Clean Footer',
  type: 'layout',
  preview: (config: any, content: any, settings: any) => {
    const bgStyle = settings?.bg_gradient ? { backgroundImage: settings.bg_gradient } : settings?.bg_color ? { backgroundColor: settings.bg_color } : {};
    return (
      <footer 
        className="py-8 px-8 bg-white border-t border-zinc-100 flex justify-between items-center whitespace-nowrap overflow-hidden"
        style={bgStyle}
      >
        <div 
          className="text-xs font-bold text-zinc-900" 
          style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
        >
          {config.brand_name || 'Agency Name'}
        </div>
        <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">© 2026. ALL RIGHTS RESERVED.</div>
      </footer>
    );
  },
  code: (config: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import config from '../data/config.json';

export default function Footer() {
  const settings = config.settings?.FOOTER_MINIMAL || { animation: 'fade' };
  
  const variants = {
    none: { initial: {}, whileInView: {} },
    fade: { initial: { opacity: 0 }, whileInView: { opacity: 1 } },
    'slide-up': { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;

  const bgStyle = settings.bg_gradient ? { backgroundImage: settings.bg_gradient } : settings.bg_color ? { backgroundColor: settings.bg_color } : {};
  const global = config.styles || {};

  return (
    <footer 
      className="py-12 px-8 bg-white border-t border-zinc-100 font-sans"
      style={bgStyle}
    >
      <motion.div 
        {...selected}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8"
      >
        <div 
          className="text-lg font-bold text-zinc-900 tracking-tight"
          style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
        >
          {config.content.brand_name || 'Agency Name'}
        </div>
        <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Cookies</a>
        </div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          © {new Date().getFullYear()} {config.content.brand_name || 'Agency Name'}. All rights reserved.
        </div>
      </motion.div>
    </footer>
  );
}
`
};
