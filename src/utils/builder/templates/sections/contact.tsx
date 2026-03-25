import { cn } from '@/lib/utils';

export const CONTACT_SIMPLE = {
  name: 'Premium Contact Form',
  type: 'section',
  preview: (config: any, content: any, settings: any) => {
    const style = config.button_style || 'solid';
    const align = config.text_alignment || 'center';
    const hierarchy = settings?.hierarchy || 'h2';
    const variant = settings?.layout_variant || 'standard';
    
    const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
    const containerAlign = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';

    const buttonClass = `w-full h-10 rounded-xl transition-all ${
      style === 'solid' ? 'bg-zinc-900' :
      style === 'gradient' ? 'bg-gradient-to-r from-zinc-900 to-zinc-500' :
      style === 'outline' ? 'border-2 border-zinc-900' :
      'bg-zinc-100/50 backdrop-blur-md border border-zinc-200'
    }`;
    
    const isSplit = variant === 'split-reversed';
    const HeadingTag = (hierarchy || 'h2') as any;

    return (
      <section className={cn(
        "py-20 px-8 bg-zinc-50 border-b border-zinc-100",
        alignmentClass,
        variant === 'contained' && "max-w-5xl mx-auto rounded-[3.5rem] my-10 border border-zinc-200"
      )}>
        <div className={cn(
          "max-w-4xl mx-auto grid gap-12 items-center",
          isSplit ? "grid-cols-1 md:grid-cols-2" : "flex flex-col"
        )}>
          <div className={cn("flex flex-col", containerAlign, isSplit && "order-2")}>
            <HeadingTag 
              className={cn(
                "font-black text-zinc-900 tracking-tight mb-2",
                hierarchy === 'h1' ? "text-4xl" : hierarchy === 'h2' ? "text-2xl" : "text-xl"
              )}
              style={{ fontFamily: config.font_family_heading, fontWeight: config.font_weight_heading }}
            >
              Get in Touch
            </HeadingTag>
            <p className="text-xs text-zinc-500 font-medium">We'd love to hear from you. Send us a message.</p>
          </div>
          <div className={cn("w-full space-y-4", isSplit && "order-1")}>
            <div className="h-10 bg-white rounded-xl border border-zinc-200" />
            <div className="h-10 bg-white rounded-xl border border-zinc-200" />
            <div className="h-32 bg-white rounded-xl border border-zinc-200" />
            <div className={`${buttonClass} flex items-center justify-center`}>
              <div className="w-4 h-1 bg-zinc-400/20 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    );
  },
  code: (config: any, content: any) => `
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import config from '../data/config.json';

// Industrial State-Machine Utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function Contact() {
  const settings = config.settings?.CONTACT_SIMPLE || { animation: 'fade' };
  const global = config.styles;
  const align = global.text_alignment || 'left';
  const hierarchy = settings.hierarchy || 'h2';
  const variant = settings.layout_variant || 'standard';
  
  const variants = {
    none: { initial: {}, animate: {} },
    fade: { initial: { opacity: 0 }, whileInView: { opacity: 1 } },
    'slide-up': { initial: { y: 20, opacity: 0 }, whileInView: { y: 0, opacity: 1 } },
    zoom: { initial: { scale: 0.9, opacity: 0 }, whileInView: { scale: 1, opacity: 1 } }
  };

  const selected = variants[settings.animation as keyof typeof variants] || variants.fade;

  const alignmentClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';
  const mx = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  const isSplit = variant === 'split-reversed';
  const HeadingTag = hierarchy as any;

  return (
    <section className={cn(
      "py-32 px-8 bg-zinc-50 overflow-hidden",
      alignmentClass,
      variant === 'contained' && "max-w-7xl mx-auto rounded-[4rem] my-24 border border-zinc-100 shadow-2xl"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto grid gap-24 items-center",
        isSplit ? "grid-cols-1 lg:grid-cols-2" : "flex flex-col"
      )}>
        <motion.div 
          {...selected}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={cn("flex flex-col space-y-12", alignmentClass, isSplit && "order-2")}
        >
          <div className={cn("flex flex-col space-y-6", alignmentClass)}>
            <HeadingTag 
              className={cn(
                "font-black text-zinc-900 tracking-tight leading-none italic",
                hierarchy === 'h1' ? "text-7xl" : hierarchy === 'h2' ? "text-5xl" : "text-3xl"
              )}
              style={{ fontFamily: global.font_family_heading, fontWeight: global.font_weight_heading }}
            >
              Let's build <br/> something great.
            </HeadingTag>
            <p className={cn("text-xl text-zinc-500 font-medium leading-relaxed max-w-md", mx)}>
              Reach out to our elite engineering team to discuss your next digital breakthrough.
            </p>
          </div>
          
          <div className="space-y-8">
             <div className={cn("flex items-center gap-6", align === 'right' && "flex-row-reverse")}>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100">
                   <Mail className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Us</p>
                   <p className="text-sm font-bold text-zinc-900">projects@agency.com</p>
                </div>
             </div>
          </div>
        </motion.div>

        <motion.div 
          {...selected}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={cn(
            "bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-zinc-200 border border-zinc-100 w-full max-w-xl",
            isSplit && "order-1",
            !isSplit && mx
          )}
        >
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Name</label>
                  <input className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-zinc-900 transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Email</label>
                  <input className="w-full h-14 bg-zinc-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-zinc-900 transition-all" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Message</label>
               <textarea rows={4} className="w-full bg-zinc-50 border-none rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-zinc-900 transition-all resize-none" />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full h-16 !shadow-xl !rounded-3xl"
              type="button"
            >
              <Send className="w-4 h-4" />
              Send Brief
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
`
};
