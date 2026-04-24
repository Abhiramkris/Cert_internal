import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import ai from './ai.json';

export const STATS_WELLNESS_JOURNEY = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };

    return (
      <section className="w-full py-24 px-8 bg-[#1A2E1D]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-white uppercase italic" style={h2Font}>
              {content?.h2 || "Mental Wellness Journey"}
            </h2>
            <p className="text-zinc-400" style={pFont}>
              {content?.description || "A clear path towards your healing and growth."}
            </p>
          </div>

          <div className="space-y-24">
            {(content?.steps || [...Array(3)]).map((step: any, i: number) => (
              <div key={i} className={cn("flex items-center gap-12", i % 2 !== 0 && "flex-row-reverse")}>
                 <div className="flex-1 aspect-[4/3] bg-zinc-800 rounded-3xl overflow-hidden border border-white/5">
                   <img 
                     src={step?.image || "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=600"} 
                     className="w-full h-full object-cover opacity-60" 
                     alt="Step"
                   />
                 </div>
                 <div className="flex-1 space-y-6">
                    <span className="text-6xl font-black text-white/10">{step?.number || \`0\${i + 1}\`}</span>
                    <h3 className="text-2xl font-bold text-white uppercase italic" style={h2Font}>{step?.title || 'Initial Consultation'}</h3>
                    <p className="text-zinc-500 leading-relaxed" style={pFont}>
                      {step?.description || "Start your journey with a personalized session to understand your needs."}
                    </p>
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
import { CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WellnessJourneySteps() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const accentColor = settings?.accent_color === 'lime' ? 'text-[#DFFF1A]' : 
                      settings?.accent_color === 'white' ? 'text-white' : 'text-[#1A2E1D]';

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.3 } }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 0, y: 30 },
    animate: { opacity: 1, x: 0, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="w-full py-24 md:py-40 px-6 bg-[#1A2E1D] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-8 mb-24 md:mb-32"
        >
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-[1px] bg-white/20" />
             <span className="text-[11px] font-black uppercase tracking-[0.6em] text-[#DFFF1A]">The Process</span>
             <div className="w-12 h-[1px] bg-white/20" />
          </div>
          <h2 
            className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.85]"
            style={{ fontFamily: global.font_family_heading }}
          >
            {content.h2}
          </h2>
          <p 
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium"
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
          className="space-y-32 md:space-y-48"
        >
          {content.steps.map((step: any, i: number) => (
            <motion.div 
              key={i} 
              variants={stepVariants}
              className={cn(
                "flex flex-col md:flex-row items-center gap-12 md:gap-24 relative",
                i % 2 !== 0 && "md:flex-row-reverse"
              )}
            >
              {/* Connector Line */}
              {i < content.steps.length - 1 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-32 md:h-48 bg-gradient-to-b from-white/10 to-transparent hidden md:block" />
              )}

              {/* Image Side */}
              <div className="flex-1 w-full relative">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="aspect-[4/3] rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/5 bg-zinc-900 group"
                >
                   <img 
                     src={step.image} 
                     alt={step.title} 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000 grayscale group-hover:grayscale-0"
                   />
                   <div className="absolute inset-0 bg-gradient-to-tr from-[#1A2E1D]/80 via-transparent to-transparent" />
                </motion.div>
                
                {/* Decorative Step Number */}
                <span className="absolute -top-12 -left-8 text-[12rem] font-black text-white/[0.03] select-none leading-none pointer-events-none italic">
                   {step.number}
                </span>
              </div>

              {/* Content Side */}
              <div className="flex-1 space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#DFFF1A] flex items-center justify-center rotate-12 shadow-[0_0_30px_rgba(223,255,26,0.3)]">
                         <span className="text-[#1A2E1D] font-black italic">{step.number}</span>
                      </div>
                      <div className="h-[2px] w-12 bg-white/10" />
                   </div>
                   
                   <h3 
                     className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight"
                     style={{ fontFamily: global.font_family_heading }}
                   >
                     {step.title}
                   </h3>
                </div>

                <p 
                  className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium"
                  style={{ fontFamily: global.font_family_body }}
                >
                  {step.description}
                </p>

                <ul className="space-y-4 pt-4">
                   {['Tailored planning', 'Expert guidance', 'Continuous growth'].map((item, j) => (
                     <li key={j} className="flex items-center gap-3 text-white/60 text-sm font-bold uppercase tracking-widest">
                        <CheckCircle className="w-4 h-4 text-[#DFFF1A]" />
                        {item}
                     </li>
                   ))}
                </ul>
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
