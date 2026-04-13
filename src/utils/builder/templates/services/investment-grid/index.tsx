import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import ai from './ai.json';

const ArrowButton = ({ className }: { className?: string }) => (
  <div className={cn("w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", className)}>
    <ArrowUpRight className="w-5 h-5 text-zinc-950" />
  </div>
);

export const SERVICES_INVESTMENT_GRID = {
  ...ai,
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const h1Font = { fontFamily: config?.font_family_heading || 'Inter' };
    const pFont = { fontFamily: config?.font_family_body || 'Inter' };
    
    const accentColor = settings?.accent_color || '#d9f99d';
    const highlightWord = content?.highlight_word || "Opportunity";

    const renderTitle = (text: string) => {
      if (!text) return null;
      const parts = text.split(highlightWord);
      if (parts.length === 1) return text;
      return (
        <>
          {parts[0]}
          <span className="relative inline-block px-1">
            <span className="relative z-10">{highlightWord}</span>
            <span 
              className="absolute bottom-1 left-0 w-full h-3 -rotate-2 z-0 opacity-80" 
              style={{ backgroundColor: accentColor }}
            />
          </span>
          {parts[1]}
        </>
      );
    };

    const fallbackAvatars = [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop"
    ];

    return (
      <section className="w-full bg-[#f8f9f5] py-24 px-4 md:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tight leading-tight" style={h1Font}>
            {renderTitle(content?.h2_line1 || "Unlock Your Financial")}<br/>
            {renderTitle(content?.h2_line2 || "Investment Opportunity")}
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Left Large Card */}
          <div className="relative group overflow-hidden rounded-[2.5rem] h-[500px] shadow-sm">
            <img 
              src={content?.card_left?.image || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&fit=crop&q=80"} 
              alt="Golden Years"
              className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-6 right-6">
              <ArrowButton />
            </div>
            <div className="absolute bottom-8 left-8 right-8">
               <h3 className="text-2xl font-black text-white leading-tight" style={h1Font}>
                 {content?.card_left?.title || "Navigating the Golden Years"}
               </h3>
            </div>
          </div>

          {/* Center Column */}
          <div className="flex flex-col gap-6 h-[500px]">
             {/* Dynamic CTA Block */}
             <div 
               className="flex-1 rounded-[2.5rem] p-10 flex flex-col justify-between group cursor-pointer shadow-sm"
               style={{ backgroundColor: content?.cta_block?.bg_color || accentColor }}
             >
                <div className="flex flex-col gap-6">
                   <h3 className="text-2xl md:text-3xl font-black text-zinc-950 leading-tight" style={h1Font}>
                     {content?.cta_block?.text || "Your Pathway to Financial Prosperity Starts Here!"}
                   </h3>
                </div>
                <div className="flex justify-end">
                  <ArrowButton className="bg-white/50 backdrop-blur-sm border border-zinc-900/10" />
                </div>
             </div>

             {/* Stats Block */}
             <div className="flex-1 bg-zinc-950 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex -space-x-3">
                      {(content?.stats_block?.review_avatars || fallbackAvatars).slice(0,3).map((url: string, i: number) => (
                        <img key={i} src={url} alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-950 object-cover" />
                      ))}
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white" style={h1Font}>
                        <span className="text-xs mr-1 opacity-50 text-white">▲</span>
                        {content?.stats_block?.value || "77K+"}
                      </span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end text-white/50 text-[10px] font-bold uppercase tracking-widest" style={pFont}>
                      <span>{content?.stats_block?.label || "Lovely Customer"}</span>
                      <span>{content?.stats_block?.percentage || "79.79"}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ backgroundColor: accentColor, width: `${content?.stats_block?.percentage || 79.79}%` }}
                      />
                   </div>
                   <div className="flex justify-between items-center pt-2 group cursor-pointer">
                      <span className="text-white/70 text-xs font-bold" style={pFont}>More Reviews</span>
                      <ArrowButton className="w-8 h-8 opacity-60 group-hover:opacity-100" />
                   </div>
                </div>
             </div>
          </div>

          {/* Right Large Card */}
          <div className="relative group overflow-hidden rounded-[2.5rem] h-[500px] shadow-sm">
            <img 
              src={content?.card_right?.image || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&fit=crop&q=80"} 
              alt="Next Generation"
              className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-6 right-6">
              <ArrowButton />
            </div>
            <div className="absolute bottom-8 left-8 right-8">
               <h3 className="text-2xl font-black text-white leading-tight" style={h1Font}>
                 {content?.card_right?.title || "Growing Wealth for the Next Generation"}
               </h3>
            </div>
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
import { cn } from '@/lib/utils';

const ArrowButton = ({ className }: { className?: string }) => (
  <div className={cn("w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", className)}>
    <ArrowUpRight className="w-5 h-5 text-zinc-950" />
  </div>
);

export default function InvestmentGrid() {
  const global = ${JSON.stringify(config)};
  const content = ${JSON.stringify(content)};
  const settings = ${JSON.stringify(settings)};
  
  const accentColor = settings?.accent_color || '#d9f99d';
  const highlightWord = content?.highlight_word || "Opportunity";
  const animPreset = settings?.animation || 'slide-up';

  const renderTitle = (text: string) => {
    if (!text) return null;
    const parts = text.split(highlightWord);
    if (parts.length === 1) return text;
    return (
      <>
        {parts[0]}
        <span className="relative inline-block px-1">
          <span className="relative z-10">{highlightWord}</span>
          <span 
            className="absolute bottom-1 left-0 w-full h-3 -rotate-2 z-0 opacity-80" 
            style={{ backgroundColor: accentColor }}
          />
        </span>
        {parts[1]}
      </>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: animPreset === 'slide-up' ? 30 : 0, scale: animPreset === 'zoom' ? 0.95 : 1 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fallbackAvatars = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop"
  ];

  return (
    <section className="w-full bg-[#f8f9f5] py-24 px-4 md:px-8 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-4xl mx-auto mb-20 px-4"
      >
        <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tight leading-tight" style={{ fontFamily: global.font_family_heading }}>
          {renderTitle(content?.h2_line1 || "Unlock Your Financial")}<br/>
          {renderTitle(content?.h2_line2 || "Investment Opportunity")}
        </h2>
      </motion.div>

      {/* Grid Layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        
        {/* Left Large Card */}
        <motion.div variants={cardVariants} className="relative group overflow-hidden rounded-[3rem] h-[550px] shadow-sm">
          <img 
            src={content?.card_left?.image || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&fit=crop&q=80"} 
            alt="Left"
            className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-8 right-8">
            <ArrowButton />
          </div>
          <div className="absolute bottom-10 left-10 right-10">
             <h3 className="text-3xl font-black text-white leading-[1.1]" style={{ fontFamily: global.font_family_heading }}>
               {content?.card_left?.title || "Navigating the Golden Years"}
             </h3>
          </div>
        </motion.div>

        {/* Center Column */}
        <div className="flex flex-col gap-6 h-[550px]">
           {/* Top CTA Block */}
           <motion.div 
             variants={cardVariants}
             className="flex-1 rounded-[3rem] p-12 flex flex-col justify-between group cursor-pointer shadow-sm transition-transform hover:scale-[1.02]"
             style={{ backgroundColor: content?.cta_block?.bg_color || accentColor }}
           >
              <h3 className="text-2xl md:text-3xl font-black text-zinc-950 leading-tight" style={{ fontFamily: global.font_family_heading }}>
                {content?.cta_block?.text || "Your Pathway to Financial Prosperity Starts Here!"}
              </h3>
              <div className="flex justify-end pt-4">
                <ArrowButton className="bg-white/50 backdrop-blur-sm border border-zinc-900/10" />
              </div>
           </motion.div>

           {/* Stats Block */}
           <motion.div 
             variants={cardVariants}
             className="flex-1 bg-zinc-950 rounded-[3rem] p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden"
           >
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex -space-x-3">
                    {(content?.stats_block?.review_avatars || fallbackAvatars).slice(0,3).map((url: string, i: number) => (
                      <img key={i} src={url} alt="User" className="w-12 h-12 rounded-full border-2 border-zinc-950 object-cover" />
                    ))}
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-white" style={{ fontFamily: global.font_family_heading }}>
                      <span className="text-xs mr-1 opacity-50 text-white leading-none">▲</span>
                      {content?.stats_block?.value || "77K+"}
                    </span>
                 </div>
              </div>

              <div className="space-y-5 relative z-10">
                 <div className="flex justify-between items-end text-white/40 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ fontFamily: global.font_family_body }}>
                    <span>{content?.stats_block?.label || "Lovely Customer"}</span>
                    <span className="text-white/80">{content?.stats_block?.percentage || "79.79"}%</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: \`\${content?.stats_block?.percentage || 79.79}%\` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: accentColor }}
                    />
                 </div>
                 <div className="flex justify-between items-center pt-3 group cursor-pointer">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: global.font_family_body }}>More Reviews</span>
                    <ArrowButton className="w-8 h-8 opacity-60 group-hover:opacity-100 scale-90" />
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Right Large Card */}
        <motion.div variants={cardVariants} className="relative group overflow-hidden rounded-[3rem] h-[550px] shadow-sm">
          <img 
            src={content?.card_right?.image || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&fit=crop&q=80"} 
            alt="Right"
            className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-8 right-8">
            <ArrowButton />
          </div>
          <div className="absolute bottom-10 left-10 right-10">
             <h3 className="text-3xl font-black text-white leading-[1.1]" style={{ fontFamily: global.font_family_heading }}>
               {content?.card_right?.title || "Growing Wealth for the Next Generation"}
             </h3>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
`
};
