import React from 'react';

export const FOOTER_SOCIAL = {
  name: 'High-Fidelity Social Footer',
  type: 'layout',
  preview: (config: any) => (
    <footer className="py-16 px-10 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="grid grid-cols-2 gap-10">
        <div className="space-y-4">
          <div 
            className="text-xl font-black tracking-tighter uppercase italic"
            style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
          >
            Agency
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Building the next generation of digital experiences.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <h4 className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Explore</h4>
              <div className="text-[8px] text-zinc-400 space-y-1"><div>Work</div><div>About</div></div>
           </div>
           <div className="space-y-2">
              <h4 className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Legal</h4>
              <div className="text-[8px] text-zinc-400 space-y-1"><div>Privacy</div><div>Terms</div></div>
           </div>
        </div>
      </div>
    </footer>
  ),
  code: (config: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';
import config from '../data/config.json';

export default function Footer() {
  const settings = config.settings?.FOOTER_SOCIAL || { animation: 'fade' };
  const global = config.styles;
  
  const variants = {
    none: { initial: {}, whileInView: {} },
    fade: { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    'slide-up': { initial: { y: 40, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;

  return (
    <footer className="py-24 px-10 bg-zinc-950 text-white border-t border-zinc-900 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <motion.div 
          {...selected}
          viewport={{ once: true }}
          className="md:col-span-2 space-y-8"
        >
          <div 
            className="text-3xl font-black tracking-tighter uppercase italic"
            style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
          >
            {config.content.brand_name || 'Agency Labs'}
          </div>
          <p className="text-zinc-500 text-lg leading-relaxed max-w-md font-medium">
            {config.content.footer_description || 'Building the next generation of digital experiences with a focus on premium aesthetics and unmatched performance.'}
          </p>
          <div className="flex gap-6">
            <Instagram className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
            <Github className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </motion.div>
        
        <motion.div 
          {...selected}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Company</h4>
          <ul className="space-y-4 text-xs font-bold text-zinc-400">
            <li className="hover:text-white cursor-pointer transition-colors">Digital Strategy</li>
            <li className="hover:text-white cursor-pointer transition-colors">Engineering</li>
            <li className="hover:text-white cursor-pointer transition-colors">Consultancy</li>
          </ul>
        </motion.div>
        
        <motion.div 
          {...selected}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Contact</h4>
          <div className="space-y-4 text-xs font-bold text-zinc-400">
            <p>{config.content.email || 'projects@agency.com'}</p>
            <p>{config.content.phone || '+1 (555) 000-1111'}</p>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto pt-16 mt-16 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest"
      >
        <span>© {new Date().getFullYear()} {config.content.brand_name || 'Agency Labs'}. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8">
           <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
           <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </motion.div>
    </footer>
  );
}
`
};
