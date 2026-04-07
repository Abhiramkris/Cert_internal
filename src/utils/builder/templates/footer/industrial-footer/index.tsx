import React from 'react';
import { cn } from '@/lib/utils';
import { Instagram, Twitter, Linkedin, Github as GithubIcon, Globe, MapPin } from 'lucide-react';
import ai from './ai.json';

export const FOOTER_INDUSTRIAL = {
  ...ai,
  type: 'layout',
  preview: (config: any, content: any, settings: any) => {
    return (
      <footer className="py-24 px-10 bg-zinc-950 text-white border-t border-white/5 space-y-16">
        <div className="flex flex-col md:flex-row justify-between gap-12 border-b border-white/5 pb-16">
           <div className="space-y-6">
              <div className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3" 
                   style={{ fontFamily: config?.font_family_heading || 'Inter' }}>
                 <Globe className="w-6 h-6" style={{ color: config?.accent_color || '#10b981' }} />
                 {content?.brand_name || 'Agency'}
              </div>
              <p className="text-xs md:text-sm text-zinc-500 font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                 High-stakes digital engineering for the world's most demanding enterprises.
              </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Company</h4>
                 <div className="text-[10px] text-zinc-400 space-y-2 font-bold uppercase tracking-widest">
                    <p className="hover:text-white transition-colors cursor-pointer">Expertise</p>
                    <p className="hover:text-white transition-colors cursor-pointer">Network</p>
                    <p className="hover:text-white transition-colors cursor-pointer">Projects</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
           <span>© {new Date().getFullYear()} {content?.brand_name || 'Agency'} LABS INC.</span>
           <div className="flex gap-8">
              <a href={content?.privacy_policy_url || '#'} className="hover:text-white cursor-pointer transition-colors" style={{ color: config?.accent_color }}>Privacy Vector</a>
              <a href={content?.terms_url || '#'} className="hover:text-white cursor-pointer transition-colors" style={{ color: config?.accent_color }}>Terms of Command</a>
           </div>
        </div>
      </footer>
    );
  },
  code: (config: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Github as GithubIcon, Globe, MapPin, ArrowUpRight } from 'lucide-react';
import config from '../data/config.json';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function FooterIndustrial() {
  const global = config.styles;
  const content = config.content;

  return (
    <footer className="py-24 px-10 bg-zinc-950 text-white border-t border-white/5 space-y-24 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-24 lg:gap-32 pb-24 border-b border-white/5">
        <div className="space-y-12 flex-1">
           <motion.div 
             whileHover={{ x: 5 }}
             className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 group cursor-pointer"
           >
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-2xl shadow-emerald-500/10">
                 <Globe className="w-6 h-6 text-zinc-950" />
              </div>
              <span>{content.brand_name || 'Agency'}</span>
           </motion.div>
           
           <p className="text-lg text-zinc-500 font-medium max-w-sm leading-relaxed mt-10">
              Transforming complex industrial logic into seamless digital breakthroughs of the highest technical caliber.
           </p>

           <div className="flex gap-8">
              {[
                { Icon: Twitter, url: content?.twitter_url || '#' },
                { Icon: Linkedin, url: content?.linkedin_url || '#' },
                { Icon: GithubIcon, url: content?.github_url || content?.github_link || '#' }
              ].map(({ Icon, url }, idx) => (
                <motion.a 
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ color: '#ffffff' }}
                  whileHover={{ y: -5, color: '#10b981' }}
                  className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer transition-all"
                >
                   <Icon className="w-5 h-5" />
                </motion.a>
              ))}
           </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
           {['Expertise', 'Projects', 'Legal'].map((title, idx) => (
             <div key={idx} className="space-y-8">
                <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700 underline underline-offset-8 decoration-emerald-800">{title}</h4>
                <ul className="text-xs font-bold text-zinc-500 space-y-5 uppercase tracking-[0.2em]">
                   {['Blueprint', 'Strategy', 'Audits'].map((link) => (
                     <li key={link} className="hover:text-emerald-500 cursor-pointer flex items-center gap-2 group transition-all">
                        {link}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </li>
                   ))}
                </ul>
             </div>
           ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 pt-16 text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">
         <div className="flex flex-col gap-2 md:items-start text-center md:text-left">
            <span>© {new Date().getFullYear()} {content.brand_name || 'Agency'} LABS INC.</span>
            <span className="text-zinc-800 text-[8px]">ALL DATA ENCRYPTED VIA INDUSTRIAL COMMAND PROTOCOL.</span>
         </div>
         
         <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            <a href={content?.privacy_policy_url || '#'} className="hover:text-white cursor-pointer transition-colors relative group">
               Privacy Vector
               <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-emerald-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a href={content?.terms_url || '#'} className="hover:text-white cursor-pointer transition-colors relative group">
               Terms of Command
               <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-emerald-500 group-hover:w-full transition-all duration-300" />
            </a>
         </div>
      </div>
    </footer>
  );
}
  `
};
