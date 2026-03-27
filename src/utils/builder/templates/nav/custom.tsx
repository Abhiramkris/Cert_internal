'use client'
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const NAV_CUSTOM = {
  name: 'Custom Solid Nav',
  type: 'layout',
  preview: (config: any, content: any, settings: any) => {
    const bgColor = settings?.bg_color || '#ffffff';
    const gradient = settings?.bg_gradient || '';
    const style = config.button_style || 'solid';
    
    const buttonClass = cn(
      "px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-full transition-all",
      style === 'solid' ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-100' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-900 to-zinc-500 text-white shadow-xl' :
      style === 'outline' ? 'border-2 border-zinc-900 text-zinc-900' :
      'bg-zinc-100/50 backdrop-blur-md border border-zinc-200 text-zinc-900 shadow-xl'
    );
    
    return (
      <nav 
        className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-zinc-100"
        style={{ 
          backgroundColor: gradient ? 'transparent' : bgColor,
          backgroundImage: gradient || 'none'
        }}
      >
        <div 
          className="text-lg md:text-xl font-bold tracking-tight text-zinc-900"
          style={{ 
            fontFamily: config.font_family_heading, 
            fontWeight: config.font_weight_heading,
            fontSize: `${config.font_size_h2 * 0.6}px`
          }}
        >
          {content.brand_name || 'Agency'}
        </div>
        <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
           <span>Home</span>
           <span>Work</span>
           <span>About</span>
        </div>
        <div className="flex items-center gap-4">
          <button className={buttonClass}>Explore</button>
          <Menu className="w-4 h-4 md:hidden text-zinc-900" />
        </div>
      </nav>
    );
  },
  code: (config: any) => `
'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../data/config.json';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const settings = config.settings?.NAV_CUSTOM || {};
  const global = config.styles;
  const content = config.content;
  
  const bgColor = settings.bg_color || '#ffffff';
  const gradient = settings.bg_gradient || '';
  
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 z-50 flex items-center justify-between px-6 md:px-10 py-4 md:py-6 rounded-[2rem] md:rounded-full border border-zinc-100 shadow-2xl backdrop-blur-xl"
        style={{ 
          backgroundColor: gradient ? 'transparent' : bgColor + 'aa', // Subtle transparency
          backgroundImage: gradient || 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div 
          className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 uppercase italic"
          style={{ 
            fontFamily: global.font_family_heading, 
            fontWeight: global.font_weight_heading,
            fontSize: \`clamp(18px, 4vw, \${global.font_size_h2 * 0.7}px)\`
          }}
        >
          {content.brand_name || 'Agency'}
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 text-sm font-bold text-zinc-600 uppercase tracking-widest">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="hover:text-zinc-900 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary !h-10 md:!h-12 !px-6 md:!px-8 !text-[10px] md:!text-[11px] !font-black !uppercase !tracking-widest"
          >
            {content.cta_primary || 'Get Started'}
          </motion.button>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden bg-zinc-900 text-white rounded-full"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-40 md:hidden p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col gap-6"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter"
                  style={{ fontFamily: global.font_family_heading }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
  `
};
