import React from 'react';
import { cn } from '@/lib/utils';
import { Search, Menu, Globe, ArrowRight } from 'lucide-react';
import ai from './ai.json';

export const NAV_INDUSTRIAL = {
  ...ai,
  type: 'layout',
  preview: (config: any, content: any, settings: any, pages: string[] = []) => {
    const getRadius = (r: string) => {
      switch(r) {
        case 'none': return '0px';
        case 'sm': return '4px';
        case 'md': return '12px';
        case 'lg': return '24px';
        case 'xl': return '32px';
        case 'full': return '9999px';
        default: return '0px';
      }
    }

    const brandStyle = { 
      fontFamily: config?.font_family_heading || 'Inter',
      fontWeight: config?.font_weight_heading || '900'
    }

    const btnStyle = {
      backgroundColor: config?.primary_color || '#fff',
      color: (config?.primary_color === '#ffffff' || !config?.primary_color) ? '#000' : '#fff',
      borderRadius: getRadius(config?.button_radius || 'none')
    }

    const navLinks = pages.length > 0 ? pages : ['Home', 'Expertise', 'Projects'];

    return (
      <nav className="absolute top-0 left-0 right-0 h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 flex items-center justify-between z-[100] text-white">
        <div className="flex items-center gap-6 md:gap-12">
           <div className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2" style={brandStyle}>
              <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg" style={{ backgroundColor: config?.primary_color || '#fff' }}>
                 <Globe className="w-5 h-5" style={{ color: (config?.primary_color === '#ffffff' || !config?.primary_color) ? '#000' : '#fff' }} />
              </div>
              <span className="hidden sm:block">{content?.brand_name || 'Agency'}</span>
           </div>
           
           <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {navLinks.map((page, i) => (
                <span key={page} className={cn("hover:text-white cursor-pointer transition-colors", i === 0 && "text-white")}>
                  {page}
                </span>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
           <div className="hidden xl:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Status: <span className="text-emerald-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Operational</span>
           </div>
           <button 
             className="h-10 px-4 md:px-6 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-white/5"
             style={btnStyle}
           >
              <span className="hidden sm:inline">Join Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
           </button>
           <div className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
              <Menu className="w-5 h-5 text-white" />
           </div>
        </div>
      </nav>
    );
  },
  code: (config: any) => `
'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, Globe, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import config from '../data/config.json';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const getLink = (name: string) => {
  const n = name.toLowerCase();
  if (n === 'home') return '/';
  if (n === 'privacy') return '/privacy';
  if (n === 'terms') return '/terms';
  return \`/\${name.toLowerCase().replace(/\\s+/g, '-')}\`;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const global = config.styles;
  const content = config.content;
  const pages = config.pages || ['Home', 'Expertise', 'Projects', 'Privacy'];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12",
      scrolled ? "py-4" : "py-8"
    )}>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "max-w-7xl mx-auto h-20 md:h-24 bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-full px-8 md:px-12 flex items-center justify-between text-white shadow-2xl transition-all duration-500",
          scrolled ? "bg-zinc-950/90 border-white/10" : ""
        )}
      >
        <div className="flex items-center gap-12 lg:gap-20">
           <Link href="/">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 cursor-pointer"
             >
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-2xl shadow-xl shadow-white/5">
                   <Globe className="w-6 h-6 text-zinc-950" />
                </div>
                <span className="hidden sm:block">{content.brand_name || 'Agency'}</span>
             </motion.div>
           </Link>

           <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
              {pages.map((item) => (
                <Link key={item} href={getLink(item)}>
                  <motion.span 
                    initial={{ color: '#71717a' }}
                    whileHover={{ y: -2, color: '#fff' }}
                    className="cursor-pointer transition-colors relative group"
                  >
                    {item}
                    <div className="absolute -bottom-2 left-0 w-0 h-[2px] bg-emerald-500 group-hover:w-full transition-all duration-500" />
                  </motion.span>
                </Link>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-6 md:gap-10">
           <div className="hidden xl:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              System Status: <span className="text-zinc-400">Nominal</span>
           </div>
           
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="h-14 px-10 bg-white text-zinc-950 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-white/5 transition-all"
           >
              {content.cta_primary || "Join Us"}
              <ArrowRight className="w-5 h-5" />
           </motion.button>

           <button 
             onClick={() => setIsOpen(!isOpen)}
             className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"
           >
              <Menu className="w-6 h-6 text-white" />
           </button>
        </div>
      </motion.div>

      {/* Mobile Menu HUD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-6 top-32 bottom-6 bg-zinc-950/95 backdrop-blur-3xl rounded-[3rem] border border-white/5 z-[99] p-12 flex flex-col gap-12 lg:hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
             <div className="flex flex-col gap-8 text-4xl font-black uppercase italic tracking-tighter">
                {pages.map((item, i) => (
                  <motion.span 
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </motion.span>
                ))}
             </div>
             
             <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Active Node</span>
                   <span className="text-sm font-bold text-zinc-400">{content.brand_name || 'Agency'} Global Network</span>
                </div>
                <button 
                  className="w-full h-16 bg-white text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                >
                   Contact Intelligence
                   <ArrowRight className="w-4 h-4" />
                </button>
             </div>
             <button 
               onClick={() => setIsOpen(false)}
               className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl"
             >
                <X className="w-6 h-6 text-zinc-400" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
`
};
