import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export const TESTIMONIALS_GRID = {
  name: 'Premium Testimonial Grid',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const align = config.text_alignment || 'center';
    const hierarchy = settings?.hierarchy || 'h2';
    
    const alignmentClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';

    const HeadingTag = (hierarchy || 'h2') as any;

    return (
      <section className="py-16 px-8 bg-white border-b border-zinc-50 relative">
        <div className={cn("max-w-4xl mx-auto flex flex-col", alignmentClass)}>
          <HeadingTag 
            className="font-black text-zinc-900 tracking-tight leading-none mb-4"
            style={{ 
              fontFamily: config.font_family_heading, 
              fontWeight: config.font_weight_heading,
              fontSize: `${config.font_size_h2 * 0.75}px`
            }}
          >
            What Experts Say
          </HeadingTag>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
            {[1, 2].map(i => (
              <div key={i} className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col gap-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-2 h-2 fill-zinc-900 text-zinc-900" />)}
                </div>
                <p className="text-[10px] text-zinc-500 font-medium italic">"The level of craft and technical precision is unmatched in the industry today."</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
                    <img src="/assets/hero-placeholder.png" alt="" className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-zinc-950 uppercase">Director {i}</span>
                    <span className="text-[8px] font-bold text-zinc-400">Fortune 500</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
  code: (config: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import config from '../data/config.json';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Design Director @ Velo',
    text: 'The level of craft and technical precision is unmatched. They turned our complex vision into a seamless digital breakthrough.',
    rating: 5
  },
  {
    name: 'Marcus Thorne',
    role: 'CTO @ Nexus Systems',
    text: 'Beyond the aesthetics, the performance and reliability of the platform they built for us is truly world-class.',
    rating: 5
  },
  {
    name: 'Elena Rossi',
    role: 'Founder @ Aura Luxe',
    text: 'A rare combination of artistic vision and engineering rigor. Our conversion rates have doubled since the relaunch.',
    rating: 5
  }
];

export default function Testimonials() {
  const global = config.styles;
  const settings = config.settings?.TESTIMONIALS_GRID || { animation: 'fade' };
  const align = global.text_alignment || 'center';
  
  const alignmentClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';
  const mx = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  return (
    <section className="py-24 md:py-40 px-8 bg-white border-b border-zinc-100 overflow-hidden">
      <div className={cn("max-w-7xl mx-auto flex flex-col", alignmentClass)}>
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6"
        >
          Voices of Excellence
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="font-black text-zinc-900 tracking-tight leading-none mb-16 md:mb-24 italic"
          style={{ 
            fontFamily: global.font_family_heading, 
            fontWeight: global.font_weight_heading,
            fontSize: \`clamp(32px, 6vw, \${global.font_size_h2}px)\`
          }}
        >
          Endorsed by Industry Leaders
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="p-10 md:p-14 bg-zinc-50 rounded-[4rem] border border-zinc-100 flex flex-col gap-10 shadow-xl shadow-zinc-100/50 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex gap-1.5">
                {[...Array(t.rating)].map((_, s) => (
                  <Star key={s} className="w-3 md:w-4 h-3 md:h-4 fill-zinc-950 text-zinc-950" />
                ))}
              </div>
              
              <blockquote 
                className="text-xl md:text-2xl font-bold text-zinc-800 leading-relaxed italic"
                style={{ fontFamily: global.font_family_body }}
              >
                "{t.text}"
              </blockquote>

              <div className="flex items-center gap-5 mt-auto">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-200 p-0.5 border border-zinc-300 overflow-hidden">
                   <img src="/assets/hero-placeholder.png" alt="" className="w-full h-full object-cover grayscale brightness-110" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-black text-zinc-950 uppercase tracking-widest">{t.name}</span>
                  <span className="text-[11px] md:text-[12px] font-bold text-zinc-400 uppercase">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
  `
};
