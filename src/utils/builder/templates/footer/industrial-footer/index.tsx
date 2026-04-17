import React from 'react';
import { cn } from '@/lib/utils';
import { Globe, Twitter, Github, Linkedin, ArrowUpRight, Cpu } from 'lucide-react';
import ai from './ai.json';

export const FOOTER_INDUSTRIAL_COMMAND = {
  ...ai,
  type: 'layout',
  preview: (config: any, content: any, settings: any) => {
    const brandFont = { fontFamily: config?.font_family_heading || 'Inter', fontWeight: '900' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    return (
      <footer className="w-full bg-zinc-950 border-t border-white/5 pt-24 pb-12 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-white" style={brandFont}>
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl">
                   <Globe className="w-6 h-6 text-zinc-950" />
                </div>
                <span>{content?.brand_name || 'Agency'}</span>
              </div>
              <p className="text-zinc-500 text-lg leading-relaxed max-w-sm" style={pFont}>
                {content?.bio || "Architecting the infrastructure of the digital future."}
              </p>
              <div className="flex items-center gap-4">
                 {[Twitter, Github, Linkedin].map((Icon, i) => (
                   <div key={i} className="w-12 h-12 bg-white/5 border border-white/5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                   </div>
                 ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-12">
               {(content?.links || []).map((col: any, i: number) => (
                 <div key={i} className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                      {col.label}
                    </h4>
                    <ul className="space-y-4">
                       {col.links?.map((link: string, j: number) => (
                         <li key={j} className="text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-medium flex items-center gap-2 group">
                            <span>{link}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                         </li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
                <span>© {new Date().getFullYear()} {content?.brand_name}</span>
                <span>All Rights Reserved</span>
             </div>
             
             {settings?.show_status && (
                <div className="flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/5 rounded-full">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Network Status: Operational</span>
                   <div className="w-[1px] h-3 bg-white/10 mx-2" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Node-01-Verified</span>
                </div>
             )}
          </div>
        </div>
      </footer>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Twitter, Github, Linkedin, ArrowUpRight, Cpu, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function IndustrialCommandFooter() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const links = content?.links || [
    { label: "Solutions", links: ["Global Ledger", "Neural Audit", "Quantum Mesh"] },
    { label: "Ecosystem", links: ["Network Status", "Developer Node", "Community"] },
    { label: "Company", links: ["About Force", "Careers", "Legal"] }
  ];

  return (
    <footer className="w-full bg-zinc-950 border-t border-white/5 pt-32 pb-16 px-6 md:px-12 overflow-hidden relative">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 text-3xl font-black uppercase italic tracking-tighter text-white"
            >
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-2xl shadow-white/5">
                 <Globe className="w-7 h-7 text-zinc-950" />
              </div>
              <span style={{ fontFamily: global.font_family_heading }}>{content.brand_name}</span>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-zinc-500 text-xl leading-relaxed max-w-md"
              style={{ fontFamily: global.font_family_body }}
            >
              {content.bio}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center gap-5"
            >
               {[Twitter, Github, Linkedin].map((Icon, i) => (
                 <Link key={i} href="#">
                   <motion.div 
                     whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                     whileTap={{ scale: 0.9 }}
                     className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-xl"
                   >
                      <Icon className="w-6 h-6" />
                   </motion.div>
                 </Link>
               ))}
            </motion.div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-16">
             {links.map((col, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 + (i * 0.1) }}
                 viewport={{ once: true }}
                 className="space-y-8"
               >
                  <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-600">
                    {col.label}
                  </h4>
                  <ul className="space-y-5">
                     {col.links.map((link, j) => (
                       <li key={j}>
                         <Link href="#" className="text-zinc-400 hover:text-white transition-all text-base font-semibold flex items-center gap-2 group">
                            <span className="relative">
                              {link}
                              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-500" />
                            </span>
                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                         </Link>
                       </li>
                     ))}
                  </ul>
               </motion.div>
             ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10"
        >
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
              <span className="hover:text-zinc-400 transition-colors cursor-pointer">© {new Date().getFullYear()} {content.brand_name}</span>
              <span className="hidden md:block w-1.5 h-1.5 bg-zinc-800 rounded-full" />
              <span className="hover:text-zinc-400 transition-colors cursor-pointer">Privileges Reserved</span>
              <span className="hidden md:block w-1.5 h-1.5 bg-zinc-800 rounded-full" />
              <span className="hover:text-zinc-400 transition-colors cursor-pointer">Security Protocol: v4.1</span>
           </div>
           
           {settings?.show_status && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-5 px-8 py-3 bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl"
              >
                 <div className="relative">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full relative z-10" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Network: Optimal</span>
                 <div className="w-[1px] h-4 bg-white/10 mx-1" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Feedback Active</span>
              </motion.div>
           )}
        </div >
      </div>
    </footer>
  );
}
`
};
