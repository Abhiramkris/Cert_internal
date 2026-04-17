import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Zap, BarChart, Globe, Target, Cpu, Activity, Boxes, SquareDot } from 'lucide-react';
import ai from './ai.json';

const getIcon = (name: string, className: string) => {
  switch (name?.toLowerCase()) {
    case 'shield': return <Shield className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'barchart': return <BarChart className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'target': return <Target className={className} />;
    case 'cpu': return <Cpu className={className} />;
    case 'boxes': return <Boxes className={className} />;
    default: return <SquareDot className={className} />;
  }
};

export const SERVICES_INDUSTRIAL_GRID = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const services = content?.services || ai.fields.find(f => f.id === 'services')?.default;
    const cols = settings?.columns || '3';

    return (
      <section className="w-full bg-[#fafafa] py-24 px-8 flex justify-center">
        <div className="w-full max-w-7xl">
          <div className="mb-16 space-y-4">
             <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-zinc-950 uppercase" style={h2Font}>
                {content?.h2 || "Industrial Solution Sets."}
             </h2>
             <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed" style={pFont}>
                {content?.description || "Explore our architectural resilience nodes."}
             </p>
          </div>

          <div className={cn(
             "grid gap-8",
             cols === '2' ? "grid-cols-1 md:grid-cols-2" :
             cols === '4' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
             "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {services.map((service: any, idx: number) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 group">
                <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform shadow-lg">
                  {getIcon(service.icon, "w-6 h-6 text-white")}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-950 mb-4" style={h2Font}>
                  {service.title || service.label}
                </h3>
                <p className="text-base text-zinc-500 leading-relaxed" style={pFont}>
                  {service.desc}
                </p>
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
import { Shield, Zap, BarChart, Globe, Target, Cpu, Activity, Boxes, SquareDot, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const getIcon = (name: string, className: string) => {
  switch (name?.toLowerCase()) {
    case 'shield': return <Shield className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'barchart': return <BarChart className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'target': return <Target className={className} />;
    case 'cpu': return <Cpu className={className} />;
    case 'boxes': return <Boxes className={className} />;
    default: return <SquareDot className={className} />;
  }
};

export default function IndustrialFeaturesGrid() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const services = content?.services || [
    { title: "Neural Orchestration", desc: "Advanced AI kernels integrated into your core architecture.", icon: "Cpu" },
    { title: "Security Mesh", desc: "Multi-layer encryption nodes for enterprise-grade integrity.", icon: "Shield" },
    { title: "Quantum Scaling", desc: "Elastic infrastructure that scales at the speed of thought.", icon: "Zap" },
    { title: "Global Logistics", desc: "Distributed network nodes for zero-latency delivery.", icon: "Globe" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="w-full bg-[#fafafa] py-24 md:py-32 px-6 md:px-12 flex justify-center overflow-hidden">
      <div className="w-full max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-20 space-y-6"
        >
           <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-zinc-950 uppercase leading-[0.8]" style={{ fontFamily: global.font_family_heading }}>
              {content.h2}
           </h2>
           <div className="w-24 h-[2px] bg-zinc-950" />
           <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl leading-relaxed" style={{ fontFamily: global.font_family_body }}>
              {content.description}
           </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={cn(
             "grid gap-8",
             settings?.columns === '2' ? "grid-cols-1 md:grid-cols-2" :
             settings?.columns === '4' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
             "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group p-12 bg-white rounded-[3.5rem] border border-zinc-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-700"
            >
              <div className="w-16 h-16 bg-zinc-950 text-white rounded-[1.5rem] flex items-center justify-center mb-12 shadow-xl group-hover:bg-blue-600 group-hover:rotate-[360deg] transition-all duration-700">
                {getIcon(service.icon, "w-7 h-7")}
              </div>
              
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-950 mb-6 leading-none" style={{ fontFamily: global.font_family_heading }}>
                {service.title || service.label}
              </h3>
              
              <p className="text-base text-zinc-500 leading-relaxed mb-10" style={{ fontFamily: global.font_family_body }}>
                {service.desc}
              </p>
              
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-zinc-950 transition-colors pointer-events-none">
                <span>View Solution Protocol</span>
                <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
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
