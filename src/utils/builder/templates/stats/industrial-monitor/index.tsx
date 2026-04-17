import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Zap, BarChart, Globe, Target, Cpu, Activity } from 'lucide-react';
import ai from './ai.json';

const getIcon = (name: string, className: string) => {
  switch (name?.toLowerCase()) {
    case 'shield': return <Shield className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'barchart': return <BarChart className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'target': return <Target className={className} />;
    case 'cpu': return <Cpu className={className} />;
    default: return <Activity className={className} />;
  }
};

export const STATS_INDUSTRIAL_MONITOR = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h2Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const theme = settings?.theme || 'dark';
    const cols = settings?.columns || '4';
    
    const stats = content?.stats || ai.fields.find(f => f.id === 'stats')?.default;

    return (
      <section className="w-full bg-zinc-950 py-24 px-8 flex justify-center">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat: any, idx: number) => (
              <div 
                key={idx} 
                className={cn(
                  "p-8 rounded-[2rem] border transition-all duration-500 group",
                  theme === 'dark' ? "bg-zinc-900 border-white/5 hover:border-white/10" :
                  theme === 'glass' ? "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10" :
                  "bg-white border-zinc-200"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {getIcon(stat.icon, "w-6 h-6 text-white")}
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black italic tracking-tighter text-white" style={h2Font}>
                    {stat.value || stat.node}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500" style={pFont}>
                    {stat.label}
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
import { Shield, Zap, BarChart, Globe, Target, Cpu, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const getIcon = (name: string, className: string) => {
  switch (name?.toLowerCase()) {
    case 'shield': return <Shield className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'barchart': return <BarChart className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'target': return <Target className={className} />;
    case 'cpu': return <Cpu className={className} />;
    default: return <Activity className={className} />;
  }
};

export default function IndustrialStatsMonitor() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const stats = content?.stats || [
    { label: "Systems Verified", value: "2.4k+", icon: "Shield" },
    { label: "Global Uptime", value: "99.9%", icon: "Zap" },
    { label: "Annual Revenue", value: "$12.4M", icon: "BarChart" },
    { label: "Cities Reached", value: "480", icon: "Globe" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="w-full bg-zinc-950 py-24 md:py-32 px-6 md:px-12 flex justify-center overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="w-full max-w-7xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 group overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none group-hover:bg-white/[0.04] transition-colors" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                  {getIcon(stat.icon, "w-6 h-6 text-white")}
                </div>
                
                <div className="space-y-2">
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    className="text-5xl md:text-6xl font-black italic tracking-tighter text-white"
                    style={{ fontFamily: global.font_family_heading }}
                  >
                    {stat.value}
                  </motion.h3>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-white/30 transition-all duration-500" />
                    <p 
                      className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-zinc-300 transition-colors"
                      style={{ fontFamily: global.font_family_body }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
`
};
