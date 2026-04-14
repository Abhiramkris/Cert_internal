import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import ai from './ai.json';

export const HERO_FLOATING_STATS = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h1Font = { fontFamily: config?.font_family_heading || 'Inter' }
    const pFont = { fontFamily: config?.font_family_body || 'Inter' }
    
    const showBadge = settings?.show_top_badge ?? true;
    const isDarkStats = settings?.stats_card_style !== 'light';
    const containerAnim = settings?.container_animation === 'fade-up' ? 'animate-in fade-in slide-in-from-bottom-8 duration-1000' :
                          settings?.container_animation === 'scale-up' ? 'animate-in zoom-in-95 duration-1000' :
                          settings?.container_animation === 'blur-in' ? 'animate-in fade-in blur-sm duration-1000' : 
                          settings?.container_animation === 'none' ? '' : 'animate-in fade-in duration-1000';
    
    const textAnim = settings?.text_animation === 'fade' ? 'animate-in fade-in duration-700' :
                     settings?.text_animation === 'scale' ? 'animate-in zoom-in-95 duration-700' :
                     settings?.text_animation === 'none' ? '' : 'animate-in slide-in-from-bottom-4 fade-in duration-700';

    const textSize = settings?.hero_text_size || "text-6xl md:text-7xl lg:text-[80px]";
    const textAlignment = settings?.hero_text_alignment || "text-center";
    const textMargin = settings?.hero_text_margin || "mb-8";
    const flexAlignment = textAlignment === 'text-left' ? 'items-start' : textAlignment === 'text-right' ? 'items-end' : 'items-center';

    const fallbackAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80"
    ];

    const statsHighlight = content?.stats_highlight || {
      value: "50K+",
      label: "satisfied clients",
      description: "Our awesome clients are mostly around the world"
    };

    const defaultStats = [
      { value: "13+", label: "Years Experience" },
      { value: "20", label: "Professional Designer" },
      { value: "10K", label: "Digital Product" }
    ];

    const stats = (content?.stats && content.stats.length > 0) ? content.stats : defaultStats;

    return (
      <section className="relative min-h-[85vh] w-full bg-[#fdfdfd] pt-24 pb-48 px-6 overflow-hidden flex flex-col items-center">
        
        {/* Background ambient gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
           <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]" />
        </div>

        <div className={cn(`relative z-10 w-full max-w-5xl flex flex-col ${flexAlignment}`, containerAnim)}>
           
           {/* Top Badge */}
           {showBadge && (
             <div className="inline-flex items-center gap-4 bg-white p-2.5 pr-6 rounded-full border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10">
                <div className="flex -space-x-3">
                   {(content?.badge_avatars || fallbackAvatars).slice(0,3).map((url: string, i: number) => (
                     <img key={i} src={url} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                   ))}
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[11px] font-bold text-zinc-900" style={pFont}>
                     {content?.badge_text || "50K+ Satisfied Customer"}
                   </p>
                </div>
             </div>
           )}

           {/* Hero Text */}
           <h1 
             className={cn(`font-black text-zinc-950 tracking-tight leading-[1.05] max-w-5xl ${textMargin} ${textAlignment} ${textSize}`, textAnim)}
             style={h1Font}
           >
             {content?.h1_line1 || "Life Feels Empty Without"}<br/>
             <span style={{ color: config?.accent_color || '#3b82f6' }}>
               {content?.h1_accent || "Beautiful Design"}
             </span>
           </h1>

           <p className={cn(`mt-8 text-lg md:text-xl text-zinc-500 max-w-2xl leading-relaxed ${textAlignment}`, textAnim)} style={pFont}>
             {content?.description || "We create and design applications, websites, or other digital products with professionalism"}
           </p>

           {/* Hero Subject Cutout */}
           <div className={cn(`w-full max-w-4xl mt-12 relative h-[350px] md:h-[450px]`, textAnim)}>
              <img 
                src={content?.hero_image || "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2000&auto=format&fit=crop"} 
                alt="Hero Subject" 
                className="w-full h-full object-contain object-bottom mix-blend-multiply opacity-90"
              />
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#fdfdfd] to-transparent pointer-events-none" />
           </div>

        </div>

        {/* Floating Stats Panel */}
        <div className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-4 z-20",
          isDarkStats ? "bg-[#1c1d21]" : "bg-white border border-zinc-200",
          containerAnim
        )}>
           
           {/* Highlight Card */}
           <div 
             className="rounded-[2rem] p-8 md:p-10 w-full md:w-[40%] flex flex-col justify-between relative overflow-hidden group min-h-[180px] md:min-h-[220px]"
             style={{ backgroundColor: config?.accent_color || '#3b82f6' }}
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex justify-between items-start relative z-10 w-full">
                 <h3 className="text-4xl md:text-5xl font-black text-white" style={h1Font}>
                   {statsHighlight.value}
                 </h3>
                 <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                    <ArrowUpRight className="w-5 h-5" />
                 </button>
              </div>

              <div className="relative z-10 mt-6">
                 <p className="text-white font-bold text-sm md:text-base uppercase tracking-wider mb-2" style={h1Font}>
                   {statsHighlight.label}
                 </p>
                 <p className="text-white/80 text-xs md:text-sm max-w-[200px] leading-relaxed" style={pFont}>
                   {statsHighlight.description}
                 </p>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.slice(0, 3).map((stat: any, idx: number) => (
                <div 
                  key={idx}
                  className={cn(
                    "rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-sm",
                    isDarkStats ? "bg-white" : "bg-zinc-50 border border-zinc-100"
                  )}
                >
                   <h4 className="text-4xl md:text-5xl font-black text-zinc-950 mb-3" style={h1Font}>{stat.value}</h4>
                   <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest max-w-[120px] mx-auto" style={pFont}>{stat.label}</p>
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
import { ArrowUpRight } from 'lucide-react';

export default function FloatingStatsHero() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const showBadge = settings?.show_top_badge ?? true;
  const isDarkStats = settings?.stats_card_style !== 'light';
  const containerAnimPreset = settings?.container_animation || 'fade-up';
  const textAnimPreset = settings?.text_animation || 'slide-up';
  
  const textSize = settings?.hero_text_size || "text-6xl md:text-7xl lg:text-[80px]";
  const textAlignment = settings?.hero_text_alignment || "text-center";
  const textMargin = settings?.hero_text_margin || "mb-8";
  const flexAlignment = textAlignment === 'text-left' ? 'items-start' : textAlignment === 'text-right' ? 'items-end' : 'items-center';

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: containerAnimPreset === 'fade-up' ? 40 : 0, 
      scale: containerAnimPreset === 'scale-up' || containerAnimPreset === 'elastic-pop' ? 0.9 : 1,
      filter: containerAnimPreset === 'blur-in' ? "blur(10px)" : "blur(0px)",
      x: containerAnimPreset === 'slide-right' ? -50 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      filter: "blur(0px)",
      x: 0,
      transition: { 
        duration: 1, 
        staggerChildren: 0.1,
        type: containerAnimPreset === 'elastic-pop' ? "spring" : "tween",
        bounce: 0.5
      } 
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: textAnimPreset === 'slide-up' ? 20 : textAnimPreset === 'spring-up' ? 40 : 0,
      scale: textAnimPreset === 'scale' ? 0.95 : 1,
      filter: textAnimPreset === 'blur-reveal' ? "blur(0px)" : "blur(0px)",
      rotateX: textAnimPreset === 'flip-down' ? 90 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      rotateX: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        type: textAnimPreset === 'spring-up' ? "spring" : "tween",
        bounce: 0.4 
      } 
    }
  };

  const fallbackAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80"
  ];

  const statsHighlight = content?.stats_highlight || {
    value: "50K+",
    label: "satisfied clients",
    description: "Our awesome clients are mostly around the world"
  };

  const defaultStats = [
    { value: "13+", label: "Years Experience" },
    { value: "20", label: "Professional Designer" },
    { value: "10K", label: "Digital Product" }
  ];

  const stats = (content?.stats && content.stats.length > 0) ? content.stats : defaultStats;

  return (
    <section className="relative min-h-[85vh] w-full bg-[#fdfdfd] pt-32 pb-64 px-6 overflow-hidden flex flex-col items-center">
      
      {/* Background ambient gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-[100px]" 
         />
         <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        variants={containerAnimPreset === 'none' ? {} : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={\`relative z-10 w-full max-w-5xl flex flex-col \${flexAlignment}\`}
      >
         
         {/* Top Badge */}
         {showBadge && (
           <motion.div variants={itemVariants} className="inline-flex items-center gap-4 bg-white p-2.5 pr-6 rounded-full border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10">
              <div className="flex -space-x-3">
                 {(content?.badge_avatars || fallbackAvatars).slice(0,3).map((url: string, i: number) => (
                   <img key={i} src={url} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                 ))}
              </div>
              <div className="flex items-center gap-2">
                 <p className="text-[11px] font-bold text-zinc-900" style={{ fontFamily: global.font_family_body }}>
                   {content?.badge_text || "50K+ Satisfied Customer"}
                 </p>
              </div>
           </motion.div>
         )}

         {/* Hero Text */}
         <motion.h1 
           variants={textAnimPreset === 'none' ? {} : itemVariants}
           className={\`\${textSize} \${textMargin} \${textAlignment} font-black text-zinc-950 tracking-tight leading-[1.05] max-w-5xl\`}
           style={{ fontFamily: global.font_family_heading }}
         >
           {content?.h1_line1 || "Life Feels Empty Without"}<br/>
           <span style={{ color: global.accent_color || '#3b82f6' }}>
             {content?.h1_accent || "Beautiful Design"}
           </span>
         </motion.h1>

         <motion.p 
           variants={textAnimPreset === 'none' ? {} : itemVariants}
           className={\`\${textAlignment} mt-8 text-lg md:text-xl text-zinc-500 max-w-2xl leading-relaxed\`} 
           style={{ fontFamily: global.font_family_body }}
         >
           {content?.description || "We create and design applications, websites, or other digital products with professionalism"}
         </motion.p>

         {/* Hero Subject Cutout */}
         <motion.div variants={textAnimPreset === 'none' ? {} : itemVariants} className="w-full max-w-4xl mt-16 relative h-[350px] md:h-[450px]">
            <img 
              src={content?.hero_image || "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2000&auto=format&fit=crop"} 
              alt="Hero Subject" 
              className="w-full h-full object-contain object-bottom opacity-90 mx-auto"
            />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#fdfdfd] to-transparent pointer-events-none" />
         </motion.div>

      </motion.div>

      {/* Floating Stats Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4, type: "spring", damping: 25, stiffness: 100 }}
        className={\`absolute bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-4 z-20 \${isDarkStats ? "bg-[#1c1d21]" : "bg-white border border-zinc-200"}\`}
      >
         
         {/* Highlight Card */}
         <div 
           className="rounded-[2.5rem] p-10 w-full md:w-[40%] flex flex-col justify-between relative overflow-hidden group min-h-[220px]"
           style={{ backgroundColor: global.accent_color || '#3b82f6' }}
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150" />
            
            <div className="flex justify-between items-start relative z-10 w-full">
               <h3 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: global.font_family_heading }}>
                 {statsHighlight.value}
               </h3>
               <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <ArrowUpRight className="w-5 h-5" />
               </button>
            </div>

            <div className="relative z-10 mt-8">
               <p className="text-white font-bold text-sm md:text-base uppercase tracking-wider mb-2" style={{ fontFamily: global.font_family_heading }}>
                 {statsHighlight.label}
               </p>
               <p className="text-white/80 text-xs md:text-sm max-w-[200px] leading-relaxed" style={{ fontFamily: global.font_family_body }}>
                 {statsHighlight.description}
               </p>
            </div>
         </div>

         {/* Metrics Grid */}
         <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.slice(0, 3).map((stat: any, idx: number) => (
              <div 
                key={idx}
                className={\`rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-sm transition-transform hover:-translate-y-2 duration-300 \${isDarkStats ? "bg-white" : "bg-zinc-50 border border-zinc-100"}\`}
              >
                 <h4 className="text-4xl md:text-5xl font-black text-zinc-950 mb-3" style={{ fontFamily: global.font_family_heading }}>{stat.value}</h4>
                 <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest max-w-[120px] mx-auto" style={{ fontFamily: global.font_family_body }}>{stat.label}</p>
              </div>
            ))}
         </div>

      </motion.div>

    </section>
  );
}
`
};
