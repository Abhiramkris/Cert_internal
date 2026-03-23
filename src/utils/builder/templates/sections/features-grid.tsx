import React from 'react';

export const FEATURES_GRID = {
  name: 'Modern Feature Grid',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const align = config.text_alignment || 'center';
    const cardStyle = settings?.card_style || 'standard';
    
    const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
    const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';

    const cardClass = cardStyle === 'minimal' ? 'bg-transparent border-none shadow-none p-4' :
                     cardStyle === 'glass' ? 'bg-white/40 backdrop-blur-md border border-white shadow-xl rounded-[2.5rem] p-6' :
                     'bg-white rounded-2xl border border-zinc-50 shadow-sm p-6';

    return (
      <section className={`py-16 px-8 bg-zinc-50 border-b border-zinc-100 ${alignmentClass}`}>
        <div className={`grid grid-cols-2 gap-4`}>
          {[1,2,3,4].map(i => (
            <div key={i} className={`${cardClass} flex flex-col ${containerAlign}`}>
              <div className="w-8 h-8 bg-zinc-900 rounded-xl mb-4" />
              <h3 
                className="text-[10px] font-black text-zinc-900 mb-1 uppercase tracking-widest"
                style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
              >
                Feature {i}
              </h3>
              <p className="text-[9px] text-zinc-400 leading-relaxed font-medium">Elevating digital standards through craft.</p>
            </div>
          ))}
        </div>
      </section>
    );
  },
  code: (config: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Rocket, Heart } from 'lucide-react';
import config from '../data/config.json';

const features = [
  { title: 'Ultra Fast', desc: 'Optimized for performance and speed.', icon: Zap },
  { title: 'Secure', desc: 'Built with elite security protocols.', icon: Shield },
  { title: 'Scalable', desc: 'Grows with your team and business.', icon: Rocket },
  { title: 'Premium', desc: 'The highest quality in every pixel.', icon: Heart },
];

export default function Features() {
  const settings = config.settings?.FEATURES_GRID || { animation: 'fade' };
  const global = config.styles;
  const align = global.text_alignment || 'center';
  const cardStyle = settings.card_style || 'standard';
  
  const variants = {
    none: { initial: {}, whileInView: {} },
    fade: { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    'slide-up': { initial: { y: 40, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;

  const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';

  const cardClass = cardStyle === 'minimal' ? 'bg-transparent border-none shadow-none p-0' :
                   cardStyle === 'glass' ? 'bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[3.5rem] p-10' :
                   'bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 p-10';

  return (
    <section className={\`py-32 px-8 bg-zinc-50 \${alignmentClass}\`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              {...selected}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className={\`flex flex-col \${containerAlign} \${cardClass} transition-all duration-500Group\`}
            >
              <div className="w-16 h-16 bg-zinc-950 rounded-[1.25rem] flex items-center justify-center mb-10 shadow-2xl shadow-zinc-200 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 
                className="text-2xl font-black text-zinc-950 mb-4 tracking-tight"
                style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
              >
                {f.title}
              </h3>
              <p className="text-zinc-500 text-base leading-relaxed font-medium">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`
};
