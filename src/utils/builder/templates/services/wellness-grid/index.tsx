import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight } from 'lucide-react';
import ai from './ai.json';

export const SERVICES_WELLNESS_GRID = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const bgColor = settings?.section_background === 'dark' ? 'bg-[#1A2E1D]' : 
                    settings?.section_background === 'muted' ? 'bg-[#F8F9F8]' : 'bg-white';
    
    const columns = settings?.columns_count === '2-cols' ? 'grid-cols-2' :
                    settings?.columns_count === '4-cols' ? 'grid-cols-4' : 'grid-cols-3';

    return (
      <section className={cn("w-full py-24 px-8", bgColor)}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight text-[#1A2E1D]" style={h2Font}>
                {content?.h2 || "Choose what fits you best"}
              </h2>
              <p className="text-zinc-500 max-w-xl" style={pFont}>
                {content?.description || "Tailored mental health support for every stage of life."}
              </p>
            </div>
          </div>

          <div className={cn("grid gap-8", columns)}>
            {(content?.services || [...Array(3)]).map((service: any, i: number) => (
              <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all duration-500">
                <div className="aspect-[4/3] bg-zinc-200 overflow-hidden relative">
                   <img 
                     src={service?.image || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"} 
                     className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
                     alt="Service"
                   />
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-[#1A2E1D]" style={h2Font}>{service?.title || 'Individual Therapy'}</h3>
                    {settings?.show_prices && (
                      <span className="text-sm font-bold px-3 py-1 bg-zinc-100 rounded-full text-zinc-600">{service?.price || '$120'}</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed" style={pFont}>
                    {service?.description || "Work one-on-one with a professional counselor in a safe environment."}
                  </p>
                  <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#1A2E1D] group/btn pt-4">
                     {service?.cta_text || 'Book Now'}
                     <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
  code: (config: any, content: any, settings: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WellnessServicesGrid() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const bgColor = settings?.section_background === 'dark' ? 'bg-[#1A2E1D]' : 
                  settings?.section_background === 'muted' ? 'bg-[#F8F9F8]' : 'bg-white';
  
  const textColor = settings?.section_background === 'dark' ? 'text-white' : 'text-[#1A2E1D]';
  const subTextColor = settings?.section_background === 'dark' ? 'text-zinc-400' : 'text-zinc-500';

  const columns = settings?.columns_count === '2-cols' ? 'md:grid-cols-2' :
                  settings?.columns_count === '4-cols' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className={cn("w-full py-24 md:py-32 px-6 md:px-12", bgColor)}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-[#DFFF1A]" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Our Services</span>
            </div>
            <h2 
              className={cn("text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none", textColor)}
              style={{ fontFamily: global.font_family_heading }}
            >
              {content.h2}
            </h2>
          </div>
          <p 
            className={cn("text-xl max-w-sm font-medium leading-relaxed", subTextColor)}
            style={{ fontFamily: global.font_family_body }}
          >
            {content.description}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className={cn("grid gap-8 md:gap-10", columns)}
        >
          {content.services.map((service: any, i: number) => (
            <motion.div 
              key={i} 
              variants={cardVariants}
              whileHover={settings?.card_hover_effect === 'lift' ? { y: -12 } : 
                          settings?.card_hover_effect === 'zoom' ? { scale: 1.02 } : {}}
              className={cn(
                "group relative bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500",
                settings?.card_hover_effect === 'glow' ? "hover:shadow-[0_20px_50px_rgba(223,255,26,0.15)]" : "shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-2xl"
              )}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {settings?.show_prices && (
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                    <span className="text-sm font-black text-[#1A2E1D] tracking-tighter">{service.price}</span>
                  </div>
                )}
              </div>
              
              <div className="p-8 md:p-10 space-y-6">
                <h3 
                  className="text-2xl font-black text-[#1A2E1D] tracking-tight"
                  style={{ fontFamily: global.font_family_heading }}
                >
                  {service.title}
                </h3>
                
                <p 
                  className="text-zinc-500 leading-relaxed font-medium"
                  style={{ fontFamily: global.font_family_body }}
                >
                  {service.description}
                </p>

                <div className="pt-4 flex items-center justify-between">
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#1A2E1D] group/btn"
                  >
                    <span>{service.cta_text || 'Book Now'}</span>
                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover/btn:bg-[#DFFF1A] transition-colors duration-300">
                       <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                  
                  <div className="flex -space-x-2">
                     {[...Array(3)].map((_, j) => (
                       <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                          <img src={\`https://i.pravatar.cc/100?u=\${i}\${j}\`} alt="avatar" />
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
`
};
